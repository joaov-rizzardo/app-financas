import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Modal, View, Pressable, Animated } from 'react-native';
import { Text } from './Text';
import { colors } from '@/constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmDialogVariant = 'danger' | 'warning' | 'default';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_COLOR: Record<ConfirmDialogVariant, string> = {
  danger:  colors.danger,
  warning: colors.warning,
  default: colors.primary.DEFAULT,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const scale   = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 280,
          friction: 22,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.88);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  const accentColor = VARIANT_COLOR[variant];

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 28,
          opacity,
        }}
      >
        {/* Tap backdrop to dismiss */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onCancel}
        />

        {/* Card */}
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: colors.background.elevated,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
            padding: 24,
            alignItems: 'center',
            transform: [{ scale }],
            // top edge accent line
            borderTopWidth: 1,
            borderTopColor: accentColor + '55',
          }}
        >
          {/* Icon container */}
          {icon != null && (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: accentColor + '18',
                borderWidth: 1,
                borderColor: accentColor + '30',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              {icon}
            </View>
          )}

          {/* Title */}
          <Text size="xl" weight="bold" className="text-center mb-2">
            {title}
          </Text>

          {/* Message */}
          {message != null && (
            <Text
              size="sm"
              variant="muted"
              className="text-center"
              style={{ lineHeight: 20, marginBottom: 24 }}
            >
              {message}
            </Text>
          )}

          {/* Spacer when no message */}
          {message == null && <View style={{ height: 20 }} />}

          {/* Actions */}
          <View style={{ width: '100%', gap: 10 }}>
            {/* Primary / destructive action */}
            <Pressable
              onPress={onConfirm}
              className="active:opacity-75"
              style={{
                height: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accentColor,
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: '700',
                  letterSpacing: 0.3,
                  fontFamily: 'Inter_700Bold',
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>

            {/* Cancel */}
            <Pressable
              onPress={onCancel}
              className="active:opacity-75"
              style={{
                height: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background.card,
                borderWidth: 1,
                borderColor: colors.border.DEFAULT,
              }}
            >
              <Text size="sm" weight="semibold" variant="secondary">
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
