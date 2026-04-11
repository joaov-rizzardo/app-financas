import * as React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

// Must be called before any Screen component is rendered
enableScreens(false);
import { TabNavigator } from '@/navigation/TabNavigator';
import { colors } from '@/constants/colors';

export default function App() {
  return (
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
  );
}
