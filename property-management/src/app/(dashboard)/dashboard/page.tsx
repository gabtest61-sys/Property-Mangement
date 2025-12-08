'use client';

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
} from '@/components/ui';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowRight,
  Home,
  BedDouble,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const stats = [
  {
    title: 'Total Properties',
    value: '12',
    icon: <Building2 className="h-5 w-5" />,
    trend: { value: 8.2, label: 'vs last month' },
    variant: 'gradient' as const,
  },
  {
    title: 'Total Units',
    value: '48',
    icon: <Home className="h-5 w-5" />,
    trend: { value: 12.5, label: 'vs last month' },
  },
  {
    title: 'Active Tenants',
    value: '42',
    icon: <Users className="h-5 w-5" />,
    trend: { value: 4.1, label: 'vs last month' },
  },
  {
    title: 'Monthly Revenue',
    value: formatCurrency(485000),
    icon: <CreditCard className="h-5 w-5" />,
    trend: { value: 15.3, label: 'vs last month' },
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'payment',
    title: 'Rent payment received',
    description: 'Juan Cruz paid rent for Unit 203',
    amount: '+₱12,500',
    time: '2 hours ago',
    icon: CreditCard,
    iconColor: 'bg-green-500',
  },
  {
    id: 2,
    type: 'tenant',
    title: 'New tenant application',
    description: 'Maria Santos applied for Unit 105',
    time: '4 hours ago',
    icon: Users,
    iconColor: 'bg-blue-500',
  },
  {
    id: 3,
    type: 'maintenance',
    title: 'Maintenance request',
    description: 'Plumbing issue reported in Unit 302',
    time: '5 hours ago',
    icon: AlertCircle,
    iconColor: 'bg-amber-500',
  },
  {
    id: 4,
    type: 'contract',
    title: 'Contract signed',
    description: 'Ana Reyes signed lease for Unit 401',
    time: '1 day ago',
    icon: FileText,
    iconColor: 'bg-cyan-500',
  },
];

const upcomingPayments = [
  {
    id: 1,
    tenant: 'Pedro Garcia',
    unit: 'Unit 201',
    amount: 15000,
    dueDate: '2024-12-15',
    status: 'upcoming',
  },
  {
    id: 2,
    tenant: 'Rosa Martinez',
    unit: 'Unit 304',
    amount: 12500,
    dueDate: '2024-12-15',
    status: 'upcoming',
  },
  {
    id: 3,
    tenant: 'Carlos Reyes',
    unit: 'Unit 102',
    amount: 18000,
    dueDate: '2024-12-10',
    status: 'overdue',
  },
];

const topProperties = [
  {
    id: 1,
    name: 'Sunrise Apartments',
    location: 'Makati City',
    units: 16,
    occupancy: 94,
    revenue: 245000,
  },
  {
    id: 2,
    name: 'Green Valley Residences',
    location: 'Quezon City',
    units: 12,
    occupancy: 83,
    revenue: 156000,
  },
  {
    id: 3,
    name: 'Metro Heights',
    location: 'Pasig City',
    units: 20,
    occupancy: 75,
    revenue: 84000,
  },
];

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Welcome back, John! Here's your property overview."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2" padding="none">
            <CardHeader className="p-4 md:p-6 pb-0 md:pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${activity.iconColor} text-white shrink-0`}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {activity.description}
                          </p>
                        </div>
                        {activity.amount && (
                          <span className="text-green-600 dark:text-green-400 font-semibold whitespace-nowrap">
                            {activity.amount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card padding="none">
            <CardHeader className="p-4 md:p-6 pb-0 md:pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Payments</CardTitle>
                <Badge variant="primary" size="sm">
                  {upcomingPayments.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <Avatar name={payment.tenant} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {payment.tenant}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{payment.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </p>
                      <Badge
                        variant={payment.status === 'overdue' ? 'error' : 'warning'}
                        size="sm"
                        dot
                      >
                        {payment.status === 'overdue' ? 'Overdue' : 'Dec 15'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" fullWidth className="mt-4">
                View All Payments
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Property Performance */}
        <Card padding="none">
          <CardHeader className="p-4 md:p-6 pb-0 md:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Top Performing Properties</CardTitle>
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Property
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Units
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Occupancy
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {property.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {property.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-100">{property.units}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-[100px]">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${property.occupancy}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {property.occupancy}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(property.revenue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions (Mobile) */}
        <div className="lg:hidden">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <Plus className="h-6 w-6" />
              <span className="text-sm font-medium">Add Property</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium">Add Tenant</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">New Contract</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm font-medium">Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
