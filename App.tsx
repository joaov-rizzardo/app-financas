import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as NavigationBar from 'expo-navigation-bar';
import './global.css';

// Must be called before any Screen component is rendered
enableScreens(false);
import { TabNavigator } from '@/navigation/TabNavigator';
import { colors } from '@/constants/colors';
import { RecurringProcessingScreen, type ProcessingProgress } from '@/screens/RecurringProcessingScreen';
import { hasPendingRecurringItems, processRecurringItems } from '@/services/recurringProcessor';
import { hasPendingCardRecurringItems, processCardRecurringItems } from '@/services/creditCardRecurringProcessor';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'checking' | 'processing' | 'ready';

// ─── Constants ────────────────────────────────────────────────────────────────

const queryClient = new QueryClient();

const READY_DISPLAY_DURATION = 1200; // ms to show the "Tudo em dia!" screen

// ─── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const [status, setStatus] = useState<AppStatus>('checking');
  const [progress, setProgress] = useState<ProcessingProgress | undefined>(undefined);
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(colors.background.DEFAULT);
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  const handleProgress = useCallback((p: ProcessingProgress) => {
    setProgress(p);
  }, []);

  useEffect(() => {
    async function runStartupCheck() {
      try {
        const [hasPending, hasPendingCard] = await Promise.all([
          hasPendingRecurringItems(),
          hasPendingCardRecurringItems(),
        ]);

        if (!hasPending && !hasPendingCard) {
          setShowApp(true);
          return;
        }

        setStatus('processing');
        if (hasPending) await processRecurringItems(handleProgress);
        if (hasPendingCard) await processCardRecurringItems(handleProgress);
        setStatus('ready');

        // Brief success display before handing off to the app
        setTimeout(() => setShowApp(true), READY_DISPLAY_DURATION);
      } catch {
        // On unexpected error, fall through to the app without blocking
        setShowApp(true);
      }
    }

    runStartupCheck();
  }, [handleProgress]);

  if (!showApp) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.background.DEFAULT} />
        <RecurringProcessingScreen status={status} progress={progress} />
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.primary.DEFAULT,
              background: colors.background.DEFAULT,
              card: colors.background.surface,
              text: colors.text.primary,
              border: colors.border.DEFAULT,
              notification: colors.primary.DEFAULT,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '900' },
            },
          }}
        >
          <StatusBar style="light" backgroundColor={colors.background.DEFAULT} />
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
