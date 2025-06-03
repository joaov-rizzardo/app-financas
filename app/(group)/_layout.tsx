import { TabNavigator } from "@/components/tab-navigator/tab-navigator.component";
import { Topbar } from "@/components/top-bar/top-bar.component";
import { backgroundColor } from "@/constants/colors";
import { Slot } from "expo-router";
import { ScrollView, StatusBar, View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: "backgroundColor" }}>
      <Topbar />
      <ScrollView style={{ flex: 1 }}>
        <Slot />
      </ScrollView>
      <TabNavigator />
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor={backgroundColor}
      />
    </View>
  );
}
