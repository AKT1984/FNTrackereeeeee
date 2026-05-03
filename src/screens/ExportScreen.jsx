import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectTransactions } from '../store/modules/transactions/selectors';
import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';
import { useAppTheme } from '../hooks/useAppTheme';
import { getDateFromTimestamp } from '../utils/format';

if (typeof global !== 'undefined') {
  global.Buffer = global.Buffer || Buffer;
}

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

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

  const getCategoryName = id => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Uncategorized';
  };

  const getCategoryColor = id => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.color : '#94a3b8';
  };

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const escapeCsvValue = value => {
    const str = String(value ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const downloadFileOnWeb = (fileName, mimeType, base64Data) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const saveAndShareFile = async (fileName, mimeType, base64Data) => {
    if (Platform.OS === 'web') {
      downloadFileOnWeb(fileName, mimeType, base64Data);
      return;
    }

    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      throw new Error('Sharing is not available on this device.');
    }

    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle: `Export ${fileName}`,
      UTI: mimeType,
    });
  };

  const exportJSON = async () => {
    clearMessages();

    try {
      const dataStr = JSON.stringify(transactions, null, 2);
      const base64 = Buffer.from(dataStr, 'utf8').toString('base64');

      await saveAndShareFile(
        'fintrack_export.json',
        'application/json',
        base64
      );

      setSuccessMsg('JSON exported successfully!');
    } catch (e) {
      console.error('JSON export failed:', e);
      setErrorMsg('Failed to export JSON.');
    }
  };

  const exportCSV = async () => {
    clearMessages();

    try {
      const headers = [
        'Date',
        'Description',
        'Category',
        'Type',
        `Amount (${currencySymbol})`,
      ];

      const rows = transactions.map(t => {
        const date = getDateFromTimestamp(t.date).toLocaleDateString();

        return [
          date,
          t.description || '',
          getCategoryName(t.categoryId),
          t.type,
          t.amount,
        ]
          .map(escapeCsvValue)
          .join(',');
      });

      const csvContent = [
        headers.map(escapeCsvValue).join(','),
        ...rows,
      ].join('\n');

      const base64 = Buffer.from(csvContent, 'utf8').toString('base64');

      await saveAndShareFile(
        'fintrack_export.csv',
        'text/csv',
        base64
      );

      setSuccessMsg('CSV exported successfully!');
    } catch (e) {
      console.error('CSV export failed:', e);
      setErrorMsg('Failed to export CSV.');
    }
  };

  const exportExcel = async () => {
    clearMessages();
    setIsExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FinTrack RN';

      const sheet1 = workbook.addWorksheet('Transactions');

      sheet1.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Type', key: 'type', width: 15 },
        { header: `Amount (${currencySymbol})`, key: 'amount', width: 15 },
      ];

      sheet1.getRow(1).font = { bold: true };

      transactions.forEach(t => {
        const date = getDateFromTimestamp(t.date).toLocaleDateString();

        sheet1.addRow({
          date,
          description: t.description || '',
          category: getCategoryName(t.categoryId),
          type: t.type,
          amount: Number(t.amount) || 0,
        });
      });

      const sheet2 = workbook.addWorksheet('Summary');

      sheet2.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Total Expenses', key: 'total', width: 15 },
      ];

      sheet2.getRow(1).font = { bold: true };

      const expenses = transactions.filter(t => t.type === 'EXPENSE');

      const expensesByCategory = expenses.reduce((acc, curr) => {
        acc[curr.categoryId] =
          (acc[curr.categoryId] || 0) + (Number(curr.amount) || 0);
        return acc;
      }, {});

      const summaryData = Object.keys(expensesByCategory)
        .map(catId => ({
          name: getCategoryName(catId),
          total: expensesByCategory[catId],
          color: getCategoryColor(catId),
        }))
        .sort((a, b) => b.total - a.total);

      summaryData.forEach(item => {
        sheet2.addRow({
          category: item.name,
          total: item.total,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      await saveAndShareFile(
        'fintrack_export.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        base64
      );

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
        <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>
          Export Data
        </Text>

        <Text style={[styles.subtitle, isDarkMode ? styles.textGray400 : styles.textGray500]}>
          Download your financial data in various formats.
        </Text>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

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
            <Text style={styles.buttonText}>Export as Excel</Text>
          )}
        </TouchableOpacity>
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
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#22c55e',
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});