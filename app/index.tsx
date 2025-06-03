import { backgroundColor } from "@/constants/colors";
import {
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    useFonts,
} from "@expo-google-fonts/montserrat";
import { Redirect } from "expo-router";
import * as SystemUI from "expo-system-ui";

export default function Root() {
  useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  SystemUI.setBackgroundColorAsync(backgroundColor);
  return <Redirect href={"/home"} />;
}
