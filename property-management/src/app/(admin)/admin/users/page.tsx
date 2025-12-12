'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import {
  Search,
  Mail,
  Crown,
  Eye,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Shield,
  ShieldOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminUsers } from '@/hooks';

type FilterType = 'all' | 'premium' | 'free' | 'admin';

export default function AdminUsersPage() {
  const { users, isLoading, refetch, updateUserPremium, updateUserAdmin } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'premium' && user.is_premium) ||
      (filter === 'free' && !user.is_premium) ||
      (filter === 'admin' && user.is_admin);

    return matchesSearch && matchesFilter;
  });

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    setUpdatingUser(userId);
    // If granting premium, set expiry to 1 year from now
    const expiresAt = !currentStatus
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    await updateUserPremium(userId, !currentStatus, expiresAt);
    setUpdatingUser(null);
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdatingUser(userId);
    await updateUserAdmin(userId, !currentStatus);
    setUpdatingUser(null);
  };

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Users Management" subtitle="Loading..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Users Management"
        subtitle={`${users.length} total users`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Export Users
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {(['all', 'premium', 'free', 'admin'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                      filter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Plan</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Properties</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Tenants</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Joined</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{user.full_name || 'Unknown'}</p>
                              {user.is_admin && (
                                <span title="Admin">
                                  <Shield className="h-4 w-4 text-indigo-400" />
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.is_premium ? (
                          <Badge variant="warning" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-gray-700 text-gray-300">
                            Free
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          {user.properties_count}
                          <span className="text-gray-600 mx-1">/</span>
                          {user.units_count} units
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{user.tenants_count}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.is_admin ? 'primary' : 'success'}>
                          {user.is_admin ? 'Admin' : 'Active'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {updatingUser === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleTogglePremium(user.id, user.is_premium)}
                                className={cn(
                                  'p-2 rounded-lg transition-colors',
                                  user.is_premium
                                    ? 'text-amber-400 hover:text-amber-300 hover:bg-gray-800'
                                    : 'text-gray-400 hover:text-amber-400 hover:bg-gray-800'
                                )}
                                title={user.is_premium ? 'Remove Premium' : 'Grant Premium'}
                              >
                                <Crown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                className={cn(
                                  'p-2 rounded-lg transition-colors',
                                  user.is_admin
                                    ? 'text-indigo-400 hover:text-indigo-300 hover:bg-gray-800'
                                    : 'text-gray-400 hover:text-indigo-400 hover:bg-gray-800'
                                )}
                                title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                              >
                                {user.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                title="Send email"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </p>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-400">Page 1 of 1</span>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-4 flex items-center gap-4">
            <span className="text-white font-medium">{selectedUsers.length} selected</span>
            <div className="h-6 w-px bg-gray-700" />
            <button className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
              Send Email
            </button>
            <button className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors">
              Grant Premium
            </button>
            <button className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
              Suspend
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
