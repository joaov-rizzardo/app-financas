import * as React from 'react';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Modal, View, Pressable, Animated } from 'react-native';
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
  isLoading?: boolean;
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
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const scale        = useRef(new Animated.Value(0.9)).current;
  const translateY   = useRef(new Animated.Value(36)).current;
  const opacity      = useRef(new Animated.Value(0)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const glowScale    = useRef(new Animated.Value(0.5)).current;
  const ringScale    = useRef(new Animated.Value(0.5)).current;
  const ringOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.9);
      translateY.setValue(36);
      opacity.setValue(0);
      glowOpacity.setValue(0);
      glowScale.setValue(0.5);
      ringScale.setValue(0.5);
      ringOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 280,
          friction: 22,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 280,
          friction: 22,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.11,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1,
          tension: 160,
          friction: 18,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(110),
          Animated.parallel([
            Animated.spring(ringScale, {
              toValue: 1,
              tension: 200,
              friction: 16,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    } else {
      scale.setValue(0.9);
      translateY.setValue(36);
      opacity.setValue(0);
      glowOpacity.setValue(0);
      glowScale.setValue(0.5);
      ringScale.setValue(0.5);
      ringOpacity.setValue(0);
    }
  }, [visible, scale, translateY, opacity, glowOpacity, glowScale, ringScale, ringOpacity]);

  const accentColor = VARIANT_COLOR[variant];

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.80)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          opacity,
        }}
      >
        {/* Tap backdrop to dismiss */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={isLoading ? undefined : onCancel}
        />

        {/* Ambient glow blob */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: 170,
            backgroundColor: accentColor,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          }}
        />

        {/* Card */}
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: colors.background.elevated,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
            borderTopWidth: 2,
            borderTopColor: accentColor,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.32,
            shadowRadius: 28,
            elevation: 20,
            transform: [{ scale }, { translateY }],
          }}
        >
          <View style={{ padding: 28, paddingTop: 26, alignItems: 'center' }}>

            {/* Icon with concentric rings */}
            {icon != null && (
              <View style={{
                width: 96,
                height: 96,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 22,
              }}>
                {/* Outer ring */}
                <Animated.View style={{
                  position: 'absolute',
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  borderWidth: 1,
                  borderColor: accentColor + '20',
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                }} />
                {/* Mid ring */}
                <Animated.View style={{
                  position: 'absolute',
                  width: 74,
                  height: 74,
                  borderRadius: 37,
                  borderWidth: 1,
                  borderColor: accentColor + '38',
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                }} />
                {/* Icon box */}
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 17,
                  backgroundColor: accentColor + '14',
                  borderWidth: 1,
                  borderColor: accentColor + '30',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {icon}
                </View>
              </View>
            )}

            {/* Title */}
            <Text
              size="xl"
              weight="bold"
              style={{ textAlign: 'center', marginBottom: 8, letterSpacing: -0.3 }}
            >
              {title}
            </Text>

            {/* Message */}
            {message != null ? (
              <Text
                size="sm"
                variant="muted"
                style={{ textAlign: 'center', lineHeight: 21, marginBottom: 28 }}
              >
                {message}
              </Text>
            ) : (
              <View style={{ height: 24 }} />
            )}

            {/* Actions */}
            <View style={{ width: '100%', gap: 10 }}>
              {/* Confirm */}
              <Pressable
                onPress={isLoading ? undefined : onConfirm}
                className="active:opacity-80"
                style={{
                  height: 54,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: accentColor,
                  shadowColor: accentColor,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isLoading ? 0.15 : 0.55,
                  shadowRadius: 18,
                  elevation: 12,
                  opacity: isLoading ? 0.8 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 15,
                      fontWeight: '700',
                      letterSpacing: 0.15,
                      fontFamily: 'Inter_700Bold',
                    }}
                  >
                    {confirmLabel}
                  </Text>
                )}
              </Pressable>

              {/* Cancel */}
              <Pressable
                onPress={isLoading ? undefined : onCancel}
                className="active:opacity-60"
                style={{
                  height: 50,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border.DEFAULT,
                  opacity: isLoading ? 0.3 : 1,
                }}
              >
                <Text size="sm" weight="semibold" variant="secondary">
                  {cancelLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
