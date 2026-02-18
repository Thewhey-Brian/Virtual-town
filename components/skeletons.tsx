'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'card' | 'text' | 'avatar';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseStyles = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variants = {
    default: 'rounded-md',
    circle: 'rounded-full',
    card: 'rounded-xl',
    text: 'rounded h-4',
    avatar: 'rounded-full',
  };

  const sizes = {
    default: { width: width || '100%', height: height || '1rem' },
    circle: { width: width || '3rem', height: height || '3rem' },
    card: { width: width || '100%', height: height || '200px' },
    text: { width: width || '100%', height: height || '1rem' },
    avatar: { width: width || '2.5rem', height: height || '2.5rem' },
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        animate && 'animate-shimmer',
        className
      )}
      style={{
        width: sizes[variant].width,
        height: sizes[variant].height,
      }}
    />
  );
}

/**
 * Character card skeleton
 */
export function CharacterCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-start gap-3">
            <Skeleton variant="avatar" width={56} height={56} />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width="60%" />
                <Skeleton width={40} />
              </div>
              <Skeleton width="40%" />
              <Skeleton width="30%" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Place card skeleton
 */
export function PlaceCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
          <Skeleton variant="card" height={120} className="mb-3" />
          <Skeleton width="70%" className="mb-2" />
          <Skeleton width="40%" />
        </div>
      ))}
    </>
  );
}

/**
 * Event card skeleton
 */
export function EventCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" />
              <Skeleton width="30%" />
            </div>
          </div>
          <Skeleton />
          <Skeleton width="80%" className="mt-2" />
        </div>
      ))}
    </>
  );
}

/**
 * Stat card skeleton
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={40} height={40} />
            <div className="space-y-2">
              <Skeleton width={60} height={24} />
              <Skeleton width={80} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * List item skeleton
 */
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton variant="circle" width={32} height={32} />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" />
            <Skeleton width="70%" />
          </div>
          <Skeleton width={60} />
        </div>
      ))}
    </>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${100 / columns}%`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton width="30%" className="mb-2" />
          <Skeleton height={40} />
        </div>
      ))}
      <Skeleton width="100%" height={40} className="mt-6" />
    </div>
  );
}

/**
 * Map placeholder skeleton
 */
export function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
        <Skeleton width={120} />
        <Skeleton width={80} className="mt-2 mx-auto" />
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton width={200} height={32} className="mb-2" />
        <Skeleton width={300} />
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardSkeleton count={4} />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton height={200} variant="card" />
          <Skeleton height={150} variant="card" />
        </div>
        <div className="space-y-4">
          <Skeleton height={300} variant="card" />
        </div>
      </div>
    </div>
  );
}

/**
 * Page loading wrapper
 */
export function PageLoading({ 
  children,
  isLoading,
  skeleton,
}: { 
  children: ReactNode;
  isLoading: boolean;
  skeleton?: ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {skeleton || <DashboardSkeleton />}
      </div>
    );
  }

  return <>{children}</>;
}

// Add shimmer keyframe animation to globals.css
export const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
`;
