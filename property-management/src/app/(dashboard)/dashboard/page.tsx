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
  Plus,
  ArrowRight,
  Home,
  BedDouble,
  AlertCircle,
  MessageSquare,
  FileText,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useDashboard, useProperties } from '@/hooks';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { stats, recentActivity, upcomingPayments, isLoading } = useDashboard();
  const { properties } = useProperties();

  // Get top 3 properties by revenue
  const topProperties = properties
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 3);

  const dashboardStats = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties.toString() || '0',
      icon: <Building2 className="h-5 w-5" />,
      trend: { value: 0, label: 'properties' },
      variant: 'gradient' as const,
    },
    {
      title: 'Total Units',
      value: stats?.totalUnits.toString() || '0',
      icon: <Home className="h-5 w-5" />,
      trend: { value: stats?.occupancyRate || 0, label: '% occupied' },
    },
    {
      title: 'Active Tenants',
      value: stats?.activeTenants.toString() || '0',
      icon: <Users className="h-5 w-5" />,
      trend: { value: 0, label: 'tenants' },
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: <CreditCard className="h-5 w-5" />,
      trend: { value: 0, label: 'this month' },
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return { icon: CreditCard, color: 'bg-green-500' };
      case 'tenant':
        return { icon: Users, color: 'bg-blue-500' };
      case 'maintenance':
        return { icon: AlertCircle, color: 'bg-amber-500' };
      case 'contract':
        return { icon: FileText, color: 'bg-cyan-500' };
      default:
        return { icon: AlertCircle, color: 'bg-gray-500' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

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
        title="Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || 'User'}! Here's your property overview.`}
        actions={
          <Link href="/properties">
            <Button>
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => (
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
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">Activity will appear here as you use the app</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const { icon: Icon, color } = getActivityIcon(activity.activity_type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${color} text-white shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              {upcomingPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <Avatar name={payment.tenantName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {payment.tenantName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.unitName}
                        </p>
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
                          {payment.status === 'overdue'
                            ? 'Overdue'
                            : new Date(payment.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/billing">
                <Button variant="outline" fullWidth className="mt-4">
                  View All Payments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Property Performance */}
        <Card padding="none">
          <CardHeader className="p-4 md:p-6 pb-0 md:pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Top Performing Properties</CardTitle>
              <Link href="/properties">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {topProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No properties yet</p>
                <p className="text-sm mt-1">Add your first property to get started</p>
                <Link href="/properties">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4" />
                    Add Property
                  </Button>
                </Link>
              </div>
            ) : (
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
                                {property.city || property.address}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-gray-100">
                              {property.totalUnits}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-[100px]">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${property.occupancyRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {Math.round(property.occupancyRate)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(property.monthlyRevenue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (Mobile) */}
        <div className="lg:hidden">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/properties">
              <button className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Add Property</span>
              </button>
            </Link>
            <Link href="/tenants">
              <button className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium">Add Tenant</span>
              </button>
            </Link>
            <Link href="/contracts">
              <button className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <FileText className="h-6 w-6" />
                <span className="text-sm font-medium">New Contract</span>
              </button>
            </Link>
            <Link href="/messages">
              <button className="w-full flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm font-medium">Send Message</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
