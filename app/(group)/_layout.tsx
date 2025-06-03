import { TabNavigator } from "@/components/tab-navigator/tab-navigator.component";
import { backgroundColor } from "@/constants/colors";
import { Slot } from "expo-router";
import { ScrollView, StatusBar, View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: "backgroundColor" }}>
      <View style={{ height: 50, backgroundColor: "#000" }} />
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
