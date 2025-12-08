'use client';

import { Header } from '@/components/layout';
import { Button, Card, Badge, Avatar, Input, EmptyState } from '@/components/ui';
import { Plus, Search, Filter, FileText, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const contracts = [
  {
    id: 1,
    tenant: 'Juan Cruz',
    property: 'Sunrise Apartments',
    unit: 'Unit 203',
    type: 'Fixed-term (1 Year)',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    status: 'active',
    rent: 12500,
    signedDate: '2024-01-10',
  },
  {
    id: 2,
    tenant: 'Maria Santos',
    property: 'Green Valley Residences',
    unit: 'Unit 105',
    type: 'Month-to-month',
    startDate: '2024-03-01',
    endDate: null,
    status: 'active',
    rent: 15000,
    signedDate: '2024-02-25',
  },
  {
    id: 3,
    tenant: 'Pedro Garcia',
    property: 'Metro Heights',
    unit: 'Unit 401',
    type: 'Fixed-term (1 Year)',
    startDate: '2023-11-20',
    endDate: '2024-11-20',
    status: 'expiring',
    rent: 18000,
    signedDate: '2023-11-15',
  },
  {
    id: 4,
    tenant: 'Ana Reyes',
    property: 'Sunrise Apartments',
    unit: 'Unit 301',
    type: 'Fixed-term (6 Months)',
    startDate: '2024-06-01',
    endDate: '2024-12-01',
    status: 'pending_signature',
    rent: 14000,
    signedDate: null,
  },
];

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const, icon: CheckCircle },
  expiring: { label: 'Expiring Soon', variant: 'warning' as const, icon: Clock },
  pending_signature: { label: 'Pending Signature', variant: 'info' as const, icon: AlertCircle },
  expired: { label: 'Expired', variant: 'error' as const, icon: AlertCircle },
};

export default function ContractsPage() {
  return (
    <>
      <Header
        title="Contracts"
        subtitle="Manage lease agreements and contracts"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Create Contract
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search contracts..."
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
          <Badge variant="primary" className="cursor-pointer whitespace-nowrap">All Contracts</Badge>
          <Badge variant="default" className="cursor-pointer whitespace-nowrap">Active</Badge>
          <Badge variant="default" className="cursor-pointer whitespace-nowrap">Pending Signature</Badge>
          <Badge variant="default" className="cursor-pointer whitespace-nowrap">Expiring Soon</Badge>
          <Badge variant="default" className="cursor-pointer whitespace-nowrap">Expired</Badge>
        </div>

        {/* Contracts List */}
        <div className="space-y-4">
          {contracts.map((contract) => {
            const statusInfo = statusConfig[contract.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={contract.id} hoverable>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Contract Icon & Basic Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {contract.tenant}
                        </h3>
                        <Badge variant={statusInfo.variant} size="sm" dot>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contract.property} - {contract.unit}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {contract.type}
                      </p>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm lg:text-right">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(contract.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">End Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {contract.endDate ? formatDate(contract.endDate) : 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Monthly Rent</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        ₱{contract.rent.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700">
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    {contract.status === 'pending_signature' && (
                      <Button size="sm">Sign Now</Button>
                    )}
                    {contract.status === 'expiring' && (
                      <Button size="sm" variant="outline">Renew</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contract Templates Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contract Templates</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Month-to-Month Lease', description: 'Flexible rental agreement' },
              { name: 'Fixed-Term Lease', description: '6 months or 1 year terms' },
              { name: 'Bedspace Agreement', description: 'Shared accommodation' },
              { name: 'Boarding House', description: 'Multiple tenants contract' },
            ].map((template, index) => (
              <Card
                key={index}
                hoverable
                className="text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 w-fit mx-auto mb-3">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
