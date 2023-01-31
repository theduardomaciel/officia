import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Expo and App Loading
import { useCallback } from 'react';

import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Raleway_400Regular, Raleway_700Bold } from "@expo-google-fonts/raleway";

import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

import Routes from 'routes';
import colors from "global/colors";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
    let [fontsLoaded] = useFonts({
        Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Raleway_400Regular, Raleway_700Bold,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    // <GestureHandlerRootView >
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics} className="flex-1 bg-bg-300" onLayout={onLayoutRootView}>
            <Routes />
            <StatusBar style="light" />
        </SafeAreaProvider>
    );
}
//</GestureHandlerRootView>