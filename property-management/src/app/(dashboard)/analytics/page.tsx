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
  Crown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";
import { useInvoices } from "@/hooks/useBilling";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { isPremium } = useAuth();
  const { properties, stats: propertyStats, isLoading: propertiesLoading } = useProperties();
  const { stats: tenantStats, isLoading: tenantsLoading } = useTenants();
  const { stats: invoiceStats, isLoading: invoicesLoading } = useInvoices();

  const isLoading = propertiesLoading || tenantsLoading || invoicesLoading;

  // Calculate real stats
  const overviewStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(invoiceStats?.collectedAmount || 0),
      icon: <CreditCard className="h-5 w-5" />,
      trend: { value: 0, label: "collected" },
      variant: "gradient" as const,
    },
    {
      title: "Occupancy Rate",
      value: `${Math.round(propertyStats?.overallOccupancy || 0)}%`,
      icon: <Building2 className="h-5 w-5" />,
      trend: { value: propertyStats?.totalOccupied || 0, label: "occupied units" },
    },
    {
      title: "Active Tenants",
      value: tenantStats?.activeTenants?.toString() || "0",
      icon: <Users className="h-5 w-5" />,
      trend: { value: tenantStats?.applyingTenants || 0, label: "applying" },
    },
    {
      title: "Total Properties",
      value: propertyStats?.totalProperties?.toString() || "0",
      icon: <Building2 className="h-5 w-5" />,
      trend: { value: propertyStats?.totalUnits || 0, label: "total units" },
    },
  ];

  // Use real property data for performance
  const propertyPerformance = properties.slice(0, 3).map((property) => ({
    name: property.name,
    occupancy: Math.round(property.occupancyRate),
    revenue: property.monthlyRevenue * 12,
    trend: 0,
  }));

  // Calculate real metrics
  const avgRent = propertyStats?.totalUnits > 0
    ? propertyStats.totalRevenue / propertyStats.totalOccupied
    : 0;
  const vacancyRate = propertyStats?.totalUnits > 0
    ? ((propertyStats.totalUnits - propertyStats.totalOccupied) / propertyStats.totalUnits) * 100
    : 0;

  const topMetrics = [
    { label: "Average Rent", value: formatCurrency(avgRent || 0), change: "per unit" },
    { label: "Vacancy Rate", value: `${vacancyRate.toFixed(1)}%`, change: `${propertyStats?.totalUnits - propertyStats?.totalOccupied} vacant` },
    { label: "Total Units", value: propertyStats?.totalUnits?.toString() || "0", change: "units" },
    { label: "Pending Amount", value: formatCurrency(invoiceStats?.pendingAmount || 0), change: "to collect" },
  ];

  // Mock monthly data (would need actual data from DB)
  const monthlyRevenue = [
    { month: "Jan", revenue: 0, expenses: 0 },
    { month: "Feb", revenue: 0, expenses: 0 },
    { month: "Mar", revenue: 0, expenses: 0 },
    { month: "Apr", revenue: 0, expenses: 0 },
    { month: "May", revenue: 0, expenses: 0 },
    { month: "Jun", revenue: 0, expenses: 0 },
    { month: "Jul", revenue: 0, expenses: 0 },
    { month: "Aug", revenue: 0, expenses: 0 },
    { month: "Sep", revenue: 0, expenses: 0 },
    { month: "Oct", revenue: 0, expenses: 0 },
    { month: "Nov", revenue: 0, expenses: 0 },
    { month: "Dec", revenue: invoiceStats?.collectedAmount || 0, expenses: 0 },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

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
        {/* Premium Banner - only show if not premium */}
        {!isPremium && (
          <Card className="bg-linear-to-r from-amber-400 to-amber-600 border-none">
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
        )}

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
              {propertyPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No properties yet</p>
                  <p className="text-sm mt-1">Add properties to see performance data</p>
                </div>
              ) : (
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
              )}
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
