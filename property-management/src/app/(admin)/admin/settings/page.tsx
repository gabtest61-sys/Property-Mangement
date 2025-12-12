'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Database,
  Globe,
  CreditCard,
  Save,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsSections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <>
      <AdminHeader
        title="System Settings"
        subtitle="Configure platform settings and preferences"
      />

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="lg:w-64 shrink-0">
            <Card className="bg-gray-900 border-gray-800 sticky top-20">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                        activeSection === section.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      )}
                    >
                      <section.icon className="h-5 w-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
            {activeSection === 'general' && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        defaultValue="PropManager"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        defaultValue="support@propmanager.com"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Currency
                      </label>
                      <select className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>PHP - Philippine Peso</option>
                        <option>USD - US Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Timezone
                      </label>
                      <select className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Asia/Manila (UTC+8)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maintenance Mode
                    </label>
                    <div className="flex items-center gap-3">
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                      <span className="text-gray-400 text-sm">Enable maintenance mode</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    { label: 'New user registrations', enabled: true },
                    { label: 'Premium subscription activations', enabled: true },
                    { label: 'Support ticket submissions', enabled: true },
                    { label: 'Payment failures', enabled: true },
                    { label: 'System errors', enabled: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800">
                      <span className="text-white">{item.label}</span>
                      <button
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          item.enabled ? 'bg-indigo-600' : 'bg-gray-700'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            item.enabled ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === 'email' && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">Email Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        defaultValue="smtp.sendgrid.net"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        defaultValue="587"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        defaultValue="noreply@propmanager.com"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        defaultValue="PropManager"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue="60"
                      className="w-full max-w-xs h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Login Attempts
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="w-full max-w-xs h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'billing' && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">Billing Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Premium Monthly Price (PHP)
                      </label>
                      <input
                        type="number"
                        defaultValue="999"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Premium Annual Price (PHP)
                      </label>
                      <input
                        type="number"
                        defaultValue="9999"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Free Plan Property Limit
                      </label>
                      <input
                        type="number"
                        defaultValue="3"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Free Plan Unit Limit
                      </label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trial Period (days)
                    </label>
                    <input
                      type="number"
                      defaultValue="14"
                      className="w-full max-w-xs h-10 px-4 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
