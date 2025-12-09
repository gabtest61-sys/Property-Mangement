'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Property, PropertyInsert, PropertyUpdate, Unit } from '@/lib/database.types';

export interface PropertyWithStats extends Property {
  units: Unit[];
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
}

export function useProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchProperties = useCallback(async () => {
    if (!user) {
      setProperties([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*, units (*)')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Calculate stats for each property
      type PropertyWithUnitsData = Property & { units: Unit[] };
      const propertiesWithStats: PropertyWithStats[] = ((data || []) as PropertyWithUnitsData[]).map((property) => {
        const units = property.units || [];
        const occupiedUnits = units.filter((u: Unit) => u.status === 'occupied').length;
        const vacantUnits = units.filter((u: Unit) => u.status === 'vacant').length;
        const monthlyRevenue = units
          .filter((u: Unit) => u.status === 'occupied')
          .reduce((sum: number, u: Unit) => sum + (u.monthly_rent || 0), 0);

        return {
          ...property,
          units,
          totalUnits: units.length,
          occupiedUnits,
          vacantUnits,
          occupancyRate: units.length > 0 ? (occupiedUnits / units.length) * 100 : 0,
          monthlyRevenue,
        };
      });

      setProperties(propertiesWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createProperty = async (property: Omit<PropertyInsert, 'owner_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const propertyData = { ...property, owner_id: user.id };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('properties') as any)
        .insert(propertyData)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchProperties();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateProperty = async (id: string, updates: PropertyUpdate) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase.from('properties') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchProperties();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase.from('properties') as any)
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchProperties();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const getProperty = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*, units (*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  // Stats
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const overallOccupancy = totalUnits > 0 ? (totalOccupied / totalUnits) * 100 : 0;

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    getProperty,
    stats: {
      totalProperties,
      totalUnits,
      totalOccupied,
      totalRevenue,
      overallOccupancy,
    },
  };
}

// Hook for units
export function useUnits(propertyId?: string) {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchUnits = useCallback(async () => {
    if (!user) {
      setUnits([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('units')
        .select('*, property:properties!inner(owner_id)')
        .eq('properties.owner_id', user.id)
        .eq('is_active', true);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error: fetchError } = await query.order('name');

      if (fetchError) throw fetchError;

      setUnits((data || []) as Unit[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch units');
    } finally {
      setIsLoading(false);
    }
  }, [user, propertyId, supabase]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const createUnit = async (unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('units') as any)
        .insert(unit)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchUnits();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const updateUnit = async (id: string, updates: Partial<Unit>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await (supabase.from('units') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchUnits();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase.from('units') as any)
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchUnits();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    units,
    isLoading,
    error,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
  };
}
