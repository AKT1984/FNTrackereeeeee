import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { selectTransactions } from '../store/modules/transactions/selectors';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useAppTheme } from '../hooks/useAppTheme';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  MDL: 'L',
  RUB: '₽',
  UAH: '₴',
};

export default function ExportScreen() {
  const isDarkMode = useAppTheme();
  const user = useSelector(state => state.auth.user);
  const currencySymbol = CURRENCY_SYMBOLS[user?.currency || 'USD'] || '$';
  const transactions = useSelector(selectTransactions);
  const categories = useSelector(state => state.categories.categories || []);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Uncategorized';
  };

  const getCategoryColor = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.color : '#94a3b8';
  };

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const exportJSON = () => {
    clearMessages();
    try {
      const dataStr = JSON.stringify(transactions, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      saveAs(blob, 'fintrack_export.json');
      setSuccessMsg('JSON exported successfully!');
    } catch (e) {
      setErrorMsg('Failed to export JSON.');
    }
  };

  const exportCSV = () => {
    clearMessages();
    try {
      const headers = ['Date', 'Description', 'Category', 'Type', `Amount (${currencySymbol})`];
      const rows = transactions.map(t => {
        const date = t.date ? (t.date.toDate ? t.date.toDate().toLocaleDateString() : new Date(t.date).toLocaleDateString()) : '';
        return [
          date,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          `"${getCategoryName(t.categoryId)}"`,
          t.type,
          t.amount
        ].join(',');
      });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'fintrack_export.csv');
      setSuccessMsg('CSV exported successfully!');
    } catch (e) {
      setErrorMsg('Failed to export CSV.');
    }
  };

  const exportExcel = async () => {
    clearMessages();
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FinTrack RN';
      
      // Sheet 1: Transactions
      const sheet1 = workbook.addWorksheet('Transactions');
      sheet1.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Type', key: 'type', width: 15 },
        { header: `Amount (${currencySymbol})`, key: 'amount', width: 15 }
      ];
      
      sheet1.getRow(1).font = { bold: true };
      
      transactions.forEach(t => {
        const date = t.date ? (t.date.toDate ? t.date.toDate().toLocaleDateString() : new Date(t.date).toLocaleDateString()) : '';
        sheet1.addRow({
          date,
          description: t.description,
          category: getCategoryName(t.categoryId),
          type: t.type,
          amount: Number(t.amount)
        });
      });

      // Sheet 2: Summary & Graph
      const sheet2 = workbook.addWorksheet('Summary');
      sheet2.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Total Expenses', key: 'total', width: 15 }
      ];
      sheet2.getRow(1).font = { bold: true };

      const expenses = transactions.filter(t => t.type === 'EXPENSE');
      const expensesByCategory = expenses.reduce((acc, curr) => {
        acc[curr.categoryId] = (acc[curr.categoryId] || 0) + (Number(curr.amount) || 0);
        return acc;
      }, {});

      const summaryData = Object.keys(expensesByCategory).map(catId => ({
        name: getCategoryName(catId),
        total: expensesByCategory[catId],
        color: getCategoryColor(catId)
      })).sort((a, b) => b.total - a.total);

      summaryData.forEach(item => {
        sheet2.addRow({ category: item.name, total: item.total });
      });

      // Generate Pie Chart Image
      if (summaryData.length > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        let total = summaryData.reduce((sum, item) => sum + item.total, 0);
        let startAngle = 0;
        
        const centerX = 200;
        const centerY = 200;
        const radius = 150;

        // Draw pie slices
        summaryData.forEach(item => {
          const sliceAngle = (item.total / total) * 2 * Math.PI;
          ctx.fillStyle = item.color || '#000000';
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fill();
          startAngle += sliceAngle;
        });

        // Draw legend
        ctx.font = '16px Arial';
        let legendY = 50;
        summaryData.forEach(item => {
          ctx.fillStyle = item.color || '#000000';
          ctx.fillRect(400, legendY - 12, 15, 15);
          ctx.fillStyle = '#000000';
          ctx.fillText(`${item.name} (${currencySymbol}${item.total.toFixed(2)})`, 425, legendY);
          legendY += 30;
        });

        const base64Image = canvas.toDataURL('image/png');
        const imageId = workbook.addImage({
          base64: base64Image,
          extension: 'png',
        });
        
        sheet2.addImage(imageId, {
          tl: { col: 3, row: 1 },
          ext: { width: 600, height: 400 }
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'fintrack_export.xlsx');
      setSuccessMsg('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export failed:', error);
      setErrorMsg('Failed to export Excel file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>Export Data</Text>
        <Text style={[styles.subtitle, isDarkMode ? styles.textGray400 : styles.textGray500]}>
          Download your financial data in various formats.
        </Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

        {Platform.OS !== 'web' ? (
          <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
            <Text style={[styles.description, isDarkMode ? styles.textLight : styles.textDark]}>
              Data export is currently only supported on the web version of FinTrack RN. Please log in from a browser to download your data.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.btnJson]} 
              onPress={exportJSON}
              disabled={isExporting}
            >
              <Text style={styles.buttonText}>Export as JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.btnCsv]} 
              onPress={exportCSV}
              disabled={isExporting}
            >
              <Text style={styles.buttonText}>Export as CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.btnExcel]} 
              onPress={exportExcel}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Export as Excel (with Graphs)</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  textLight: { color: '#f3f4f6' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnJson: { backgroundColor: '#8b5cf6' },
  btnCsv: { backgroundColor: '#10b981' },
  btnExcel: { backgroundColor: '#3b82f6' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#ef4444', marginBottom: 16, fontSize: 14, textAlign: 'center' },
  successText: { color: '#22c55e', marginBottom: 16, fontSize: 14, textAlign: 'center' },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  description: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
