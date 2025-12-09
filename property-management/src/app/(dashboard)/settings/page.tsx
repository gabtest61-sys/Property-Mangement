'use client';

import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Avatar, Input } from '@/components/ui';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Crown,
  Globe,
  Palette,
  Smartphone,
  Check,
  Sun,
  Moon,
  Monitor,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

const defaultNotificationSettings = [
  { id: 'email_payments', label: 'Payment notifications', description: 'Get notified when tenants make payments', enabled: false },
  { id: 'email_messages', label: 'New messages', description: 'Receive emails for new chat messages', enabled: false },
  { id: 'email_contracts', label: 'Contract updates', description: 'Updates on contract signing and renewals', enabled: false },
  { id: 'push_reminders', label: 'Payment reminders', description: 'Push notifications for upcoming payments', enabled: false },
  { id: 'push_maintenance', label: 'Maintenance requests', description: 'Get notified of new maintenance requests', enabled: false },
];

const themeOptions = [
  { id: 'light', label: 'Light', icon: Sun, description: 'Light mode' },
  { id: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode' },
  { id: 'system', label: 'System', icon: Monitor, description: 'Follow system settings' },
] as const;

// Helper function to load notification preferences from localStorage
function getInitialNotifications() {
  if (typeof window === 'undefined') return defaultNotificationSettings;

  try {
    const savedNotifications = localStorage.getItem('notificationPreferences');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      return defaultNotificationSettings.map(n => ({
        ...n,
        enabled: parsed[n.id] ?? n.enabled
      }));
    }
  } catch {
    // Use defaults if parsing fails
  }
  return defaultNotificationSettings;
}

export default function SettingsPage() {
  const { profile, updateProfile, isLoading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState(getInitialNotifications);
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  // Form state for profile
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    business_address: '',
    tax_id: '',
  });
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize form data when profile loads
  if (profile && !formInitialized) {
    const nameParts = profile.full_name?.split(' ') || ['', ''];
    setFormData({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      business_name: profile.business_name || '',
      business_address: profile.business_address || '',
      tax_id: profile.tax_id || '',
    });
    setFormInitialized(true);
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
    });
    setIsSaving(false);
  };

  const handleSaveBusiness = async () => {
    setIsSaving(true);
    await updateProfile({
      business_name: formData.business_name,
      business_address: formData.business_address,
      tax_id: formData.tax_id,
    });
    setIsSaving(false);
  };

  const toggleNotification = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, enabled: !n.enabled } : n
    );
    setNotifications(updated);

    // Save to localStorage
    const prefs: Record<string, boolean> = {};
    updated.forEach(n => { prefs[n.id] = n.enabled; });
    localStorage.setItem('notificationPreferences', JSON.stringify(prefs));
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage your account and preferences"
        showSearch={false}
      />

      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64 shrink-0">
            <Card padding="sm" className="sticky top-20">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    )}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                      <div className="relative">
                        <Avatar name={profile?.full_name || 'User'} size="xl" />
                        <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                          <Palette className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <Input
                          label="Full Name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                        <Input
                          label="Email"
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+63 917 123 4567"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        label="Business Name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        placeholder="Your Business Name"
                      />
                      <Input
                        label="Business Address"
                        value={formData.business_address}
                        onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                        placeholder="123 Street, City"
                      />
                      <Input
                        label="Tax ID / TIN"
                        value={formData.tax_id}
                        onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                        placeholder="123-456-789-000"
                      />
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button onClick={handleSaveBusiness} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {notification.label}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.description}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleNotification(notification.id)}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notification.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notification.enabled ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input label="Current Password" type="password" />
                      <Input label="New Password" type="password" />
                      <Input label="Confirm New Password" type="password" />
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button>Update Password</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            Authenticator App
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Use an authenticator app for 2FA
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <>
                {!profile?.is_premium && (
                  <Card className="bg-linear-to-r from-amber-400 to-amber-600 border-none text-white">
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className="h-8 w-8" />
                        <div>
                          <h3 className="text-xl font-bold">Upgrade to Premium</h3>
                          <p className="text-white/90">
                            Unlock all features and remove limits
                          </p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {[
                          'Unlimited properties & units',
                          'Contract creation & e-signing',
                          'Automated billing & reminders',
                          'Advanced analytics & reports',
                          'Priority support',
                          'No advertisements',
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="bg-white text-amber-600 hover:bg-amber-50">
                        View Plans
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {profile?.is_premium ? 'Premium Plan' : 'Free Plan'}
                          </h4>
                          <Badge variant={profile?.is_premium ? 'success' : 'default'}>Current</Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {profile?.is_premium
                            ? `Premium until ${profile.premium_expires_at ? new Date(profile.premium_expires_at).toLocaleDateString() : 'Forever'}`
                            : 'Limited to 3 properties and 10 units'}
                        </p>
                      </div>
                      {!profile?.is_premium && <Button variant="primary">Upgrade</Button>}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle>App Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Language */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Language</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language</p>
                        </div>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>English</option>
                        <option>Filipino</option>
                      </select>
                    </div>

                    {/* Currency */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Currency</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Default currency for billing</p>
                        </div>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>PHP (₱)</option>
                        <option>USD ($)</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Palette className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Theme</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Choose your interface theme</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {themeOptions.map((option) => {
                          const isSelected = theme === option.id;
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.id}
                              onClick={() => setTheme(option.id)}
                              className={cn(
                                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700'
                              )}
                            >
                              <div
                                className={cn(
                                  'p-3 rounded-full',
                                  isSelected
                                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={cn(
                                  'font-medium text-sm',
                                  isSelected
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300'
                                )}
                              >
                                {option.label}
                              </span>
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <Check className="h-4 w-4 text-blue-500" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
