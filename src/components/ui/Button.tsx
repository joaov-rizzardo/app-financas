import * as React from 'react';
import { Pressable, type PressableProps, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Text } from './Text';

const buttonVariants = cva(
  'flex-row items-center justify-center active:opacity-75',
  {
    variants: {
      variant: {
        primary: 'bg-primary rounded-xl',
        accent: 'bg-accent rounded-xl',
        secondary: 'bg-background-elevated border border-border rounded-xl',
        outline: 'border border-primary rounded-xl',
        ghost: 'bg-transparent rounded-xl',
        destructive: 'bg-danger rounded-xl',
      },
      size: {
        xs: 'h-7 px-3',
        sm: 'h-9 px-4',
        md: 'h-11 px-5',
        lg: 'h-13 px-6',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

const labelVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-white font-semibold',
      accent: 'text-white font-semibold',
      secondary: 'text-text-primary font-medium',
      outline: 'text-primary-400 font-semibold',
      ghost: 'text-text-primary font-medium',
      destructive: 'text-white font-semibold',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
  label?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  label,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? '#7c3aed' : '#fff'}
        />
      ) : children ? (
        children
      ) : (
        <Text className={cn(labelVariants({ variant, size }))}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Chip — a small selectable filter button. */
interface ChipProps extends PressableProps {
  label: string;
  selected?: boolean;
  className?: string;
}

export function Chip({ label, selected = false, className, ...props }: ChipProps) {
  return (
    <Pressable
      className={cn(
        'h-8 px-4 rounded-full flex-row items-center justify-center active:opacity-75',
        selected
          ? 'bg-primary'
          : 'bg-background-elevated border border-border',
        className,
      )}
      {...props}
    >
      <Text
        size="sm"
        weight="medium"
        className={selected ? 'text-white' : 'text-text-secondary'}
      >
        {label}
      </Text>
    </Pressable>
  );
}
