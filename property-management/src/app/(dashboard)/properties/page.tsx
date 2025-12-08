'use client';

import { Header } from '@/components/layout';
import { Button, Card, Badge, EmptyState } from '@/components/ui';
import {
  Plus,
  Building2,
  MapPin,
  BedDouble,
  Users,
  MoreVertical,
  Filter,
  Grid3X3,
  List,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

const properties = [
  {
    id: 1,
    name: 'Sunrise Apartments',
    address: '123 Makati Ave, Makati City',
    image: null,
    units: 16,
    occupied: 15,
    revenue: 245000,
    type: 'Apartment',
  },
  {
    id: 2,
    name: 'Green Valley Residences',
    address: '456 Commonwealth Ave, Quezon City',
    image: null,
    units: 12,
    occupied: 10,
    revenue: 156000,
    type: 'Condo',
  },
  {
    id: 3,
    name: 'Metro Heights',
    address: '789 Ortigas Center, Pasig City',
    image: null,
    units: 20,
    occupied: 15,
    revenue: 84000,
    type: 'Apartment',
  },
  {
    id: 4,
    name: 'Seaside Manor',
    address: '321 Roxas Blvd, Manila',
    image: null,
    units: 8,
    occupied: 8,
    revenue: 120000,
    type: 'House',
  },
];

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <>
      <Header
        title="Properties"
        subtitle={`${properties.length} properties total`}
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Badge variant="primary" className="cursor-pointer whitespace-nowrap">
              All Properties
            </Badge>
            <Badge variant="default" className="cursor-pointer whitespace-nowrap">
              Apartments
            </Badge>
            <Badge variant="default" className="cursor-pointer whitespace-nowrap">
              Condos
            </Badge>
            <Badge variant="default" className="cursor-pointer whitespace-nowrap">
              Houses
            </Badge>
            <Badge variant="default" className="cursor-pointer whitespace-nowrap">
              Boarding Houses
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <Card key={property.id} hoverable padding="none">
              {/* Property Image */}
              <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-blue-400" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{property.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{property.address}</span>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <Badge variant="default" size="sm" className="mb-3">
                  {property.type}
                </Badge>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{property.units}</span>
                      <span className="text-gray-500 dark:text-gray-400"> units</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{property.occupied}</span>
                      <span className="text-gray-500 dark:text-gray-400"> occupied</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(property.revenue)}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {/* Add Property Card */}
          <Card
            hoverable
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center min-h-[300px] bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
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
      </div>
    </>
  );
}
