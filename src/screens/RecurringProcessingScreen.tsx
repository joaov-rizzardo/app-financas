import * as React from 'react';
import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Wallet, RefreshCw, CheckCircle2, Loader } from 'lucide-react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'checking' | 'processing' | 'ready';

export interface ProcessingProgress {
  total: number;
  processed: number;
  currentDescription: string;
}

export interface RecurringProcessingScreenProps {
  status: AppStatus;
  progress?: ProcessingProgress;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WalletMark() {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  return (
    <Animated.View style={[styles.walletWrap, { transform: [{ scale: breathe }] }]}>
      <Wallet size={28} color="#a78bfa" strokeWidth={1.5} />
    </Animated.View>
  );
}

function SpinningIcon({ Icon }: { Icon: typeof RefreshCw }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 1400, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotate]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Icon size={22} color="#7c3aed" strokeWidth={1.8} />
    </Animated.View>
  );
}

function CheckmarkReveal() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <CheckCircle2 size={32} color="#10b981" strokeWidth={1.5} />
    </Animated.View>
  );
}

function AnimatedDescription({ text }: { text: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(4)).current;
  const prevText = useRef(text);

  useEffect(() => {
    if (prevText.current === text) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      return;
    }

    // Fade out → update → fade in
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -4, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      prevText.current = text;
      translateY.setValue(4);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  }, [text, opacity, translateY]);

  return (
    <Animated.Text style={[styles.itemDescription, { opacity, transform: [{ translateY }] }]}>
      {text}
    </Animated.Text>
  );
}

function ProgressBar({ value }: { value: number }) {
  const width = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const barWidth = Math.min(screenWidth - 80, 300);

  useEffect(() => {
    Animated.timing(width, {
      toValue: Math.max(0, Math.min(1, value)),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [value, width]);

  const animatedWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth],
  });

  return (
    <View style={[styles.progressTrack, { width: barWidth }]}>
      <Animated.View style={[styles.progressFill, { width: animatedWidth }]} />
    </View>
  );
}

function PulseDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, delay]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RecurringProcessingScreen({
  status,
  progress,
}: RecurringProcessingScreenProps) {
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [contentOpacity]);

  const progressRatio =
    progress && progress.total > 0 ? progress.processed / progress.total : 0;

  return (
    <View style={styles.root}>
      {/* Subtle radial glow behind content */}
      <View style={styles.glow} />

      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {/* Brand mark */}
        <WalletMark />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Status area */}
        {status === 'checking' && (
          <View style={styles.statusBlock}>
            <View style={styles.row}>
              <SpinningIcon Icon={Loader} />
              <Text style={styles.statusLabel}>Verificando recorrências...</Text>
            </View>
          </View>
        )}

        {status === 'processing' && progress && (
          <View style={styles.statusBlock}>
            <Text style={styles.title}>Atualizando lançamentos</Text>

            <View style={styles.progressSection}>
              <ProgressBar value={progressRatio} />

              <View style={styles.counterRow}>
                <View style={styles.row}>
                  <SpinningIcon Icon={RefreshCw} />
                  <Text style={styles.counter}>
                    {progress.processed} de {progress.total} itens
                  </Text>
                </View>
                <View style={styles.dotsRow}>
                  <PulseDot delay={0} />
                  <PulseDot delay={160} />
                  <PulseDot delay={320} />
                </View>
              </View>
            </View>

            <AnimatedDescription text={progress.currentDescription} />
          </View>
        )}

        {status === 'ready' && (
          <View style={styles.statusBlock}>
            <CheckmarkReveal />
            <Text style={styles.readyLabel}>Tudo em dia!</Text>
          </View>
        )}
      </Animated.View>

      {/* Bottom wordmark */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>app finanças</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f14',
    alignItems: 'center',
    justifyContent: 'center',
  },

  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    opacity: 0.04,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -170 }, { translateY: -170 }],
  },

  content: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 40,
  },

  walletWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#17171f',
    borderWidth: 1,
    borderColor: '#2a2a3d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#2a2a3d',
  },

  statusBlock: {
    alignItems: 'center',
    gap: 16,
    minHeight: 100,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusLabel: {
    fontSize: 15,
    color: '#a0a0b8',
    letterSpacing: 0.2,
    fontWeight: '400',
  },

  title: {
    fontSize: 17,
    color: '#f4f4f8',
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  progressSection: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },

  progressTrack: {
    height: 3,
    backgroundColor: '#1e1e2a',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7c3aed',
  },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },

  counter: {
    fontSize: 13,
    color: '#a0a0b8',
    fontWeight: '500',
  },

  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7c3aed',
  },

  itemDescription: {
    fontSize: 13,
    color: '#5c5c78',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.15,
  },

  readyLabel: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 4,
  },

  footer: {
    position: 'absolute',
    bottom: 48,
  },

  footerText: {
    fontSize: 11,
    color: '#2a2a3d',
    letterSpacing: 2,
    textTransform: 'lowercase',
    fontWeight: '500',
  },
});
