import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Home() {
  return (
    <View>
      <Text>Olá home</Text>
      <Link href={"/charts"}>Opa</Link>
    </View>
  );
}
