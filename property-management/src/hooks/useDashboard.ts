'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ActivityLog } from '@/lib/database.types';

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  activeTenants: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  occupancyRate: number;
  upcomingLeaseExpirations: number;
}

export interface UpcomingPayment {
  id: string;
  tenantName: string;
  unitName: string;
  propertyName: string;
  amount: number;
  dueDate: string;
  status: string;
}

export function useDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setStats(null);
      setRecentActivity([]);
      setUpcomingPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch properties with units
      const { data: properties } = await supabase.from('properties').select('id, units (id, status, monthly_rent)').eq('owner_id', user.id).eq('is_active', true);

      // Calculate property stats
      const allUnits = (properties as { id: string; units: { id: string; status: string; monthly_rent: number | null }[] }[] | null)?.flatMap((p) => p.units) || [];
      const occupiedUnits = allUnits.filter((u) => u.status === 'occupied');
      const vacantUnits = allUnits.filter((u) => u.status === 'vacant');
      const monthlyRevenue = occupiedUnits.reduce((sum, u) => sum + (u.monthly_rent || 0), 0);

      // Fetch active tenants count
      const { count: activeTenants } = await supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'active');

      // Fetch invoices for payment stats
      const { data: invoices } = await supabase.from('invoices').select('id, status, total_amount').eq('owner_id', user.id).in('status', ['pending', 'overdue']);

      const invoiceData = invoices as { id: string; status: string; total_amount: number }[] | null;
      const pendingPayments = invoiceData
        ?.filter((i) => i.status === 'pending')
        .reduce((sum, i) => sum + i.total_amount, 0) || 0;
      const overduePayments = invoiceData
        ?.filter((i) => i.status === 'overdue')
        .reduce((sum, i) => sum + i.total_amount, 0) || 0;

      // Fetch upcoming lease expirations (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { count: upcomingExpirations } = await supabase.from('leases').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'active').lte('end_date', thirtyDaysFromNow.toISOString());

      setStats({
        totalProperties: properties?.length || 0,
        totalUnits: allUnits.length,
        occupiedUnits: occupiedUnits.length,
        vacantUnits: vacantUnits.length,
        activeTenants: activeTenants || 0,
        monthlyRevenue,
        pendingPayments,
        overduePayments,
        occupancyRate: allUnits.length > 0 ? (occupiedUnits.length / allUnits.length) * 100 : 0,
        upcomingLeaseExpirations: upcomingExpirations || 0,
      });

      // Fetch recent activity
      const { data: activity } = await supabase.from('activity_log').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(10);

      setRecentActivity(activity || []);

      // Fetch upcoming payments
      const { data: upcoming } = await supabase.from('invoices').select('id, total_amount, due_date, status, tenant:tenants (first_name, last_name), lease:leases (unit:units (name, property:properties (name)))').eq('owner_id', user.id).in('status', ['pending', 'overdue']).order('due_date', { ascending: true }).limit(5);

      const formattedPayments: UpcomingPayment[] = (upcoming || []).map((inv: {
        id: string;
        total_amount: number;
        due_date: string;
        status: string;
        tenant: { first_name: string; last_name: string } | null;
        lease: { unit: { name: string; property: { name: string } | null } | null } | null;
      }) => ({
        id: inv.id,
        tenantName: inv.tenant ? `${inv.tenant.first_name} ${inv.tenant.last_name}` : 'Unknown',
        unitName: inv.lease?.unit?.name || 'Unknown',
        propertyName: inv.lease?.unit?.property?.name || 'Unknown',
        amount: inv.total_amount,
        dueDate: inv.due_date,
        status: inv.status,
      }));

      setUpcomingPayments(formattedPayments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Log activity
  const logActivity = async (
    activityType: string,
    description: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    try {
      const activityData = { owner_id: user.id, activity_type: activityType, description, entity_type: entityType, entity_id: entityId, metadata };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('activity_log') as any).insert(activityData);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  return {
    stats,
    recentActivity,
    upcomingPayments,
    isLoading,
    error,
    fetchDashboardData,
    logActivity,
  };
}
