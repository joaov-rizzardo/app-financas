import * as React from 'react';
import { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { colors } from '@/constants/colors';

function SkeletonRow() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity, flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background.card, marginRight: 12 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ width: '55%', height: 12, borderRadius: 6, backgroundColor: colors.background.card }} />
        <View style={{ width: '35%', height: 10, borderRadius: 5, backgroundColor: colors.background.card }} />
      </View>
      <View style={{ width: 60, height: 12, borderRadius: 6, backgroundColor: colors.background.card }} />
    </Animated.View>
  );
}

export function LoadingSkeleton() {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ width: 70, height: 10, borderRadius: 5, backgroundColor: colors.background.elevated, marginBottom: 10, marginLeft: 4 }} />
      <Card>
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <SkeletonRow />
            {i < 3 && <Separator />}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
}
