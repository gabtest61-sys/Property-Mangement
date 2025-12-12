'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import {
  Crown,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const subscriptionStats = [
  { title: 'Active Subscriptions', value: '342', change: '+18', icon: Crown, color: 'bg-amber-500' },
  { title: 'Monthly Revenue', value: formatCurrency(487500), change: '+23.1%', icon: DollarSign, color: 'bg-emerald-500' },
  { title: 'Churn Rate', value: '2.4%', change: '-0.8%', icon: TrendingUp, color: 'bg-blue-500' },
  { title: 'Avg. Lifetime Value', value: formatCurrency(12500), change: '+15%', icon: Users, color: 'bg-indigo-500' },
];

const recentSubscriptions = [
  {
    id: '1',
    user: 'Maria Santos',
    email: 'maria@example.com',
    plan: 'Premium Annual',
    amount: 9999,
    status: 'active',
    started: '2024-01-15',
    expires: '2025-01-15',
    action: 'renewed',
  },
  {
    id: '2',
    user: 'Juan Cruz',
    email: 'juan@example.com',
    plan: 'Premium Monthly',
    amount: 999,
    status: 'active',
    started: '2024-12-01',
    expires: '2025-01-01',
    action: 'new',
  },
  {
    id: '3',
    user: 'Ana Reyes',
    email: 'ana@example.com',
    plan: 'Premium Annual',
    amount: 9999,
    status: 'expiring',
    started: '2024-01-20',
    expires: '2024-12-20',
    action: 'expiring',
  },
  {
    id: '4',
    user: 'Pedro Garcia',
    email: 'pedro@example.com',
    plan: 'Premium Monthly',
    amount: 999,
    status: 'cancelled',
    started: '2024-06-01',
    expires: '2024-12-01',
    action: 'cancelled',
  },
  {
    id: '5',
    user: 'Rosa Mendoza',
    email: 'rosa@example.com',
    plan: 'Premium Annual',
    amount: 9999,
    status: 'active',
    started: '2024-03-10',
    expires: '2025-03-10',
    action: 'upgraded',
  },
];

const plans = [
  {
    name: 'Free',
    price: 0,
    users: 942,
    features: ['Up to 3 properties', '10 units max', 'Basic support'],
  },
  {
    name: 'Premium Monthly',
    price: 999,
    users: 198,
    features: ['Unlimited properties', 'Unlimited units', 'Priority support', 'Contract templates', 'Analytics'],
  },
  {
    name: 'Premium Annual',
    price: 9999,
    users: 144,
    features: ['All monthly features', '2 months free', 'Dedicated support', 'Custom branding'],
  },
];

export default function AdminSubscriptionsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'expiring':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'new':
        return <Badge variant="success">New</Badge>;
      case 'renewed':
        return <Badge variant="primary" className="bg-blue-500/20 text-blue-400">Renewed</Badge>;
      case 'upgraded':
        return <Badge variant="primary" className="bg-indigo-500/20 text-indigo-400">Upgraded</Badge>;
      case 'expiring':
        return <Badge variant="warning">Expiring Soon</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <AdminHeader
        title="Subscriptions"
        subtitle="Manage premium subscriptions and plans"
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Export Report
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subscriptionStats.map((stat, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500 text-sm">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Subscriptions */}
          <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Expires</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-white">{sub.user}</p>
                            <p className="text-sm text-gray-500">{sub.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{sub.plan}</td>
                        <td className="py-3 px-4 text-white font-medium">
                          {formatCurrency(sub.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(sub.status)}
                            <span className={cn(
                              'capitalize',
                              sub.status === 'active' && 'text-emerald-400',
                              sub.status === 'expiring' && 'text-amber-400',
                              sub.status === 'cancelled' && 'text-red-400'
                            )}>
                              {sub.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(sub.expires).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">{getActionBadge(sub.action)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Plans Overview */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white">Plans Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gray-800 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {plan.price > 0 && <Crown className="h-4 w-4 text-amber-500" />}
                      <span className="font-semibold text-white">{plan.name}</span>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400">{plan.users} users</span>
                  </div>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <p key={i} className="text-xs text-gray-500">
                        {feature}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-left">
                <Crown className="h-6 w-6 text-amber-500 mb-2" />
                <p className="font-medium text-white">Grant Premium</p>
                <p className="text-xs text-gray-500">Give user premium access</p>
              </button>
              <button className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-left">
                <RefreshCw className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium text-white">Extend Subscription</p>
                <p className="text-xs text-gray-500">Add time to subscription</p>
              </button>
              <button className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-left">
                <DollarSign className="h-6 w-6 text-emerald-500 mb-2" />
                <p className="font-medium text-white">Apply Discount</p>
                <p className="text-xs text-gray-500">Create promotional offer</p>
              </button>
              <button className="p-4 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-left">
                <XCircle className="h-6 w-6 text-red-500 mb-2" />
                <p className="font-medium text-white">Cancel Subscription</p>
                <p className="text-xs text-gray-500">End user subscription</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
