import * as React from 'react';
import { Animated, Pressable, View, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { colors } from '@/constants/colors';

// ─── Variant tokens ───────────────────────────────────────────────────────────

type ActionButtonVariant = 'primary' | 'success' | 'danger' | 'accent';

const VARIANTS: Record<ActionButtonVariant, { base: string; light: string }> = {
  primary: { base: colors.primary.DEFAULT,  light: colors.primary[400] },
  success: { base: colors.success,           light: '#34d399' },
  danger:  { base: colors.danger,            light: '#f87171' },
  accent:  { base: colors.accent.DEFAULT,    light: '#22d3ee' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

type LucideIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface ActionButtonProps {
  /** Button label (shown when not loading) */
  label: string;
  /** Lucide icon component */
  icon: LucideIconComponent;
  /** Label shown during loading state — defaults to "Salvando…" */
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  variant?: ActionButtonVariant;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActionButton({
  label,
  icon: Icon,
  loadingLabel = 'Salvando…',
  loading = false,
  disabled = false,
  onPress,
  variant = 'primary',
}: ActionButtonProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const { base, light } = VARIANTS[variant];
  const isDisabled = loading || disabled;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.965,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        opacity: disabled && !loading ? 0.5 : 1,
        // Shadow lives on the outer wrapper so it follows the scale
        shadowColor: base,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
        elevation: 14,
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={{
          height: 56,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: base,
          borderWidth: 1,
          borderColor: light + '28',
        }}
      >
        {/* Top sheen — one-pixel lighter highlight for dimensionality */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: light + '55',
          }}
        />

        {/* Icon zone */}
        <View
          style={{
            width: 56,
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.22)',
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.07)',
          }}
        >
          {loading ? (
            <ActivityIndicator color="rgba(255,255,255,0.9)" size="small" />
          ) : (
            <Icon size={20} color="#fff" strokeWidth={2.2} />
          )}
        </View>

        {/* Label */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 15,
              fontWeight: '700',
              letterSpacing: 0.4,
              fontFamily: 'Inter_700Bold',
            }}
          >
            {loading ? loadingLabel : label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
