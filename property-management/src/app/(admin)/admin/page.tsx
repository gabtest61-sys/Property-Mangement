'use client';

import { AdminHeader } from '@/components/admin';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
  Users,
  Building2,
  CreditCard,
  ArrowUpRight,
  DollarSign,
  UserPlus,
  Home,
  Activity,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAdminStats, useAdminUsers, useAdminActivity } from '@/hooks';

export default function AdminDashboardPage() {
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { users, isLoading: usersLoading } = useAdminUsers();
  const { activities, isLoading: activitiesLoading } = useAdminActivity();

  // Get recent users (last 5)
  const recentUsers = users.slice(0, 5);

  // Calculate premium rate
  const premiumRate = stats && stats.totalUsers > 0
    ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
    : '0';

  const platformStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers.toLocaleString() || '0',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Properties',
      value: stats?.totalProperties.toLocaleString() || '0',
      icon: Building2,
      color: 'bg-emerald-500',
    },
    {
      title: 'Premium Users',
      value: stats?.premiumUsers.toLocaleString() || '0',
      icon: CreditCard,
      color: 'bg-amber-500',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (statsLoading && usersLoading) {
    return (
      <>
        <AdminHeader title="Admin Dashboard" subtitle="Platform overview and statistics" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Admin Dashboard"
        subtitle="Platform overview and statistics"
        actions={
          <button
            onClick={() => refetchStats()}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((stat, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-500 text-sm">Live data</span>
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Recent Users</CardTitle>
                <Badge variant="primary" className="bg-indigo-600">
                  <UserPlus className="h-3 w-3 mr-1" />
                  {recentUsers.length} shown
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No users yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Properties</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                {getInitials(user.full_name)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{user.full_name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={user.is_premium ? 'success' : 'default'}>
                              {user.is_premium ? 'Premium' : 'Free'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-300">
                              <Home className="h-4 w-4 text-gray-500" />
                              {user.properties_count}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {formatTimeAgo(user.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Activity */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">System Activity</CardTitle>
                <Activity className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        activity.type === 'user' ? 'bg-blue-500' :
                        activity.type === 'payment' ? 'bg-emerald-500' :
                        activity.type === 'property' ? 'bg-amber-500' :
                        'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.user_email}</p>
                        <p className="text-xs text-gray-600 mt-1">{formatTimeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats?.totalUnits.toLocaleString() || '0'}</p>
              <p className="text-sm text-gray-400 mt-1">Total Units</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats?.totalTenants.toLocaleString() || '0'}</p>
              <p className="text-sm text-gray-400 mt-1">Active Tenants</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{stats?.occupancyRate || '0'}%</p>
              <p className="text-sm text-gray-400 mt-1">Avg Occupancy</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{premiumRate}%</p>
              <p className="text-sm text-gray-400 mt-1">Premium Rate</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
