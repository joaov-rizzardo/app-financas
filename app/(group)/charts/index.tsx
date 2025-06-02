import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Charts(){
    return (
        <View>
            <Text>Página de gráficos</Text>
            <Link href={"/home"}>Graficos</Link>
        </View>
    )
}