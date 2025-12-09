'use client';

import { useState } from 'react';
import { Header } from '@/components/layout';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Avatar,
  StatCard,
  Input,
  Modal,
  Select,
  PremiumTeaser,
} from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Calendar,
  Crown,
  Loader2,
  XCircle,
  Download,
  BarChart3,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useInvoices, usePayments } from '@/hooks/useBilling';
import { useLeases } from '@/hooks/useLeases';
import { usePremium } from '@/hooks/usePremium';
import { InvoiceInsert, PaymentInsert } from '@/lib/database.types';
import { generateInvoicePDF, generateFinancialReportPDF } from '@/lib/pdf';

const statusConfig = {
  paid: { label: 'Paid', variant: 'success' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
  overdue: { label: 'Overdue', variant: 'error' as const },
  partial: { label: 'Partial', variant: 'info' as const },
  cancelled: { label: 'Cancelled', variant: 'default' as const },
};

export default function BillingPage() {
  const {
    invoices,
    isLoading,
    createInvoice,
    markAsPaid,
    cancelInvoice,
    generateMonthlyInvoices,
    stats,
  } = useInvoices();
  const { recordPayment } = usePayments();
  const { leases } = useLeases('active');
  const { isPremium, hasFeature } = usePremium();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Form state for new invoice
  const [formData, setFormData] = useState({
    lease_id: '',
    due_date: '',
    rent_amount: '',
    utilities_amount: '',
    other_charges: '',
    notes: '',
  });

  // Form state for payment
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_method: 'bank_transfer' as 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'check' | 'other',
    reference_number: '',
    notes: '',
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const selectedLease = leases.find((l) => l.id === formData.lease_id);
    if (!selectedLease) {
      setError('Please select a valid lease');
      setIsSubmitting(false);
      return;
    }

    const rentAmount = parseFloat(formData.rent_amount) || selectedLease.monthly_rent;
    const utilitiesAmount = parseFloat(formData.utilities_amount) || 0;
    const otherCharges = parseFloat(formData.other_charges) || 0;
    const totalAmount = rentAmount + utilitiesAmount + otherCharges;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const invoiceData: Omit<InvoiceInsert, 'owner_id'> = {
      lease_id: formData.lease_id,
      tenant_id: selectedLease.tenant_id,
      billing_period_start: startOfMonth.toISOString().split('T')[0],
      billing_period_end: endOfMonth.toISOString().split('T')[0],
      due_date: formData.due_date,
      rent_amount: rentAmount,
      utilities_amount: utilitiesAmount,
      other_charges: otherCharges,
      total_amount: totalAmount,
      notes: formData.notes || null,
      status: 'pending',
    };

    const { error: createError } = await createInvoice(invoiceData);

    if (createError) {
      setError(createError.message);
      setIsSubmitting(false);
    } else {
      setIsModalOpen(false);
      setFormData({
        lease_id: '',
        due_date: '',
        rent_amount: '',
        utilities_amount: '',
        other_charges: '',
        notes: '',
      });
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedInvoiceId) {
      setError('No invoice selected');
      setIsSubmitting(false);
      return;
    }

    const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
    if (!selectedInvoice) {
      setError('Invoice not found');
      setIsSubmitting(false);
      return;
    }

    const paymentData: Omit<PaymentInsert, 'owner_id'> = {
      invoice_id: selectedInvoiceId,
      tenant_id: selectedInvoice.tenant_id,
      amount: parseFloat(paymentFormData.amount),
      payment_method: paymentFormData.payment_method,
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: paymentFormData.reference_number || null,
      notes: paymentFormData.notes || null,
      status: 'confirmed',
    };

    const { error: paymentError } = await recordPayment(paymentData);

    if (paymentError) {
      setError(paymentError.message);
      setIsSubmitting(false);
    } else {
      setIsPaymentModalOpen(false);
      setPaymentFormData({
        amount: '',
        payment_method: 'bank_transfer',
        reference_number: '',
        notes: '',
      });
      setSelectedInvoiceId(null);
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    setProcessingId(id);
    await markAsPaid(id);
    setProcessingId(null);
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this invoice?')) {
      setProcessingId(id);
      await cancelInvoice(id);
      setProcessingId(null);
    }
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    const result = await generateMonthlyInvoices();
    if (result.error) {
      setError(result.error.message);
    }
    setIsGenerating(false);
  };

  const openPaymentModal = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      const remainingAmount = invoice.total_amount - (invoice.amount_paid || 0);
      setSelectedInvoiceId(invoiceId);
      setPaymentFormData({
        ...paymentFormData,
        amount: remainingAmount.toString(),
      });
      setIsPaymentModalOpen(true);
    }
  };

  const handleDownloadInvoicePDF = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (invoice) {
      const pdf = generateInvoicePDF(invoice);
      pdf.save(`invoice-${invoice.tenant.first_name}-${invoice.tenant.last_name}-${invoice.due_date}.pdf`);
    }
  };

  const handleExportFinancialReport = () => {
    if (!hasFeature('financialReports')) {
      setIsUpgradeModalOpen(true);
      return;
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const pdf = generateFinancialReportPDF(
      'Monthly Financial Report',
      { start: startOfMonth, end: endOfMonth },
      {
        totalRevenue: stats.totalAmount,
        collectedAmount: stats.collectedAmount,
        pendingAmount: stats.pendingAmount,
        overdueAmount: stats.overdueAmount,
      },
      invoices
    );
    pdf.save(`financial-report-${today.toISOString().split('T')[0]}.pdf`);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const tenantName = `${invoice.tenant.first_name} ${invoice.tenant.last_name}`.toLowerCase();
    const matchesSearch =
      tenantName.includes(searchQuery.toLowerCase()) ||
      invoice.lease.unit.property.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && invoice.status === filterStatus;
  });

  // Get pending and overdue invoices for sidebar
  const upcomingInvoices = invoices.filter(
    (i) => i.status === 'pending' && new Date(i.due_date) > new Date()
  );
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Header
        title="Billing & Payments"
        subtitle="Manage invoices and track payments"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleGenerateInvoices} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Generate Monthly
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Premium Banner - only show if not premium */}
        {!isPremium && (
          <PremiumTeaser
            title="Premium Billing Features"
            description="Unlock automated invoicing, payment reminders, and financial reports"
            features={[
              'Export detailed financial reports',
              'Automated payment reminders',
              'Late fee automation',
            ]}
          />
        )}

        {/* Export Button - show for premium users */}
        {isPremium && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExportFinancialReport}>
              <Download className="h-4 w-4" />
              Export Financial Report
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalAmount)}
            icon={<CreditCard className="h-5 w-5" />}
            variant="gradient"
          />
          <StatCard
            title="Collected"
            value={formatCurrency(stats.collectedAmount)}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            title="Pending"
            value={formatCurrency(stats.pendingAmount)}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="Overdue"
            value={formatCurrency(stats.overdueAmount)}
            icon={<AlertCircle className="h-5 w-5" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Invoices Table */}
          <Card className="lg:col-span-2" padding="none">
            <CardHeader className="p-4 md:p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Invoices</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Status Filters */}
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
                <Badge
                  variant={filterStatus === 'all' ? 'primary' : 'default'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Badge>
                <Badge
                  variant={filterStatus === 'pending' ? 'primary' : 'default'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Badge>
                <Badge
                  variant={filterStatus === 'paid' ? 'primary' : 'default'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setFilterStatus('paid')}
                >
                  Paid
                </Badge>
                <Badge
                  variant={filterStatus === 'overdue' ? 'primary' : 'default'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setFilterStatus('overdue')}
                >
                  Overdue
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No invoices found</p>
                  <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Tenant
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Due Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((invoice) => {
                        const status = invoice.status as keyof typeof statusConfig;
                        const statusInfo = statusConfig[status] || statusConfig.pending;
                        return (
                          <tr
                            key={invoice.id}
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={`${invoice.tenant.first_name} ${invoice.tenant.last_name}`}
                                  size="sm"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {invoice.tenant.first_name} {invoice.tenant.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {invoice.lease.unit.property.name} - {invoice.lease.unit.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(invoice.total_amount)}
                              </span>
                              {invoice.amount_paid > 0 && invoice.status !== 'paid' && (
                                <p className="text-xs text-gray-500">
                                  Paid: {formatCurrency(invoice.amount_paid)}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                              {formatDate(invoice.due_date)}
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={statusInfo.variant} size="sm" dot>
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openPaymentModal(invoice.id)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-600"
                                      onClick={() => handleMarkAsPaid(invoice.id)}
                                      disabled={processingId === invoice.id}
                                    >
                                      {processingId === invoice.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() => handleCancel(invoice.id)}
                                      disabled={processingId === invoice.id}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadInvoicePDF(invoice.id)}
                                    title="Download Invoice PDF"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Invoices */}
            <Card padding="none">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Due</CardTitle>
                  <Badge variant="primary" size="sm">
                    {upcomingInvoices.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {upcomingInvoices.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No upcoming invoices
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingInvoices.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <Avatar
                          name={`${invoice.tenant.first_name} ${invoice.tenant.last_name}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {invoice.tenant.first_name} {invoice.tenant.last_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.lease.unit.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Due {formatDate(invoice.due_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" fullWidth className="mt-4">
                  <Send className="h-4 w-4" />
                  Send All Reminders
                </Button>
              </CardContent>
            </Card>

            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <Card padding="none" className="border-red-200 dark:border-red-800">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-red-600 dark:text-red-400">
                      Overdue
                    </CardTitle>
                    <Badge variant="error" size="sm">
                      {overdueInvoices.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {overdueInvoices.slice(0, 3).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20"
                      >
                        <Avatar
                          name={`${invoice.tenant.first_name} ${invoice.tenant.last_name}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {invoice.tenant.first_name} {invoice.tenant.last_name}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {Math.ceil(
                              (new Date().getTime() - new Date(invoice.due_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days overdue
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    fullWidth
                    className="justify-start"
                    onClick={handleGenerateInvoices}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Receipt className="h-4 w-4 mr-2" />
                    )}
                    Generate Monthly Invoices
                  </Button>
                  <Button variant="ghost" fullWidth className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Auto-Billing
                  </Button>
                  <Button variant="ghost" fullWidth className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Payment History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Invoice"
        description="Generate an invoice for a tenant"
        size="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Select
            label="Select Lease"
            value={formData.lease_id}
            onChange={(e) => {
              const lease = leases.find((l) => l.id === e.target.value);
              setFormData({
                ...formData,
                lease_id: e.target.value,
                rent_amount: lease?.monthly_rent.toString() || '',
              });
            }}
            required
          >
            <option value="">Choose an active lease...</option>
            {leases.map((lease) => (
              <option key={lease.id} value={lease.id}>
                {lease.tenant.first_name} {lease.tenant.last_name} - {lease.unit.property.name} (
                {lease.unit.name})
              </option>
            ))}
          </Select>

          {leases.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No active leases found. Create a contract first.
            </p>
          )}

          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Charges</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Rent Amount"
                type="number"
                placeholder="15000"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                required
              />
              <Input
                label="Utilities"
                type="number"
                placeholder="0"
                value={formData.utilities_amount}
                onChange={(e) => setFormData({ ...formData, utilities_amount: e.target.value })}
              />
              <Input
                label="Other Charges"
                type="number"
                placeholder="0"
                value={formData.other_charges}
                onChange={(e) => setFormData({ ...formData, other_charges: e.target.value })}
              />
            </div>
            {formData.rent_amount && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Total:{' '}
                {formatCurrency(
                  (parseFloat(formData.rent_amount) || 0) +
                    (parseFloat(formData.utilities_amount) || 0) +
                    (parseFloat(formData.other_charges) || 0)
                )}
              </p>
            )}
          </div>

          <Input
            label="Notes (Optional)"
            placeholder="Additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedInvoiceId(null);
        }}
        title="Record Payment"
        description="Record a payment for this invoice"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Input
            label="Amount"
            type="number"
            placeholder="15000"
            value={paymentFormData.amount}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
            required
          />

          <Select
            label="Payment Method"
            value={paymentFormData.payment_method}
            onChange={(e) =>
              setPaymentFormData({
                ...paymentFormData,
                payment_method: e.target.value as typeof paymentFormData.payment_method,
              })
            }
            required
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="gcash">GCash</option>
            <option value="maya">Maya</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="other">Other</option>
          </Select>

          <Input
            label="Reference Number (Optional)"
            placeholder="Transaction ID or reference"
            value={paymentFormData.reference_number}
            onChange={(e) =>
              setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })
            }
          />

          <Input
            label="Notes (Optional)"
            placeholder="Additional notes..."
            value={paymentFormData.notes}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setSelectedInvoiceId(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Premium Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Premium Feature"
        description="Financial reports require a Premium subscription"
      >
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Unlock Financial Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Export detailed financial reports to track your rental income and expenses.
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Monthly income summaries
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Payment collection rates
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Late fee tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Year-end tax reports
            </li>
          </ul>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => {
                setIsUpgradeModalOpen(false);
                window.location.href = '/settings?section=billing';
              }}
            >
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
