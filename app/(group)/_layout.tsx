import { TabNavigator } from "@/components/tab-navigator/tab-navigator.component";
import { backgroundColor } from "@/constants/colors";
import { Slot } from "expo-router";
// import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor}}>
      {/* Faixa preta superior */}
      <View style={{ height: 50, backgroundColor: "#000" }} />

      {/* Conteúdo principal */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      <TabNavigator />
      {/* <StatusBar barStyle="dark-content" translucent backgroundColor={backgroundColor} /> */}
    </View>
  );
}
