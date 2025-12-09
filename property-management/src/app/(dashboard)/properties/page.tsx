'use client';

import { useState } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, Badge, Input, Modal, Select, Textarea, LimitWarning } from '@/components/ui';
import {
  Plus,
  Building2,
  MapPin,
  BedDouble,
  Users,
  Grid3X3,
  List,
  Loader2,
  Trash2,
  Crown,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useProperties, usePremium } from '@/hooks';
import { PropertyInsert } from '@/lib/database.types';
import { FREE_TIER_LIMITS } from '@/hooks/usePremium';

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'house', label: 'House' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'commercial', label: 'Commercial' },
];

export default function PropertiesPage() {
  const { properties, isLoading, createProperty, deleteProperty, stats } = useProperties();
  const { canAddProperty, isPremium } = usePremium();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    type: 'apartment' as PropertyInsert['type'],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error: createError } = await createProperty(formData);

    if (createError) {
      setError(createError.message);
      setIsSubmitting(false);
    } else {
      setIsModalOpen(false);
      setFormData({
        name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        type: 'apartment',
        description: '',
      });
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(id);
    }
  };

  const filteredProperties = filterType === 'all'
    ? properties
    : properties.filter((p) => p.type === filterType);

  const getTypeLabel = (type: string) => {
    const found = propertyTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const handleAddPropertyClick = () => {
    const { allowed, reason } = canAddProperty();
    if (!allowed) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

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
        title="Properties"
        subtitle={`${stats.totalProperties} properties, ${stats.totalUnits} units total`}
        actions={
          <Button onClick={handleAddPropertyClick}>
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Badge
              variant={filterType === 'all' ? 'primary' : 'default'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFilterType('all')}
            >
              All Properties
            </Badge>
            {propertyTypes.map((type) => (
              <Badge
                key={type.value}
                variant={filterType === type.value ? 'primary' : 'default'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilterType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No properties yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first property to get started
            </p>
            <Button onClick={handleAddPropertyClick}>
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProperties.map((property) => (
              <Card key={property.id} hoverable padding="none">
                {/* Property Image */}
                <div className="h-40 bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center relative">
                  <Building2 className="h-12 w-12 text-blue-400" />
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{property.city || property.address}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="default" size="sm" className="mb-3">
                    {getTypeLabel(property.type)}
                  </Badge>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {property.totalUnits}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400"> units</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {property.occupiedUnits}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400"> occupied</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(property.monthlyRevenue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {Math.round(property.occupancyRate)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Add Property Card */}
            <Card
              hoverable
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer"
              onClick={handleAddPropertyClick}
            >
              <div className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Add New Property</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click to add a new property
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Property Limit Warning */}
        {!isPremium && (
          <div className="mt-6">
            <LimitWarning
              current={stats.totalProperties}
              max={FREE_TIER_LIMITS.maxProperties}
              type="properties"
            />
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Property"
        description="Enter the details of your property"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Input
            label="Property Name"
            placeholder="e.g., Sunrise Apartments"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Select
            label="Property Type"
            options={propertyTypes}
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as PropertyInsert['type'] })
            }
          />

          <Input
            label="Address"
            placeholder="Street address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="e.g., Makati City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Province"
              placeholder="e.g., Metro Manila"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            />
          </div>

          <Input
            label="Postal Code"
            placeholder="e.g., 1200"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
          />

          <Textarea
            label="Description"
            placeholder="Describe your property..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Add Property
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
        title="Property Limit Reached"
        description="You've reached the free tier limit for properties"
      >
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Upgrade for Unlimited Properties
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Free accounts are limited to {FREE_TIER_LIMITS.maxProperties} properties.
            Upgrade to Premium for unlimited properties and units.
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unlimited properties
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unlimited units per property
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Bulk unit uploads
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
