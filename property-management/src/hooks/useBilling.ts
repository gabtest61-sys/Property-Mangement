'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Invoice, InvoiceInsert, InvoiceUpdate, Payment, PaymentInsert, Tenant, Lease, Unit, Property } from '@/lib/database.types';

export interface InvoiceWithDetails extends Invoice {
  tenant: Tenant;
  lease: Lease & {
    unit: Unit & {
      property: Property;
    };
  };
  payments?: Payment[];
}

export interface PaymentWithDetails extends Payment {
  tenant: Tenant;
  invoice: Invoice;
}

export function useInvoices(status?: Invoice['status']) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('invoices')
        .select(`
          *,
          tenant:tenants (*),
          lease:leases (
            *,
            unit:units (
              *,
              property:properties (*)
            )
          ),
          payments (*)
        `)
        .eq('owner_id', user.id);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query.order('due_date', { ascending: false });

      if (fetchError) throw fetchError;

      setInvoices((data || []) as InvoiceWithDetails[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  }, [user, status, supabase]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = async (invoice: Omit<InvoiceInsert, 'owner_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const invoiceData = { ...invoice, owner_id: user.id };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('invoices') as any)
        .insert(invoiceData)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchInvoices();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateInvoice = async (id: string, updates: InvoiceUpdate) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase.from('invoices') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchInvoices();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const cancelInvoice = async (id: string) => {
    return updateInvoice(id, { status: 'cancelled' });
  };

  const markAsPaid = async (id: string) => {
    const invoice = invoices.find((i) => i.id === id);
    if (invoice) {
      return updateInvoice(id, {
        status: 'paid',
        amount_paid: invoice.total_amount,
      });
    }
    return { data: null, error: new Error('Invoice not found') };
  };

  // Auto-generate invoices for active leases
  const generateMonthlyInvoices = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Get all active leases
      const { data: leases, error: leasesError } = await supabase
        .from('leases')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'active');

      if (leasesError) throw leasesError;

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const invoicesToCreate: Omit<InvoiceInsert, 'owner_id'>[] = [];

      for (const lease of (leases || []) as Lease[]) {
        // Check if invoice already exists for this month
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('lease_id', lease.id)
          .gte('billing_period_start', startOfMonth.toISOString())
          .lte('billing_period_start', endOfMonth.toISOString())
          .single();

        if (!existingInvoice) {
          const dueDate = new Date(today.getFullYear(), today.getMonth(), lease.due_day);

          invoicesToCreate.push({
            lease_id: lease.id,
            tenant_id: lease.tenant_id,
            billing_period_start: startOfMonth.toISOString().split('T')[0],
            billing_period_end: endOfMonth.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            rent_amount: lease.monthly_rent,
            total_amount: lease.monthly_rent,
            status: 'pending',
          });
        }
      }

      if (invoicesToCreate.length > 0) {
        const invoicesWithOwner = invoicesToCreate.map((inv) => ({ ...inv, owner_id: user.id }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase.from('invoices') as any).insert(invoicesWithOwner);
        if (insertError) throw insertError;
      }

      await fetchInvoices();
      return { count: invoicesToCreate.length, error: null };
    } catch (err) {
      return { count: 0, error: err as Error };
    }
  };

  // Calculate late fee for an invoice
  const calculateLateFee = (invoice: InvoiceWithDetails): { daysLate: number; lateFee: number; isOverdue: boolean } => {
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const graceDays = invoice.lease?.late_fee_grace_days || 5;
    const lateFeeAmount = invoice.lease?.late_fee_amount || 0;

    // Calculate days past due
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { daysLate: 0, lateFee: 0, isOverdue: false };
    }

    const daysLate = diffDays;
    const isOverdue = daysLate > graceDays;
    const lateFee = isOverdue ? lateFeeAmount : 0;

    return { daysLate, lateFee, isOverdue };
  };

  // Apply late fees to overdue invoices
  const applyLateFees = async () => {
    if (!user) return { error: new Error('Not authenticated'), updated: 0 };

    try {
      let updated = 0;

      for (const invoice of invoices) {
        if (invoice.status === 'pending' || invoice.status === 'partial') {
          const { lateFee, isOverdue } = calculateLateFee(invoice);

          if (isOverdue && invoice.late_fee_amount === 0 && lateFee > 0) {
            // Apply late fee and update status to overdue
            const newTotal = invoice.total_amount + lateFee;
            await updateInvoice(invoice.id, {
              late_fee_amount: lateFee,
              total_amount: newTotal,
              status: 'overdue',
            });
            updated++;
          } else if (isOverdue) {
            // Just update status to overdue (no late fee to apply)
            await updateInvoice(invoice.id, { status: 'overdue' });
            updated++;
          }
        }
      }

      await fetchInvoices();
      return { error: null, updated };
    } catch (err) {
      return { error: err as Error, updated: 0 };
    }
  };

  // Get invoices that need late fee warnings
  const getUpcomingOverdueInvoices = () => {
    const today = new Date();
    return invoices
      .filter(inv => inv.status === 'pending' || inv.status === 'partial')
      .map(inv => {
        const { daysLate, lateFee, isOverdue } = calculateLateFee(inv);
        const dueDate = new Date(inv.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...inv,
          daysLate,
          daysUntilDue,
          potentialLateFee: lateFee,
          isOverdue,
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  };

  // Stats
  const totalAmount = invoices.reduce((sum, i) => sum + i.total_amount, 0);
  const collectedAmount = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total_amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.total_amount, 0);
  const overdueAmount = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.total_amount, 0);
  const totalLateFees = invoices.reduce((sum, i) => sum + (i.late_fee_amount || 0), 0);

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    cancelInvoice,
    markAsPaid,
    generateMonthlyInvoices,
    calculateLateFee,
    applyLateFees,
    getUpcomingOverdueInvoices,
    stats: {
      totalAmount,
      collectedAmount,
      pendingAmount,
      overdueAmount,
      totalLateFees,
    },
  };
}

export function usePayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          tenant:tenants (*),
          invoice:invoices (*)
        `)
        .eq('owner_id', user.id)
        .order('payment_date', { ascending: false });

      if (fetchError) throw fetchError;

      setPayments((data || []) as PaymentWithDetails[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const recordPayment = async (payment: Omit<PaymentInsert, 'owner_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const paymentData = { ...payment, owner_id: user.id };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('payments') as any)
        .insert(paymentData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update invoice amount_paid and status
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      if (invoice) {
        const invoiceData = invoice as { amount_paid: number | null; total_amount: number };
        const newAmountPaid = (invoiceData.amount_paid || 0) + payment.amount;
        const newStatus = newAmountPaid >= invoiceData.total_amount ? 'paid' : 'partial';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('invoices') as any)
          .update({ amount_paid: newAmountPaid, status: newStatus })
          .eq('id', payment.invoice_id);
      }

      await fetchPayments();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const confirmPayment = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const updateData = {
        status: 'confirmed' as const,
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('payments') as any)
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchPayments();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    payments,
    isLoading,
    error,
    fetchPayments,
    recordPayment,
    confirmPayment,
  };
}
