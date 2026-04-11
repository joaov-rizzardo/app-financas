import * as React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  PieChart,
  Target,
  BarChart2,
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import {
  DashboardScreen,
  TransactionsScreen,
  CreditCardScreen,
  BudgetsScreen,
  GoalsScreen,
  ReportsScreen,
} from '@/screens';
import type { TabParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

const ICON_SIZE = 21;

function TabIcon({
  icon: Icon,
  color,
  focused,
}: {
  icon: React.ElementType;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 32,
        borderRadius: 10,
        backgroundColor: focused ? colors.primary.DEFAULT + '20' : 'transparent',
      }}
    >
      <Icon size={ICON_SIZE} color={color} strokeWidth={focused ? 2.2 : 1.8} />
    </View>
  );
}

const TAB_SCREENS: {
  name: keyof TabParamList;
  component: React.ComponentType;
  icon: React.ElementType;
  label: string;
}[] = [
  { name: 'Dashboard',    component: DashboardScreen,    icon: LayoutDashboard, label: 'Início' },
  { name: 'Lançamentos',  component: TransactionsScreen, icon: ArrowLeftRight,  label: 'Lançamentos' },
  { name: 'Cartão',       component: CreditCardScreen,   icon: CreditCard,      label: 'Cartão' },
  { name: 'Orçamentos',   component: BudgetsScreen,      icon: PieChart,        label: 'Orçamentos' },
  { name: 'Metas',        component: GoalsScreen,        icon: Target,          label: 'Metas' },
  { name: 'Relatórios',   component: ReportsScreen,      icon: BarChart2,       label: 'Relatórios' },
];

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const screen = TAB_SCREENS.find((s) => s.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            screen ? (
              <TabIcon icon={screen.icon} color={color} focused={focused} />
            ) : null,
          tabBarLabel: screen?.label ?? route.name,
          tabBarActiveTintColor: colors.primary.DEFAULT,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarStyle: {
            backgroundColor: colors.background.surface,
            borderTopColor: colors.border.DEFAULT,
            borderTopWidth: 1,
            height: 68,
            paddingBottom: 12,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
        };
      }}
    >
      {TAB_SCREENS.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Tab.Navigator>
  );
}
