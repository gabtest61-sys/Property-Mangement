'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Home,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const reportCategories = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'User Growth', icon: Users },
  { id: 'revenue', label: 'Revenue', icon: DollarSign },
  { id: 'properties', label: 'Properties', icon: Building2 },
];

const overviewMetrics = [
  { label: 'Total Users', value: '1,284', change: '+12.5%', trend: 'up' },
  { label: 'Active Users (30d)', value: '892', change: '+8.3%', trend: 'up' },
  { label: 'New Users (30d)', value: '156', change: '+23.1%', trend: 'up' },
  { label: 'Churn Rate', value: '2.4%', change: '-0.8%', trend: 'down' },
];

const revenueData = [
  { month: 'Jul', revenue: 320000, subscriptions: 285 },
  { month: 'Aug', revenue: 348000, subscriptions: 298 },
  { month: 'Sep', revenue: 385000, subscriptions: 312 },
  { month: 'Oct', revenue: 412000, subscriptions: 325 },
  { month: 'Nov', revenue: 458000, subscriptions: 338 },
  { month: 'Dec', revenue: 487500, subscriptions: 342 },
];

const topRegions = [
  { region: 'Metro Manila', users: 542, properties: 1847, percentage: 42 },
  { region: 'Cebu', users: 198, properties: 623, percentage: 15 },
  { region: 'Davao', users: 156, properties: 498, percentage: 12 },
  { region: 'Pampanga', users: 134, properties: 387, percentage: 10 },
  { region: 'Others', users: 254, properties: 492, percentage: 21 },
];

const reportTypes = [
  { name: 'User Activity Report', description: 'Daily/weekly active users, engagement metrics', icon: Users },
  { name: 'Revenue Report', description: 'Subscription revenue, payment history', icon: DollarSign },
  { name: 'Property Analytics', description: 'Property statistics, occupancy rates', icon: Building2 },
  { name: 'Tenant Report', description: 'Tenant demographics, lease statistics', icon: Home },
  { name: 'Transaction Log', description: 'All financial transactions', icon: FileText },
];

export default function AdminReportsPage() {
  const [activeCategory, setActiveCategory] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <>
      <AdminHeader
        title="Reports & Analytics"
        subtitle="Platform performance and insights"
        actions={
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {reportCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewMetrics.map((metric, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className="text-emerald-500 text-sm">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Revenue Trend</CardTitle>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">
                  +23.1% vs last period
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Simple bar chart */}
              <div className="flex items-end justify-between gap-2 h-48">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-500"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue (6 months)</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg. Monthly</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0) / 6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Regions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white">Top Regions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {topRegions.map((region, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{region.region}</span>
                    <span className="text-gray-400 text-sm">{region.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{region.users} users</span>
                    <span>{region.properties} properties</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Downloadable Reports */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Generate Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTypes.map((report, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-indigo-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <report.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="font-medium text-white mt-3">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Health */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white font-medium">System Status</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-2">Operational</p>
              <p className="text-xs text-gray-500 mt-1">99.9% uptime this month</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                <span className="text-white font-medium">API Requests</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">2.4M</p>
              <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-400" />
                <span className="text-white font-medium">Avg Response Time</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">142ms</p>
              <p className="text-xs text-gray-500 mt-1">-12ms vs last week</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
