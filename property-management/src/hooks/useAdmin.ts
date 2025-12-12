'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Profile, ProfileUpdate } from '@/lib/database.types';

// Platform statistics
interface PlatformStats {
  totalUsers: number;
  premiumUsers: number;
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  monthlyRevenue: number;
  activeLeases: number;
  occupancyRate: number;
}

// User with extended info for admin
interface AdminUser extends Profile {
  properties_count: number;
  units_count: number;
  tenants_count: number;
  last_login?: string;
}

// Recent activity
interface AdminActivity {
  id: string;
  type: 'user' | 'payment' | 'property' | 'subscription';
  description: string;
  user_email: string;
  created_at: string;
}

// Subscription data
interface SubscriptionData {
  id: string;
  user: Profile;
  plan: 'monthly' | 'annual';
  status: 'active' | 'expiring' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string | null;
  amount: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all counts in parallel - handle each result individually
      const results = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('units').select('id', { count: 'exact', head: true }),
        supabase.from('tenants').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('leases').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('units').select('id', { count: 'exact', head: true }).eq('status', 'occupied'),
      ]);

      // Extract counts safely
      const getCount = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          return result.value.count || 0;
        }
        return 0;
      };

      const totalUsers = getCount(results[0]);
      const premiumCount = getCount(results[1]);
      const totalProperties = getCount(results[2]);
      const totalUnits = getCount(results[3]);
      const totalTenants = getCount(results[4]);
      const activeLeases = getCount(results[5]);
      const occupiedUnits = getCount(results[6]);

      // Calculate monthly revenue (premium users * price)
      const estimatedMonthlyRevenue = premiumCount * 999;

      // Calculate occupancy rate
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      setStats({
        totalUsers,
        premiumUsers: premiumCount,
        totalProperties,
        totalUnits,
        totalTenants,
        monthlyRevenue: estimatedMonthlyRevenue,
        activeLeases,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to fetch platform statistics');
      // Set default stats on error
      setStats({
        totalUsers: 0,
        premiumUsers: 0,
        totalProperties: 0,
        totalUnits: 0,
        totalTenants: 0,
        monthlyRevenue: 0,
        activeLeases: 0,
        occupancyRate: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all profiles using RPC function (bypasses RLS for admins)
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_all_profiles');

      if (profilesError) {
        // Fallback to direct query if function doesn't exist
        console.warn('RPC failed, trying direct query:', profilesError.message);
        const { data: directProfiles, error: directError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (directError) {
          console.warn('Error fetching profiles:', directError.message);
          setUsers([]);
          setError('Unable to fetch users. Check admin permissions.');
          return;
        }

        const profilesData = directProfiles as Profile[] | null;
        if (!profilesData || profilesData.length === 0) {
          setUsers([]);
          return;
        }

        // Continue with direct profiles
        const usersWithCounts = await Promise.all(
          profilesData.map(async (profile) => {
            return {
              ...profile,
              properties_count: 0,
              units_count: 0,
              tenants_count: 0,
            };
          })
        );
        setUsers(usersWithCounts);
        return;
      }

      const profilesData = profiles as Profile[] | null;

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // For each user, get their property/unit/tenant counts
      const usersWithCounts = await Promise.all(
        profilesData.map(async (profile) => {
          const results = await Promise.allSettled([
            supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .eq('owner_id', profile.id),
            supabase
              .from('units')
              .select('id, properties!inner(owner_id)', { count: 'exact', head: true })
              .eq('properties.owner_id', profile.id),
            supabase
              .from('tenants')
              .select('id', { count: 'exact', head: true })
              .eq('owner_id', profile.id),
          ]);

          const getCount = (result: PromiseSettledResult<any>) => {
            if (result.status === 'fulfilled' && !result.value.error) {
              return result.value.count || 0;
            }
            return 0;
          };

          return {
            ...profile,
            properties_count: getCount(results[0]),
            units_count: getCount(results[1]),
            tenants_count: getCount(results[2]),
          };
        })
      );

      setUsers(usersWithCounts);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const updateUserPremium = useCallback(async (userId: string, isPremium: boolean, expiresAt?: string) => {
    try {
      const updateData: ProfileUpdate = {
        is_premium: isPremium,
        premium_expires_at: expiresAt || null,
      };
      // Using type assertion to bypass strict type checking
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      console.error('Error updating user premium:', err);
      return { success: false, error: err };
    }
  }, [supabase, fetchUsers]);

  const updateUserAdmin = useCallback(async (userId: string, isAdmin: boolean) => {
    try {
      const updateData: ProfileUpdate = { is_admin: isAdmin };
      // Using type assertion to bypass strict type checking
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      console.error('Error updating user admin status:', err);
      return { success: false, error: err };
    }
  }, [supabase, fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserPremium,
    updateUserAdmin,
  };
}

export function useAdminActivity() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch recent activity from activity_log (table may not exist)
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          id,
          activity_type,
          description,
          created_at,
          owner_id,
          profiles:owner_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // Table might not exist - just return empty array
        console.warn('Activity log not available:', error.message);
        setActivities([]);
        return;
      }

      const formattedActivities: AdminActivity[] = (data || []).map((item: any) => ({
        id: item.id,
        type: item.activity_type as AdminActivity['type'],
        description: item.description,
        user_email: item.profiles?.email || 'Unknown',
        created_at: item.created_at,
      }));

      setActivities(formattedActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, isLoading, refetch: fetchActivities };
}

export function useAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    expiring: 0,
    cancelled: 0,
    monthlyRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all premium users
      const { data: premiumUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_premium', true)
        .order('premium_expires_at', { ascending: true });

      if (error) throw error;

      const premiumUsersData = premiumUsers as Profile[] | null;

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      let activeCount = 0;
      let expiringCount = 0;

      const formattedSubs: SubscriptionData[] = (premiumUsersData || []).map((user) => {
        const expiresAt = user.premium_expires_at ? new Date(user.premium_expires_at) : null;
        let status: SubscriptionData['status'] = 'active';

        if (expiresAt) {
          if (expiresAt < now) {
            status = 'expired';
          } else if (expiresAt < thirtyDaysFromNow) {
            status = 'expiring';
            expiringCount++;
          } else {
            activeCount++;
          }
        } else {
          activeCount++; // No expiry = lifetime/active
        }

        // Determine plan type based on expiry duration or default
        const plan: 'monthly' | 'annual' = 'monthly'; // Default, could be enhanced

        return {
          id: user.id,
          user,
          plan,
          status,
          started_at: user.created_at,
          expires_at: user.premium_expires_at,
          amount: plan === 'monthly' ? 999 : 9999,
        };
      });

      setSubscriptions(formattedSubs);
      setStats({
        active: activeCount,
        expiring: expiringCount,
        cancelled: 0,
        monthlyRevenue: activeCount * 999,
      });
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { subscriptions, stats, isLoading, refetch: fetchSubscriptions };
}
