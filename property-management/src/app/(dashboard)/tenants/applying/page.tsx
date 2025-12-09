'use client';

import { useState } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, Badge, Avatar, Input, Modal, Textarea } from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  UserPlus,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { useTenants } from '@/hooks';
import { TenantInsert } from '@/lib/database.types';

export default function ApplyingTenantsPage() {
  const { tenants, isLoading, createTenant, approveTenant, rejectTenant, stats } = useTenants('applying');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employer_name: '',
    job_title: '',
    monthly_income: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const tenantData: Omit<TenantInsert, 'owner_id'> = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone,
      employer_name: formData.employer_name || null,
      job_title: formData.job_title || null,
      monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
      notes: formData.notes || null,
      status: 'applying',
      application_status: 'pending',
    };

    const { error: createError } = await createTenant(tenantData);

    if (createError) {
      setError(createError.message);
      setIsSubmitting(false);
    } else {
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        employer_name: '',
        job_title: '',
        monthly_income: '',
        notes: '',
      });
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await approveTenant(id);
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this application?')) {
      setProcessingId(id);
      await rejectTenant(id);
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm" dot>Pending</Badge>;
      case 'under_review':
        return <Badge variant="primary" size="sm" dot>Under Review</Badge>;
      case 'documents_needed':
        return <Badge variant="error" size="sm" dot>Documents Needed</Badge>;
      case 'approved':
        return <Badge variant="success" size="sm" dot>Approved</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm" dot>Rejected</Badge>;
      default:
        return <Badge variant="default" size="sm" dot>Pending</Badge>;
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const fullName = `${tenant.first_name} ${tenant.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery);

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && tenant.application_status === filterStatus;
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
        title="Applying Tenants"
        subtitle={`${stats.applyingTenants} pending applications`}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search applications..."
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
            className="cursor-pointer"
            onClick={() => setFilterStatus('all')}
          >
            All Applications
          </Badge>
          <Badge
            variant={filterStatus === 'pending' ? 'primary' : 'default'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Badge>
          <Badge
            variant={filterStatus === 'under_review' ? 'primary' : 'default'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('under_review')}
          >
            Under Review
          </Badge>
          <Badge
            variant={filterStatus === 'documents_needed' ? 'primary' : 'default'}
            className="cursor-pointer"
            onClick={() => setFilterStatus('documents_needed')}
          >
            Documents Needed
          </Badge>
        </div>

        {/* Applications Grid */}
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No applications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'Try a different search' : 'No pending applications at the moment'}
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Application
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} hoverable>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${tenant.first_name} ${tenant.last_name}`} size="lg" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {tenant.first_name} {tenant.last_name}
                      </h3>
                      {getStatusBadge(tenant.application_status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {tenant.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{tenant.phone}</span>
                  </div>
                  {tenant.employer_name && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{tenant.employer_name}</span>
                    </div>
                  )}
                  {tenant.monthly_income && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span>₱{tenant.monthly_income.toLocaleString()}/month</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Applied {new Date(tenant.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Renting Rating</p>
                    <p
                      className={`font-semibold ${
                        tenant.renting_rating >= 80
                          ? 'text-green-600 dark:text-green-400'
                          : tenant.renting_rating >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tenant.renting_rating}/100
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                    onClick={() => handleApprove(tenant.id)}
                    disabled={processingId === tenant.id}
                  >
                    {processingId === tenant.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => handleReject(tenant.id)}
                    disabled={processingId === tenant.id}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Application"
        description="Enter the applicant's information"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Juan"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="Cruz"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="juan.cruz@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="+63 917 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Employment Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Employer"
                placeholder="Company name"
                value={formData.employer_name}
                onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
              />
              <Input
                label="Job Title"
                placeholder="Position"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Monthly Income"
                type="number"
                placeholder="25000"
                value={formData.monthly_income}
                onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
              />
            </div>
          </div>

          <Textarea
            label="Notes"
            placeholder="Additional notes about the applicant..."
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Application
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
