'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Message } from './database.types';
import { formatCurrency } from './utils';
import type { LeaseWithDetails } from '@/hooks/useLeases';
import type { InvoiceWithDetails, PaymentWithDetails } from '@/hooks/useBilling';

// Contract PDF Generation
export function generateContractPDF(lease: LeaseWithDetails): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LEASE AGREEMENT', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contract #: ${lease.id.slice(0, 8).toUpperCase()}`, pageWidth / 2, 28, { align: 'center' });

  // Divider
  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);

  let yPos = 45;

  // Parties Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Landlord: Property Owner`, 20, yPos);
  yPos += 6;
  doc.text(`Tenant: ${lease.tenant.first_name} ${lease.tenant.last_name}`, 20, yPos);
  yPos += 6;
  doc.text(`Email: ${lease.tenant.email || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Phone: ${lease.tenant.phone}`, 20, yPos);
  yPos += 12;

  // Property Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPERTY', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Property: ${lease.unit.property.name}`, 20, yPos);
  yPos += 6;
  doc.text(`Unit: ${lease.unit.name}`, 20, yPos);
  yPos += 6;
  doc.text(`Address: ${lease.unit.property.address}`, 20, yPos);
  yPos += 6;
  if (lease.unit.property.city) {
    doc.text(`City: ${lease.unit.property.city}`, 20, yPos);
    yPos += 6;
  }
  yPos += 6;

  // Lease Terms Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LEASE TERMS', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const leaseTypeLabels: Record<string, string> = {
    'month_to_month': 'Month-to-Month',
    'fixed_term': 'Fixed Term',
    'bedspace': 'Bedspace',
    'boarding_house': 'Boarding House'
  };

  doc.text(`Lease Type: ${leaseTypeLabels[lease.type] || lease.type}`, 20, yPos);
  yPos += 6;
  doc.text(`Start Date: ${new Date(lease.start_date).toLocaleDateString()}`, 20, yPos);
  yPos += 6;
  if (lease.end_date) {
    doc.text(`End Date: ${new Date(lease.end_date).toLocaleDateString()}`, 20, yPos);
    yPos += 6;
  }
  doc.text(`Monthly Rent: ${formatCurrency(lease.monthly_rent)}`, 20, yPos);
  yPos += 6;
  if (lease.deposit_amount) {
    doc.text(`Security Deposit: ${formatCurrency(lease.deposit_amount)}`, 20, yPos);
    yPos += 6;
  }
  doc.text(`Due Day: ${lease.due_day}${getOrdinalSuffix(lease.due_day)} of each month`, 20, yPos);
  yPos += 6;
  doc.text(`Late Fee: ${formatCurrency(lease.late_fee_amount)} (after ${lease.late_fee_grace_days} days)`, 20, yPos);
  yPos += 12;

  // Terms and Conditions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS AND CONDITIONS', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const terms = [
    '1. The Tenant agrees to pay rent on or before the due date specified above.',
    '2. The Tenant shall maintain the premises in good condition.',
    '3. The Tenant shall not make alterations without written consent from the Landlord.',
    '4. The Tenant agrees to comply with all applicable laws and regulations.',
    '5. The security deposit shall be returned within 30 days after lease termination.',
    '6. Either party may terminate with 30 days written notice (for month-to-month).',
    '7. The Landlord reserves the right to inspect the premises with 24-hour notice.',
    '8. Subletting is not permitted without written consent from the Landlord.',
  ];

  terms.forEach(term => {
    const lines = doc.splitTextToSize(term, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 5 + 2;
  });

  yPos += 10;

  // Signature Section
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES', 20, yPos);
  yPos += 15;

  // Landlord Signature
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Landlord:', 20, yPos);
  doc.line(50, yPos, 100, yPos);
  yPos += 6;
  doc.text(`Date: ${lease.landlord_signed_at ? new Date(lease.landlord_signed_at).toLocaleDateString() : '____________'}`, 20, yPos);
  yPos += 15;

  // Tenant Signature
  doc.text('Tenant:', 20, yPos);
  doc.line(50, yPos, 100, yPos);
  yPos += 6;
  doc.text(`Date: ${lease.tenant_signed_at ? new Date(lease.tenant_signed_at).toLocaleDateString() : '____________'}`, 20, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(`Generated on ${new Date().toLocaleString()} by PropManager`, pageWidth / 2, 285, { align: 'center' });

  return doc;
}

// Invoice PDF Generation
export function generateInvoicePDF(invoice: InvoiceWithDetails): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 33, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 40, { align: 'right' });
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, pageWidth - 20, 47, { align: 'right' });

  // Status Badge
  const statusColors: Record<string, string> = {
    paid: '#10B981',
    pending: '#F59E0B',
    overdue: '#EF4444',
    partial: '#3B82F6',
    cancelled: '#6B7280',
    draft: '#9CA3AF'
  };
  doc.setFillColor(statusColors[invoice.status] || '#6B7280');
  doc.roundedRect(pageWidth - 45, 52, 25, 8, 2, 2, 'F');
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.text(invoice.status.toUpperCase(), pageWidth - 32.5, 57.5, { align: 'center' });
  doc.setTextColor(0);

  let yPos = 75;

  // Bill To
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.tenant.first_name} ${invoice.tenant.last_name}`, 20, yPos);
  yPos += 6;
  doc.text(`${invoice.lease.unit.name}, ${invoice.lease.unit.property.name}`, 20, yPos);
  yPos += 6;
  doc.text(invoice.lease.unit.property.address, 20, yPos);
  yPos += 15;

  // Billing Period
  doc.setFont('helvetica', 'bold');
  doc.text('Billing Period:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(invoice.billing_period_start).toLocaleDateString()} - ${new Date(invoice.billing_period_end).toLocaleDateString()}`, 70, yPos);
  yPos += 15;

  // Line Items Table
  const tableData = [
    ['Rent', formatCurrency(invoice.rent_amount)],
  ];

  if (invoice.utilities_amount > 0) {
    tableData.push(['Utilities', formatCurrency(invoice.utilities_amount)]);
  }
  if (invoice.late_fee_amount > 0) {
    tableData.push(['Late Fee', formatCurrency(invoice.late_fee_amount)]);
  }
  if (invoice.other_charges > 0) {
    tableData.push(['Other Charges', formatCurrency(invoice.other_charges)]);
  }
  if (invoice.discount_amount > 0) {
    tableData.push(['Discount', `-${formatCurrency(invoice.discount_amount)}`]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  // Get the final Y position after the table
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Totals
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 120, finalY);
  doc.text(formatCurrency(invoice.total_amount), pageWidth - 20, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Amount Paid:', 120, finalY + 8);
  doc.text(formatCurrency(invoice.amount_paid), pageWidth - 20, finalY + 8, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Balance Due:', 120, finalY + 18);
  doc.text(formatCurrency(invoice.total_amount - invoice.amount_paid), pageWidth - 20, finalY + 18, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128);
  doc.text('Thank you for your payment!', pageWidth / 2, 270, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString()} by PropManager`, pageWidth / 2, 285, { align: 'center' });

  return doc;
}

// Financial Report PDF Generation
export function generateFinancialReportPDF(
  title: string,
  dateRange: { start: Date; end: Date },
  stats: {
    totalRevenue: number;
    collectedAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  },
  invoices: InvoiceWithDetails[],
  payments?: PaymentWithDetails[]
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
    pageWidth / 2, 28, { align: 'center' }
  );

  let yPos = 45;

  // Summary Stats
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPos);
  yPos += 10;

  const summaryData = [
    ['Total Revenue', formatCurrency(stats.totalRevenue)],
    ['Collected', formatCurrency(stats.collectedAmount)],
    ['Pending', formatCurrency(stats.pendingAmount)],
    ['Overdue', formatCurrency(stats.overdueAmount)],
  ];

  autoTable(doc, {
    startY: yPos,
    body: summaryData,
    theme: 'plain',
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Invoices Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoices', 20, yPos);
  yPos += 5;

  const invoiceData = invoices.slice(0, 20).map(inv => [
    inv.invoice_number || inv.id.slice(0, 8),
    `${inv.tenant.first_name} ${inv.tenant.last_name}`,
    new Date(inv.due_date).toLocaleDateString(),
    formatCurrency(inv.total_amount),
    inv.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Invoice #', 'Tenant', 'Due Date', 'Amount', 'Status']],
    body: invoiceData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    margin: { left: 20, right: 20 }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  doc.text(`Generated on ${new Date().toLocaleString()} by PropManager`, pageWidth / 2, 285, { align: 'center' });

  return doc;
}

// Chat Export PDF
export function generateChatExportPDF(
  conversationTitle: string,
  messages: Message[],
  participantNames: { owner: string; tenant: string }
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Chat History Export', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conversation: ${conversationTitle}`, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Exported: ${new Date().toLocaleString()}`, pageWidth / 2, 35, { align: 'center' });

  doc.line(20, 40, pageWidth - 20, 40);

  let yPos = 50;

  messages.forEach((msg) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const senderName = msg.sender_type === 'owner' ? participantNames.owner : participantNames.tenant;
    const timestamp = new Date(msg.created_at).toLocaleString();

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(msg.sender_type === 'owner' ? 59 : 16, msg.sender_type === 'owner' ? 130 : 185, msg.sender_type === 'owner' ? 246 : 129);
    doc.text(`${senderName} - ${timestamp}`, 20, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    if (msg.content) {
      const lines = doc.splitTextToSize(msg.content, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 4 + 3;
    }

    if (msg.attachment_name) {
      doc.setTextColor(100);
      doc.text(`[Attachment: ${msg.attachment_name}]`, 20, yPos);
      yPos += 5;
      doc.setTextColor(0);
    }

    yPos += 5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128);
  const pageCount = doc.internal.pages.length - 1; // pages array has an empty first element
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }

  return doc;
}

// Helper function
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

// Download helper
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
