'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Crown,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/properties', label: 'Properties', icon: Building2 },
  {
    href: '/tenants',
    label: 'Tenants',
    icon: Users,
    subItems: [
      { href: '/tenants', label: 'Current Tenants', icon: UserCheck },
      { href: '/tenants/applying', label: 'Applying Tenants', icon: UserPlus },
    ]
  },
  { href: '/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/billing', label: 'Billing', icon: CreditCard, premium: true },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, premium: true },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/tenants']);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Get user initials from full name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 transition-opacity',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-gray-900 dark:text-gray-100">PropManager</span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            isCollapsed && 'absolute -right-3 top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Premium Banner */}
      {!isCollapsed && (
        <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5" />
            <span className="font-semibold">Upgrade to Premium</span>
          </div>
          <p className="text-sm text-white/90 mb-3">
            Unlock unlimited properties, contracts & more
          </p>
          <button className="w-full py-2 px-4 bg-white text-amber-600 rounded-lg font-medium text-sm hover:bg-amber-50 transition-colors">
            View Plans
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="flex justify-center mt-4">
          <div className="p-2 rounded-lg bg-amber-500 text-white">
            <Crown className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.subItems && pathname.startsWith(item.href));
            const isExpanded = expandedItems.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <li key={item.href}>
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                        isCollapsed && 'justify-center px-2'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors',
                          isActive && 'text-blue-600 dark:text-blue-400'
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1 text-left">{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!isCollapsed && isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                                  isSubActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                )}
                              >
                                <subItem.icon className="h-4 w-4 shrink-0" />
                                <span>{subItem.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                      isCollapsed && 'justify-center px-2'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive && 'text-blue-600 dark:text-blue-400'
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.premium && <Crown className="h-4 w-4 text-amber-500" />}
                      </>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute left-12 bg-red-500 text-white text-[10px] font-medium h-4 w-4 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div
          className={cn(
            'flex items-center gap-3',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium shrink-0">
            {getInitials(profile?.full_name)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {profile?.is_premium ? 'Premium Member' : 'Property Owner'}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
