"use client";

import { Header } from "@/components/layout";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  StatCard,
} from "@/components/ui";
import {
  Download,
  Building2,
  Users,
  CreditCard,
  Eye,
  Crown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const overviewStats = [
  {
    title: "Total Revenue",
    value: formatCurrency(5820000),
    icon: <CreditCard className="h-5 w-5" />,
    trend: { value: 23.5, label: "this year" },
    variant: "gradient" as const,
  },
  {
    title: "Occupancy Rate",
    value: "87.5%",
    icon: <Building2 className="h-5 w-5" />,
    trend: { value: 5.2, label: "vs last quarter" },
  },
  {
    title: "Active Tenants",
    value: "42",
    icon: <Users className="h-5 w-5" />,
    trend: { value: 12.1, label: "vs last year" },
  },
  {
    title: "Property Views",
    value: "2,847",
    icon: <Eye className="h-5 w-5" />,
    trend: { value: 18.3, label: "this month" },
  },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 420000, expenses: 85000 },
  { month: "Feb", revenue: 435000, expenses: 92000 },
  { month: "Mar", revenue: 448000, expenses: 78000 },
  { month: "Apr", revenue: 462000, expenses: 88000 },
  { month: "May", revenue: 475000, expenses: 95000 },
  { month: "Jun", revenue: 485000, expenses: 82000 },
  { month: "Jul", revenue: 498000, expenses: 90000 },
  { month: "Aug", revenue: 512000, expenses: 86000 },
  { month: "Sep", revenue: 520000, expenses: 94000 },
  { month: "Oct", revenue: 535000, expenses: 88000 },
  { month: "Nov", revenue: 548000, expenses: 92000 },
  { month: "Dec", revenue: 485000, expenses: 85000 },
];

const propertyPerformance = [
  { name: "Sunrise Apartments", occupancy: 94, revenue: 2940000, trend: 12.5 },
  {
    name: "Green Valley Residences",
    occupancy: 83,
    revenue: 1872000,
    trend: 8.2,
  },
  { name: "Metro Heights", occupancy: 75, revenue: 1008000, trend: -3.1 },
];

const topMetrics = [
  { label: "Average Rent", value: formatCurrency(14500), change: "+8%" },
  { label: "Vacancy Rate", value: "12.5%", change: "-3%" },
  { label: "Avg. Days to Lease", value: "18 days", change: "-5 days" },
  { label: "Renewal Rate", value: "78%", change: "+12%" },
];

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  return (
    <>
      <Header
        title="Analytics"
        subtitle="Track your property performance and insights"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4" />
              Last 12 Months
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Premium Banner */}
        <Card className="bg-gradient-to-r from-amber-400 to-amber-600 border-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Premium Analytics</h3>
                <p className="text-white/90 text-sm">
                  Unlock AI-powered insights, vacancy predictions, and detailed
                  reports
                </p>
              </div>
            </div>
            <Button className="bg-white text-amber-600 hover:bg-amber-50">
              Upgrade Now
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
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

        {/* Revenue Chart */}
        <Card padding="none">
          <CardHeader className="p-4 md:p-6 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Monthly revenue vs expenses
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48">
              {monthlyRevenue.map((data, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="w-full flex flex-col gap-1 items-center">
                    <div
                      className="w-full max-w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                      style={{
                        height: `${(data.revenue / maxRevenue) * 160}px`,
                      }}
                    />
                    <div
                      className="w-full max-w-8 bg-gray-200 dark:bg-gray-600 rounded-t"
                      style={{
                        height: `${(data.expenses / maxRevenue) * 160}px`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Property Performance */}
          <Card padding="none">
            <CardHeader className="p-4 md:p-6 pb-0">
              <CardTitle>Property Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {propertyPerformance.map((property, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {property.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {property.trend >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            property.trend >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {property.trend > 0 && "+"}
                          {property.trend}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Occupancy</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${property.occupancy}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium dark:text-gray-100">
                            {property.occupancy}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Annual Revenue
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                          {formatCurrency(property.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card padding="none">
            <CardHeader className="p-4 md:p-6 pb-0">
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-4">
                {topMetrics.map((metric, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {metric.value}
                    </p>
                    <Badge
                      variant="success"
                      size="sm"
                      className="mt-2"
                    >
                      {metric.change}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Vacancy Prediction - Premium Feature Teaser */}
              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Premium Feature
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  AI Vacancy Prediction
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Predict when units will become vacant and optimize your
                  occupancy rates.
                </p>
                <Button variant="primary" size="sm" className="mt-3">
                  Unlock Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
