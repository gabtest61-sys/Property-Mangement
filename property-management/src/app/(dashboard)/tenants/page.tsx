'use client';

import { Header } from '@/components/layout';
import { Button, Card, Badge, Avatar, Input } from '@/components/ui';
import { Plus, Search, Filter, Phone, Mail, MapPin, MoreVertical, Calendar } from 'lucide-react';

const tenants = [
  {
    id: 1,
    name: 'Juan Cruz',
    email: 'juan.cruz@email.com',
    phone: '+63 917 123 4567',
    property: 'Sunrise Apartments',
    unit: 'Unit 203',
    moveIn: '2024-01-15',
    status: 'active',
    rent: 12500,
    riskScore: 85,
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 918 234 5678',
    property: 'Green Valley Residences',
    unit: 'Unit 105',
    moveIn: '2024-03-01',
    status: 'active',
    rent: 15000,
    riskScore: 92,
  },
  {
    id: 3,
    name: 'Pedro Garcia',
    email: 'pedro.garcia@email.com',
    phone: '+63 919 345 6789',
    property: 'Metro Heights',
    unit: 'Unit 401',
    moveIn: '2023-11-20',
    status: 'late',
    rent: 18000,
    riskScore: 65,
  },
  {
    id: 4,
    name: 'Ana Reyes',
    email: 'ana.reyes@email.com',
    phone: '+63 920 456 7890',
    property: 'Sunrise Apartments',
    unit: 'Unit 301',
    moveIn: '2024-06-01',
    status: 'active',
    rent: 14000,
    riskScore: 88,
  },
];

export default function TenantsPage() {
  return (
    <>
      <Header
        title="Tenants"
        subtitle={`${tenants.length} active tenants`}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search tenants..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Badge variant="primary" className="cursor-pointer">All Tenants</Badge>
          <Badge variant="default" className="cursor-pointer">Active</Badge>
          <Badge variant="default" className="cursor-pointer">Late Payment</Badge>
          <Badge variant="default" className="cursor-pointer">Pending</Badge>
        </div>

        {/* Tenants Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} hoverable>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={tenant.name} size="lg" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{tenant.name}</h3>
                    <Badge
                      variant={tenant.status === 'active' ? 'success' : 'error'}
                      size="sm"
                      dot
                    >
                      {tenant.status === 'active' ? 'Active' : 'Late Payment'}
                    </Badge>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{tenant.property} - {tenant.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{tenant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{tenant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Since {new Date(tenant.moveIn).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Rent</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    ₱{tenant.rent.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Risk Score</p>
                  <p
                    className={`font-semibold ${
                      tenant.riskScore >= 80
                        ? 'text-green-600 dark:text-green-400'
                        : tenant.riskScore >= 60
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tenant.riskScore}/100
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
