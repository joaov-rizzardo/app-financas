import { backgroundColor } from "@/constants/colors";
import { Redirect } from "expo-router";
import * as SystemUI from 'expo-system-ui';

export default function Root(){
    SystemUI.setBackgroundColorAsync(backgroundColor);
    return <Redirect href={"/home"}/>
}