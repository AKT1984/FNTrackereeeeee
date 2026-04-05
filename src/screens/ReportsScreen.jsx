import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis, VictoryGroup, VictoryLegend } from 'victory-native';
import { selectTotalBudget, selectTotalExpenses, selectTotalBalance, selectTransactions } from '../store/modules/transactions/selectors';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  MDL: 'L',
  RUB: '₽',
  UAH: '₴',
};

export default function ReportsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const user = useSelector(state => state.auth.user);
  const currencySymbol = CURRENCY_SYMBOLS[user?.currency || 'USD'] || '$';
  const transactions = useSelector(selectTransactions);
  const categories = useSelector(state => state.categories.categories || []);
  const accounts = useSelector(state => state.accounts.accounts || []);
  const totalBudget = useSelector(selectTotalBudget);
  const totalExpenses = useSelector(selectTotalExpenses);
  const totalBalance = useSelector(selectTotalBalance);

  // Process data for Pie Chart (Expenses by Category)
  const pieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const expensesByCategory = expenses.reduce((acc, curr) => {
      acc[curr.categoryId] = (acc[curr.categoryId] || 0) + (Number(curr.amount) || 0);
      return acc;
    }, {});

    return Object.keys(expensesByCategory)
      .filter(categoryId => expensesByCategory[categoryId] > 0)
      .map((categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          x: category ? category.name : 'Other',
          y: expensesByCategory[categoryId],
          color: category ? category.color : '#94a3b8',
        };
      });
  }, [transactions, categories]);

  // Process data for Bar Chart (Income vs Expense by Month)
  const barData = useMemo(() => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const date = t.date ? (t.date.toDate ? t.date.toDate() : new Date(t.date)) : new Date();
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthYear, income: 0, expense: 0, timestamp: date.getTime() };
      }
      
      if (t.type === 'INCOME') {
        monthlyData[monthYear].income += Number(t.amount) || 0;
      } else {
        monthlyData[monthYear].expense += Number(t.amount) || 0;
      }
    });

    // Sort by date and take the last 6 months
    const sortedMonths = Object.values(monthlyData).sort((a, b) => a.timestamp - b.timestamp).slice(-6);
    
    const incomeData = sortedMonths.map(d => ({ x: d.month, y: d.income }));
    const expenseData = sortedMonths.map(d => ({ x: d.month, y: d.expense }));
    
    // If no data, provide empty defaults to prevent crash
    if (incomeData.length === 0) {
      incomeData.push({ x: 'No Data', y: 0 });
      expenseData.push({ x: 'No Data', y: 0 });
    }

    return { incomeData, expenseData };
  }, [transactions]);

  const exportReport = () => {
    if (Platform.OS === 'web') {
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Financial Report - FinTrack RN</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            h1 { text-align: center; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #f9fafb; color: #4b5563; font-weight: 600; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 30px; margin-top: 20px; }
            .summary-box { padding: 20px; background: #f3f4f6; border-radius: 12px; width: 30%; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .summary-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
            .summary-box p { margin: 0; font-size: 24px; font-weight: bold; }
            .income { color: #22c55e; }
            .expense { color: #ef4444; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Save as PDF / Print</button>
          </div>
          <h1>Financial Report</h1>
          <p style="text-align: center; color: #6b7280;">Generated on ${new Date().toLocaleDateString()}</p>
          
          <div class="summary">
            <div class="summary-box">
              <h3>Total Income</h3>
              <p class="income">${currencySymbol}${totalBudget.toFixed(2)}</p>
            </div>
            <div class="summary-box">
              <h3>Total Expenses</h3>
              <p class="expense">${currencySymbol}${totalExpenses.toFixed(2)}</p>
            </div>
            <div class="summary-box">
              <h3>Net Balance</h3>
              <p class="${totalBalance >= 0 ? 'income' : 'expense'}">${currencySymbol}${totalBalance.toFixed(2)}</p>
            </div>
          </div>

          <h2>Expenses by Category</h2>
          <table>
            <tr><th>Category</th><th>Amount</th><th>% of Total</th></tr>
            ${pieData.length > 0 ? pieData.map(d => {
              const percentage = totalExpenses > 0 ? ((d.y / totalExpenses) * 100).toFixed(1) : 0;
              return `<tr>
                <td>
                  <span style="display:inline-block; width:12px; height:12px; background-color:${d.color}; border-radius:50%; margin-right:8px;"></span>
                  ${d.x}
                </td>
                <td>${currencySymbol}${d.y.toFixed(2)}</td>
                <td>${percentage}%</td>
              </tr>`;
            }).join('') : '<tr><td colspan="3" style="text-align:center;">No expenses recorded</td></tr>'}
          </table>

          <h2>Transaction History</h2>
          <table>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Account</th><th>Type</th><th>Amount</th></tr>
            ${transactions.length > 0 ? [...transactions].sort((a, b) => {
              const dateA = a.date ? (a.date.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime()) : 0;
              const dateB = b.date ? (b.date.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime()) : 0;
              return dateB - dateA;
            }).map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              const acc = accounts.find(a => a.id === t.accountId);
              const dateStr = t.date ? (t.date.toDate ? t.date.toDate().toLocaleDateString() : new Date(t.date).toLocaleDateString()) : 'N/A';
              return `<tr>
                <td>${dateStr}</td>
                <td>${t.description || '-'}</td>
                <td>${cat ? cat.name : '-'}</td>
                <td>${acc ? acc.name : 'Default Account'}</td>
                <td class="${t.type === 'INCOME' ? 'income' : 'expense'}">${t.type}</td>
                <td class="${t.type === 'INCOME' ? 'income' : 'expense'}">${currencySymbol}${Number(t.amount).toFixed(2)}</td>
              </tr>`;
            }).join('') : '<tr><td colspan="6" style="text-align:center;">No transactions found</td></tr>'}
          </table>

          <div class="footer">
            Generated by FinTrack RN
          </div>
          
          <script>
            // Auto-trigger print dialog when opened
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
      } else {
        alert('Please allow popups to generate the report.');
      }
    } else {
      alert('PDF/HTML export is currently only supported on the web version.');
    }
  };

  const textColor = isDarkMode ? '#f3f4f6' : '#111827';
  const axisColor = isDarkMode ? '#4b5563' : '#9ca3af';

  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>Analytics & Reports</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
          <Text style={styles.exportButtonText}>Export PDF/HTML</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard]}>
        <Text style={[styles.cardTitle, isDarkMode ? styles.textLight : styles.textDark]}>Income vs Expenses</Text>
        <View style={styles.chartContainer}>
          <VictoryChart domainPadding={{ x: 30 }} height={250}>
            <VictoryLegend x={50} y={10}
              orientation="horizontal"
              gutter={20}
              style={{ labels: { fill: textColor } }}
              data={[
                { name: "Income", symbol: { fill: "#22c55e" } },
                { name: "Expenses", symbol: { fill: "#ef4444" } }
              ]}
            />
            <VictoryAxis 
              style={{
                axis: { stroke: axisColor },
                tickLabels: { fill: textColor, fontSize: 10, padding: 5 }
              }}
            />
            <VictoryAxis 
              dependentAxis
              tickFormat={(x) => `${currencySymbol}${x}`}
              style={{
                axis: { stroke: axisColor },
                tickLabels: { fill: textColor, fontSize: 10, padding: 5 },
                grid: { stroke: isDarkMode ? '#374151' : '#e5e7eb' }
              }}
            />
            <VictoryGroup offset={15} colorScale={["#22c55e", "#ef4444"]}>
              <VictoryBar 
                data={barData.incomeData} 
                barWidth={10}
                cornerRadius={{ top: 4 }}
              />
              <VictoryBar 
                data={barData.expenseData} 
                barWidth={10}
                cornerRadius={{ top: 4 }}
              />
            </VictoryGroup>
          </VictoryChart>
        </View>
      </View>

      <View style={[styles.card, isDarkMode ? styles.bgDarkCard : styles.bgLightCard, styles.lastCard]}>
        <Text style={[styles.cardTitle, isDarkMode ? styles.textLight : styles.textDark]}>Expenses by Category</Text>
        {pieData.length > 0 ? (
          <View style={styles.pieContainer}>
            <VictoryPie
              height={250}
              data={pieData}
              innerRadius={60}
              colorScale={pieData.map(d => d.color)}
              style={{
                labels: { fill: textColor, fontSize: 12, fontWeight: 'bold' }
              }}
              labels={({ datum }) => `${datum.x}\n$${datum.y}`}
            />
          </View>
        ) : (
          <Text style={[styles.emptyText, isDarkMode ? styles.textGray400 : styles.textGray500]}>
            No expenses recorded yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgLight: { backgroundColor: '#f3f4f6' },
  bgDark: { backgroundColor: '#111827' },
  bgLightCard: { backgroundColor: '#ffffff' },
  bgDarkCard: { backgroundColor: '#1f2937' },
  textLight: { color: '#f3f4f6' },
  textDark: { color: '#111827' },
  textGray400: { color: '#9ca3af' },
  textGray500: { color: '#6b7280' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 40,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -20, // Offset VictoryChart default padding
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
  }
});
