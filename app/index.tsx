import { backgroundColor } from "@/constants/colors";
import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { Redirect } from "expo-router";
import * as SystemUI from "expo-system-ui";

export default function Root() {
  useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  SystemUI.setBackgroundColorAsync(backgroundColor);
  return <Redirect href={"/home"} />;
}
