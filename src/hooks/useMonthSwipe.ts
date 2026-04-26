import { useRef } from 'react';
import { PanResponder } from 'react-native';

const SWIPE_THRESHOLD = 50;

export function useMonthSwipe(onPrev: () => void, onNext: () => void) {
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
      onPanResponderRelease: (_, { dx }) => {
        if (dx > SWIPE_THRESHOLD) onPrevRef.current();
        else if (dx < -SWIPE_THRESHOLD) onNextRef.current();
      },
    }),
  ).current;

  return panResponder.panHandlers;
}
