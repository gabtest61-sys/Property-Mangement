'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Tenant, TenantInsert, TenantUpdate, Lease, Unit, Property } from '@/lib/database.types';

export interface TenantWithLease extends Tenant {
  currentLease?: Lease & {
    unit: Unit & {
      property: Property;
    };
  };
}

export function useTenants(status?: 'active' | 'applying' | 'all') {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchTenants = useCallback(async () => {
    if (!user) {
      setTenants([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id);

      // Filter by status
      if (status === 'active') {
        query = query.eq('status', 'active');
      } else if (status === 'applying') {
        query = query.in('status', ['applying', 'approved']);
      }

      const { data: tenantsData, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch current leases for active tenants
      const tenantsWithLeases: TenantWithLease[] = await Promise.all(
        ((tenantsData || []) as Tenant[]).map(async (tenant) => {
          if (tenant.status === 'active') {
            const { data: leaseData } = await supabase
              .from('leases')
              .select('*, unit:units (*, property:properties (*))')
              .eq('tenant_id', tenant.id)
              .eq('status', 'active')
              .single();

            return {
              ...tenant,
              currentLease: leaseData as unknown as TenantWithLease['currentLease'],
            };
          }
          return tenant;
        })
      );

      setTenants(tenantsWithLeases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
    } finally {
      setIsLoading(false);
    }
  }, [user, status, supabase]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const createTenant = async (tenant: Omit<TenantInsert, 'owner_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const tenantData = { ...tenant, owner_id: user.id };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('tenants') as any)
        .insert(tenantData)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchTenants();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateTenant = async (id: string, updates: TenantUpdate) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase.from('tenants') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchTenants();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const deleteTenant = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase.from('tenants') as any)
        .update({ status: 'inactive' })
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchTenants();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const approveTenant = async (id: string) => {
    return updateTenant(id, {
      status: 'approved',
      application_status: 'approved',
    });
  };

  const rejectTenant = async (id: string) => {
    return updateTenant(id, {
      status: 'rejected',
      application_status: 'rejected',
    });
  };

  const getTenant = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  // Stats
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const applyingTenants = tenants.filter((t) => t.status === 'applying').length;
  const averageRating = tenants.length > 0
    ? tenants.reduce((sum, t) => sum + t.renting_rating, 0) / tenants.length
    : 0;

  return {
    tenants,
    isLoading,
    error,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    approveTenant,
    rejectTenant,
    getTenant,
    stats: {
      totalTenants,
      activeTenants,
      applyingTenants,
      averageRating,
    },
  };
}
