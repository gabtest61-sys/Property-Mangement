'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Lease, LeaseInsert, LeaseUpdate, Tenant, Unit, Property, ContractTemplate } from '@/lib/database.types';

export interface LeaseWithDetails extends Lease {
  tenant: Tenant;
  unit: Unit & {
    property: Property;
  };
  template?: ContractTemplate;
}

export function useLeases(status?: Lease['status']) {
  const { user } = useAuth();
  const [leases, setLeases] = useState<LeaseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchLeases = useCallback(async () => {
    if (!user) {
      setLeases([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('leases')
        .select(`
          *,
          tenant:tenants (*),
          unit:units (
            *,
            property:properties (*)
          ),
          template:contract_templates (*)
        `)
        .eq('owner_id', user.id);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setLeases((data || []) as LeaseWithDetails[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leases');
    } finally {
      setIsLoading(false);
    }
  }, [user, status, supabase]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  const createLease = async (lease: Omit<LeaseInsert, 'owner_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const leaseData = { ...lease, owner_id: user.id };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('leases') as any)
        .insert(leaseData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update tenant status to active
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('tenants') as any)
        .update({ status: 'active' })
        .eq('id', lease.tenant_id);

      await fetchLeases();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateLease = async (id: string, updates: LeaseUpdate) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase.from('leases') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchLeases();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const terminateLease = async (id: string) => {
    try {
      const lease = leases.find((l) => l.id === id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('leases') as any)
        .update({ status: 'terminated' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update tenant status
      if (lease) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('tenants') as any)
          .update({ status: 'inactive' })
          .eq('id', lease.tenant_id);
      }

      await fetchLeases();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signLease = async (id: string, signatureUrl: string, signerType: 'landlord' | 'tenant') => {
    const updates: LeaseUpdate = signerType === 'landlord'
      ? { landlord_signed_at: new Date().toISOString(), landlord_signature_url: signatureUrl }
      : { tenant_signed_at: new Date().toISOString(), tenant_signature_url: signatureUrl };

    // Check if both parties have signed
    const lease = leases.find((l) => l.id === id);
    if (lease) {
      const willBeFullySigned = signerType === 'landlord'
        ? lease.tenant_signed_at !== null
        : lease.landlord_signed_at !== null;

      if (willBeFullySigned) {
        updates.status = 'active';
      }
    }

    return updateLease(id, updates);
  };

  const getLease = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('leases')
        .select('*, tenant:tenants (*), unit:units (*, property:properties (*)), template:contract_templates (*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data: data as LeaseWithDetails, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  // Stats
  const totalLeases = leases.length;
  const activeLeases = leases.filter((l) => l.status === 'active').length;
  const pendingSignature = leases.filter((l) => l.status === 'pending_signature').length;
  const expiringSoon = leases.filter((l) => l.status === 'expiring_soon').length;

  return {
    leases,
    isLoading,
    error,
    fetchLeases,
    createLease,
    updateLease,
    terminateLease,
    signLease,
    getLease,
    stats: {
      totalLeases,
      activeLeases,
      pendingSignature,
      expiringSoon,
    },
  };
}

// Hook for contract templates
export function useContractTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('contract_templates')
        .select('*')
        .or(`owner_id.is.null,owner_id.eq.${user?.id}`)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (fetchError) throw fetchError;

      setTemplates((data || []) as ContractTemplate[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
  };
}
