'use client';

import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Avatar, StatCard, Input } from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  Download,
  CreditCard,
  TrendingUp,
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const billingStats = [
  {
    title: 'Total Revenue (This Month)',
    value: formatCurrency(485000),
    icon: <CreditCard className="h-5 w-5" />,
    trend: { value: 15.3, label: 'vs last month' },
    variant: 'gradient' as const,
  },
  {
    title: 'Collected',
    value: formatCurrency(425000),
    icon: <CheckCircle className="h-5 w-5" />,
    trend: { value: 8.2, label: 'vs last month' },
  },
  {
    title: 'Pending',
    value: formatCurrency(45000),
    icon: <Clock className="h-5 w-5" />,
    trend: { value: -12.5, label: 'vs last month' },
  },
  {
    title: 'Overdue',
    value: formatCurrency(15000),
    icon: <AlertCircle className="h-5 w-5" />,
    trend: { value: -5.1, label: 'vs last month' },
  },
];

const recentPayments = [
  {
    id: 1,
    tenant: 'Juan Cruz',
    property: 'Sunrise Apartments - Unit 203',
    amount: 12500,
    date: '2024-12-05',
    status: 'paid',
    method: 'Bank Transfer',
  },
  {
    id: 2,
    tenant: 'Maria Santos',
    property: 'Green Valley - Unit 105',
    amount: 15000,
    date: '2024-12-03',
    status: 'paid',
    method: 'GCash',
  },
  {
    id: 3,
    tenant: 'Pedro Garcia',
    property: 'Metro Heights - Unit 401',
    amount: 18000,
    date: '2024-12-01',
    status: 'overdue',
    method: '-',
  },
  {
    id: 4,
    tenant: 'Ana Reyes',
    property: 'Sunrise Apartments - Unit 301',
    amount: 14000,
    date: '2024-12-15',
    status: 'pending',
    method: '-',
  },
];

const upcomingInvoices = [
  { tenant: 'Rosa Martinez', unit: 'Unit 304', amount: 12500, dueDate: '2024-12-15' },
  { tenant: 'Carlos Reyes', unit: 'Unit 102', amount: 18000, dueDate: '2024-12-15' },
  { tenant: 'Elena Garcia', unit: 'Unit 205', amount: 14000, dueDate: '2024-12-20' },
];

const statusConfig = {
  paid: { label: 'Paid', variant: 'success' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
  overdue: { label: 'Overdue', variant: 'error' as const },
};

export default function BillingPage() {
  return (
    <>
      <Header
        title="Billing & Payments"
        subtitle="Manage invoices and track payments"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {billingStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              variant={stat.variant}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <Card className="lg:col-span-2" padding="none">
            <CardHeader className="p-4 md:p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Recent Payments</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-48"
                  />
                  <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
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
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => {
                      const statusInfo = statusConfig[payment.status as keyof typeof statusConfig];
                      return (
                        <tr
                          key={payment.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={payment.tenant} size="sm" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {payment.tenant}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {payment.property}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {formatDate(payment.date)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={statusInfo.variant} size="sm" dot>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {payment.method}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Invoices */}
            <Card padding="none">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Invoices</CardTitle>
                  <Badge variant="primary" size="sm">
                    {upcomingInvoices.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {upcomingInvoices.map((invoice, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <Avatar name={invoice.tenant} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {invoice.tenant}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Due {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" fullWidth className="mt-4">
                  <Send className="h-4 w-4" />
                  Send All Reminders
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" fullWidth className="justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Monthly Report
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
    </>
  );
}
