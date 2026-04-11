import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface TextProps extends RNTextProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'muted' | 'destructive' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  tracking?: 'tight' | 'normal' | 'wide' | 'widest';
}

const variantClasses: Record<NonNullable<TextProps['variant']>, string> = {
  default: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  destructive: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
};

const sizeClasses: Record<NonNullable<TextProps['size']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

const weightClasses: Record<NonNullable<TextProps['weight']>, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const trackingClasses: Record<NonNullable<TextProps['tracking']>, string> = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  widest: 'tracking-widest',
};

export function Text({
  className,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  tracking,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        weightClasses[weight],
        tracking && trackingClasses[tracking],
        className,
      )}
      {...props}
    />
  );
}

/** Uppercase eyebrow label — used for section titles and screen subtitles. */
export function Label({ className, ...props }: TextProps) {
  return (
    <Text
      size="xs"
      weight="semibold"
      variant="muted"
      tracking="widest"
      className={cn('uppercase', className)}
      {...props}
    />
  );
}
