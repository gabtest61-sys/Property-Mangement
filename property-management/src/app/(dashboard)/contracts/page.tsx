'use client';

import { useState } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, Badge, Input, Modal, Select, PremiumBadge } from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Loader2,
  Crown,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useLeases, useContractTemplates } from '@/hooks/useLeases';
import { useProperties } from '@/hooks/useProperties';
import { useTenants } from '@/hooks/useTenants';
import { usePremium } from '@/hooks/usePremium';
import { LeaseInsert } from '@/lib/database.types';
import { generateContractPDF } from '@/lib/pdf';

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  expiring_soon: { label: 'Expiring Soon', variant: 'warning' as const },
  pending_signature: { label: 'Pending Signature', variant: 'info' as const },
  expired: { label: 'Expired', variant: 'error' as const },
  terminated: { label: 'Terminated', variant: 'error' as const },
  draft: { label: 'Draft', variant: 'default' as const },
};

export default function ContractsPage() {
  const { leases, isLoading, createLease, signLease, terminateLease, stats } = useLeases();
  const { templates, isLoading: templatesLoading } = useContractTemplates();
  const { properties } = useProperties();
  const { tenants: applyingTenants } = useTenants('applying');
  const { isPremium, hasFeature } = usePremium();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    tenant_id: '',
    unit_id: '',
    template_id: '',
    lease_type: 'fixed' as 'fixed' | 'month_to_month',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    security_deposit: '',
    payment_due_day: '1',
  });

  // Get units for selected property
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const availableUnits = selectedProperty?.units?.filter(u => u.status === 'vacant') || [];

  // Get approved applicants who don't have active leases
  const availableTenants = applyingTenants.filter(t => t.application_status === 'approved');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const leaseData: Omit<LeaseInsert, 'owner_id'> = {
      tenant_id: formData.tenant_id,
      unit_id: formData.unit_id,
      template_id: formData.template_id || null,
      type: formData.lease_type === 'fixed' ? 'fixed_term' : 'month_to_month',
      start_date: formData.start_date,
      end_date: formData.lease_type === 'fixed' ? formData.end_date : null,
      monthly_rent: parseFloat(formData.monthly_rent),
      deposit_amount: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
      due_day: parseInt(formData.payment_due_day),
      status: 'pending_signature',
    };

    const { error: createError } = await createLease(leaseData);

    if (createError) {
      setError(createError.message);
      setIsSubmitting(false);
    } else {
      setIsModalOpen(false);
      setFormData({
        tenant_id: '',
        unit_id: '',
        template_id: '',
        lease_type: 'fixed',
        start_date: '',
        end_date: '',
        monthly_rent: '',
        security_deposit: '',
        payment_due_day: '1',
      });
      setSelectedPropertyId('');
      setIsSubmitting(false);
    }
  };

  const handleSign = async (id: string) => {
    setProcessingId(id);
    await signLease(id, 'signed', 'landlord');
    setProcessingId(null);
  };

  const handleTerminate = async (id: string) => {
    if (confirm('Are you sure you want to terminate this lease?')) {
      setProcessingId(id);
      await terminateLease(id);
      setProcessingId(null);
    }
  };

  const handleDownloadPDF = (leaseId: string) => {
    if (!hasFeature('contractPDF')) {
      setIsUpgradeModalOpen(true);
      return;
    }

    const lease = leases.find((l) => l.id === leaseId);
    if (lease) {
      const pdf = generateContractPDF(lease);
      pdf.save(`contract-${lease.tenant.first_name}-${lease.tenant.last_name}.pdf`);
    }
  };

  const filteredLeases = leases.filter((lease) => {
    const tenantName = `${lease.tenant.first_name} ${lease.tenant.last_name}`.toLowerCase();
    const propertyName = lease.unit.property.name.toLowerCase();
    const matchesSearch =
      tenantName.includes(searchQuery.toLowerCase()) ||
      propertyName.includes(searchQuery.toLowerCase()) ||
      lease.unit.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && lease.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Header
        title="Contracts"
        subtitle={`${stats.totalLeases} total contracts`}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Badge
            variant={filterStatus === 'all' ? 'primary' : 'default'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilterStatus('all')}
          >
            All Contracts ({stats.totalLeases})
          </Badge>
          <Badge
            variant={filterStatus === 'active' ? 'primary' : 'default'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilterStatus('active')}
          >
            Active ({stats.activeLeases})
          </Badge>
          <Badge
            variant={filterStatus === 'pending_signature' ? 'primary' : 'default'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilterStatus('pending_signature')}
          >
            Pending Signature ({stats.pendingSignature})
          </Badge>
          <Badge
            variant={filterStatus === 'expiring_soon' ? 'primary' : 'default'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilterStatus('expiring_soon')}
          >
            Expiring Soon ({stats.expiringSoon})
          </Badge>
          <Badge
            variant={filterStatus === 'terminated' ? 'primary' : 'default'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilterStatus('terminated')}
          >
            Terminated
          </Badge>
        </div>

        {/* Contracts List */}
        {filteredLeases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No contracts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try a different search' : 'Create your first contract to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Contract
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeases.map((lease) => {
              const status = lease.status as keyof typeof statusConfig;
              const statusInfo = statusConfig[status] || statusConfig.draft;

              return (
                <Card key={lease.id} hoverable>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Contract Icon & Basic Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {lease.tenant.first_name} {lease.tenant.last_name}
                          </h3>
                          <Badge variant={statusInfo.variant} size="sm" dot>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {lease.unit.property.name} - {lease.unit.name}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {lease.type === 'fixed_term' ? 'Fixed-term' : 'Month-to-month'}
                        </p>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm lg:text-right">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(lease.start_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">End Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {lease.end_date ? formatDate(lease.end_date) : 'Ongoing'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Monthly Rent</p>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">
                          ₱{lease.monthly_rent.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700">
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDownloadPDF(lease.id)}
                        title={hasFeature('contractPDF') ? 'Download PDF' : 'Premium feature'}
                      >
                        <Download className="h-4 w-4" />
                        {!hasFeature('contractPDF') && (
                          <Crown className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
                        )}
                      </Button>
                      {lease.status === 'pending_signature' && (
                        <Button
                          size="sm"
                          onClick={() => handleSign(lease.id)}
                          disabled={processingId === lease.id}
                        >
                          {processingId === lease.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Sign Now'
                          )}
                        </Button>
                      )}
                      {lease.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleTerminate(lease.id)}
                          disabled={processingId === lease.id}
                        >
                          {processingId === lease.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Terminate'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contract Templates Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contract Templates
          </h2>
          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  hoverable
                  className="text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 w-fit mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {template.type.replace('_', ' ')}
                  </p>
                  {template.is_default && (
                    <Badge variant="primary" size="sm" className="mt-2">
                      Default
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Contract Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Contract"
        description="Set up a lease agreement between a tenant and property unit"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Tenant Selection */}
          <Select
            label="Select Tenant"
            value={formData.tenant_id}
            onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            required
          >
            <option value="">Choose an approved applicant...</option>
            {availableTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.first_name} {tenant.last_name} - {tenant.phone}
              </option>
            ))}
          </Select>

          {availableTenants.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No approved applicants available. Approve an application first.
            </p>
          )}

          {/* Property & Unit Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Select Property"
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setFormData({ ...formData, unit_id: '' });
              }}
              required
            >
              <option value="">Choose a property...</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>

            <Select
              label="Select Unit"
              value={formData.unit_id}
              onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
              required
              disabled={!selectedPropertyId}
            >
              <option value="">Choose a vacant unit...</option>
              {availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} - ₱{unit.monthly_rent?.toLocaleString()}/mo
                </option>
              ))}
            </Select>
          </div>

          {selectedPropertyId && availableUnits.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No vacant units in this property.
            </p>
          )}

          {/* Contract Template */}
          <Select
            label="Contract Template (Optional)"
            value={formData.template_id}
            onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
          >
            <option value="">Use default template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>

          {/* Lease Type */}
          <Select
            label="Lease Type"
            value={formData.lease_type}
            onChange={(e) =>
              setFormData({ ...formData, lease_type: e.target.value as 'fixed' | 'month_to_month' })
            }
            required
          >
            <option value="fixed">Fixed-term</option>
            <option value="month_to_month">Month-to-month</option>
          </Select>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            {formData.lease_type === 'fixed' && (
              <Input
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            )}
          </div>

          {/* Financial Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Financial Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monthly Rent (₱)"
                type="number"
                placeholder="15000"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                required
              />
              <Input
                label="Security Deposit (₱)"
                type="number"
                placeholder="30000"
                value={formData.security_deposit}
                onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <Select
                label="Payment Due Day"
                value={formData.payment_due_day}
                onChange={(e) => setFormData({ ...formData, payment_due_day: e.target.value })}
                required
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day === 1
                      ? '1st of the month'
                      : day === 2
                      ? '2nd of the month'
                      : day === 3
                      ? '3rd of the month'
                      : `${day}th of the month`}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Contract
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Premium Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Premium Feature"
        description="PDF contract generation requires a Premium subscription"
      >
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Unlock PDF Contract Generation
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate professional PDF contracts with your branding. Premium members also get:
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unlimited properties and units
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Advanced financial reports
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Background checks integration
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Priority support
            </li>
          </ul>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => {
                setIsUpgradeModalOpen(false);
                window.location.href = '/settings?section=billing';
              }}
            >
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
