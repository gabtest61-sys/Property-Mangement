'use client';

import { cn } from '@/lib/utils';
import { Bell, Search } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Title Section */}
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 pl-10 pr-4 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* Custom Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
