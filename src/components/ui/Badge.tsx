import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Text } from './Text';

const badgeVariants = cva('flex-row items-center rounded-full px-2.5 py-0.5', {
  variants: {
    variant: {
      default: 'bg-primary/15',
      success: 'bg-success/15',
      warning: 'bg-warning/15',
      danger: 'bg-danger/15',
      info: 'bg-info/15',
      accent: 'bg-accent/15',
      outline: 'border border-border',
    },
  },
  defaultVariants: { variant: 'default' },
});

const textVariants = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-300',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
      accent: 'text-accent-400',
      outline: 'text-text-secondary',
    },
  },
  defaultVariants: { variant: 'default' },
});

interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  label: string;
  className?: string;
}

export function Badge({ label, variant, className, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(textVariants({ variant }))}>{label}</Text>
    </View>
  );
}

/** A colored dot + label indicator. */
interface DotBadgeProps {
  label: string;
  color: string;
  className?: string;
}

export function DotBadge({ label, color, className }: DotBadgeProps) {
  return (
    <View className={cn('flex-row items-center gap-1.5', className)}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text size="xs" variant="muted">{label}</Text>
    </View>
  );
}
