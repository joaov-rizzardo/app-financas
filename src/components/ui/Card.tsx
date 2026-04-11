import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'ghost';

interface CardProps extends ViewProps {
  className?: string;
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-background-surface border border-border',
  elevated: 'bg-background-elevated border border-border',
  ghost: 'bg-transparent',
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-2xl p-4', cardVariants[variant], className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn('mb-3', className)} {...props} />;
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View className={cn('mt-3 flex-row items-center', className)} {...props} />
  );
}

/** A decorative row of stat items. */
export function StatRow({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex-row gap-3', className)} {...props} />
  );
}

interface StatCardProps extends ViewProps {
  className?: string;
}

export function StatCard({ className, ...props }: StatCardProps) {
  return (
    <View
      className={cn(
        'flex-1 rounded-2xl p-4 bg-background-surface border border-border',
        className,
      )}
      {...props}
    />
  );
}
