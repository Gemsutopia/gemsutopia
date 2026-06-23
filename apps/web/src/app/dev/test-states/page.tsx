'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  AuctionCardSkeleton,
  AuctionGridSkeleton,
  CategoryCardSkeleton,
  OrderRowSkeleton,
  OrderListSkeleton,
  CartItemSkeleton,
  CartSkeleton,
  ReviewSkeleton,
  ReviewListSkeleton,
  StatsCardSkeleton,
  DashboardStatsSkeleton,
  TableSkeleton,
  FormSkeleton,
  ProductDetailSkeleton,
  PageHeaderSkeleton,
  FullPageSkeleton,
} from '@/components/skeletons';

export default function DevTestStates() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#111118]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dev: Skeleton States</h1>
              <p className="text-gray-400 text-sm mt-1">
                Preview all skeleton loading states
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Basic Skeleton */}
          <Section title="Basic Skeleton">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Section>

          {/* Product Skeletons */}
          <Section title="Product Card">
            <div className="max-w-xs">
              <ProductCardSkeleton />
            </div>
          </Section>

          <Section title="Product Grid (8 items)">
            <ProductGridSkeleton count={8} />
          </Section>

          <Section title="Product Detail">
            <ProductDetailSkeleton />
          </Section>

          {/* Auction Skeletons */}
          <Section title="Auction Card">
            <div className="max-w-sm">
              <AuctionCardSkeleton />
            </div>
          </Section>

          <Section title="Auction Grid (6 items)">
            <AuctionGridSkeleton count={6} />
          </Section>

          {/* Category Skeleton */}
          <Section title="Category Card">
            <div className="max-w-xs">
              <CategoryCardSkeleton />
            </div>
          </Section>

          {/* Cart Skeletons */}
          <Section title="Cart Item">
            <div className="max-w-md bg-[#111118] rounded-xl border border-gray-800">
              <CartItemSkeleton />
            </div>
          </Section>

          <Section title="Full Cart">
            <div className="max-w-md bg-[#111118] rounded-xl border border-gray-800">
              <CartSkeleton count={3} />
            </div>
          </Section>

          {/* Order Skeletons */}
          <Section title="Order Row">
            <div className="bg-[#111118] rounded-xl border border-gray-800">
              <OrderRowSkeleton />
            </div>
          </Section>

          <Section title="Order List">
            <OrderListSkeleton count={5} />
          </Section>

          {/* Review Skeletons */}
          <Section title="Review">
            <div className="max-w-lg bg-[#111118] rounded-xl border border-gray-800">
              <ReviewSkeleton />
            </div>
          </Section>

          <Section title="Review List">
            <div className="max-w-lg bg-[#111118] rounded-xl border border-gray-800">
              <ReviewListSkeleton count={3} />
            </div>
          </Section>

          {/* Dashboard Skeletons */}
          <Section title="Stats Card">
            <div className="max-w-xs">
              <StatsCardSkeleton />
            </div>
          </Section>

          <Section title="Dashboard Stats">
            <DashboardStatsSkeleton />
          </Section>

          {/* Table Skeleton */}
          <Section title="Table (5 rows, 4 cols)">
            <TableSkeleton rows={5} cols={4} />
          </Section>

          {/* Form Skeleton */}
          <Section title="Form">
            <div className="max-w-md bg-[#111118] rounded-xl border border-gray-800 p-6">
              <FormSkeleton fields={4} />
            </div>
          </Section>

          {/* Page Header */}
          <Section title="Page Header">
            <PageHeaderSkeleton />
          </Section>

          {/* Full Page */}
          <Section title="Full Page">
            <FullPageSkeleton />
          </Section>
        </div>
      </div>
    </div>
  );
}

// Section wrapper component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}
