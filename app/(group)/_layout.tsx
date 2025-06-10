import { ConfirmModal } from "@/components/confirm-modal/confirm-modal.component";
import { ErrorModal } from "@/components/error-modal/error-modal.component";
import { TabNavigator } from "@/components/tab-navigator/tab-navigator.component";
import { Topbar } from "@/components/top-bar/top-bar.component";
import { backgroundColor } from "@/constants/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { StatusBar, View } from "react-native";

export default function Layout() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorModal />
      <ConfirmModal />
      <View style={{ flex: 1, backgroundColor: backgroundColor }}>
        <Topbar />
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <TabNavigator />
        <StatusBar
          barStyle="dark-content"
          translucent
          backgroundColor={backgroundColor}
        />
      </View>
    </QueryClientProvider>
  );
}
