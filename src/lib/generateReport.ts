import jsPDF from 'jspdf';
import type { SaleRecord, Expense } from '@/data/menu';
import { categories } from '@/data/menu';

export function generateDailyReport(
  todaySales: SaleRecord[],
  todayExpenses: Expense[],
  todayRevenue: number,
  todayExpenseTotal: number,
  bestSeller: string
) {
  const doc = new jsPDF();
  const orange = '#E84C00';
  const darkText = '#1a1a1a';
  const grayText = '#666666';
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const netProfit = todayRevenue - todayExpenseTotal;
  let y = 20;

  const addDivider = () => {
    doc.setDrawColor(orange);
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;
  };

  const checkPage = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  };

  const formatPeso = (n: number) => `₱${n.toLocaleString()}`;

  // ── Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(orange);
  doc.text("Maifah Bong's Tea Cafe", pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(14);
  doc.text('Daily Sales Report', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(grayText);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth / 2, y, { align: 'center' });
  y += 8;
  addDivider();

  // ── Today's Summary ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(orange);
  doc.text("Today's Summary", 15, y);
  y += 10;

  const summaryItems = [
    ['Total Revenue', formatPeso(todayRevenue)],
    ['Total Orders', todaySales.length.toString()],
    ['Total Expenses', formatPeso(todayExpenseTotal)],
    ['Net Profit', formatPeso(netProfit)],
    ['Best Selling Item', bestSeller],
  ];

  doc.setFontSize(11);
  for (const [label, value] of summaryItems) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    if (label === 'Net Profit') {
      doc.setTextColor(netProfit >= 0 ? '#16a34a' : '#dc2626');
    }
    doc.text(value, pageWidth - 20, y, { align: 'right' });
    doc.setTextColor(darkText);
    y += 7;
  }
  y += 4;
  addDivider();

  // ── Expense Breakdown ──
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(orange);
  doc.text('Expense Breakdown', 15, y);
  y += 10;

  if (todayExpenses.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(grayText);
    doc.text('No expenses recorded today', 20, y);
    y += 10;
  } else {
    // Table header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(grayText);
    doc.text('Name', 20, y);
    doc.text('Category', 90, y);
    doc.text('Amount', pageWidth - 20, y, { align: 'right' });
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkText);
    for (const exp of todayExpenses) {
      checkPage(8);
      doc.text(exp.description.slice(0, 30), 20, y);
      doc.text(exp.category, 90, y);
      doc.text(formatPeso(exp.amount), pageWidth - 20, y, { align: 'right' });
      y += 6;
    }
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Expenses', 20, y);
    doc.text(formatPeso(todayExpenseTotal), pageWidth - 20, y, { align: 'right' });
    y += 8;
  }
  y += 2;
  addDivider();

  // ── Sales by Category ──
  checkPage(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(orange);
  doc.text('Sales by Category', 15, y);
  y += 10;

  const catRevenue: Record<string, number> = {};
  const saleCategories = categories.filter(c => c !== 'All');
  for (const cat of saleCategories) catRevenue[cat] = 0;

  for (const sale of todaySales) {
    for (const item of sale.items) {
      if (catRevenue[item.category] !== undefined) {
        catRevenue[item.category] += item.price * item.quantity;
      }
    }
  }

  const maxCat = saleCategories.reduce((a, b) => (catRevenue[a] >= catRevenue[b] ? a : b), saleCategories[0]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(grayText);
  doc.text('Category', 20, y);
  doc.text('Revenue', 120, y);
  doc.text('%', pageWidth - 20, y, { align: 'right' });
  y += 6;

  doc.setFontSize(10);
  for (const cat of saleCategories) {
    checkPage(8);
    const rev = catRevenue[cat];
    const pct = todayRevenue > 0 ? ((rev / todayRevenue) * 100).toFixed(1) : '0.0';
    const isMax = cat === maxCat && rev > 0;

    if (isMax) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(orange);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkText);
    }
    doc.text(cat + (isMax ? ' ★' : ''), 20, y);
    doc.text(formatPeso(rev), 120, y);
    doc.text(`${pct}%`, pageWidth - 20, y, { align: 'right' });
    y += 6;
  }
  y += 6;
  addDivider();

  // ── Order History ──
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(orange);
  doc.text('Order History', 15, y);
  y += 10;

  if (todaySales.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(grayText);
    doc.text('No orders recorded today', 20, y);
    y += 10;
  } else {
    for (let i = 0; i < todaySales.length; i++) {
      const sale = todaySales[i];
      checkPage(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(darkText);

      const orderTime = new Date(sale.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
      doc.text(`#${i + 1}`, 20, y);
      doc.text(formatPeso(sale.total), 120, y);
      doc.text(`${sale.paymentMethod} • ${orderTime}`, pageWidth - 20, y, { align: 'right' });
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(grayText);
      const itemsText = sale.items.map(it => `${it.name} x${it.quantity}`).join(', ');
      const lines = doc.splitTextToSize(itemsText, pageWidth - 45);
      for (const line of lines) {
        checkPage(6);
        doc.text(line, 25, y);
        y += 5;
      }
      y += 3;
    }
  }
  y += 4;
  addDivider();

  // ── Footer ──
  checkPage(20);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(grayText);
  doc.text("Report generated by Maifah Bong's Tea Cafe POS System", pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(`${dateStr} at ${timeStr}`, pageWidth / 2, y, { align: 'center' });

  // Download
  const fileDate = now.toISOString().split('T')[0];
  doc.save(`MaifahPOS-Report-${fileDate}.pdf`);
}