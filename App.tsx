import 'react-native-gesture-handler';
import 'react-native-get-random-values'

import { SafeAreaProvider, initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind/dist/use-color-scheme';

// Expo and App Loading
import { useCallback } from 'react';

import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";

import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

import Routes from 'routes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';

export default function App() {
    const { colorScheme } = useColorScheme()

    let [fontsLoaded] = useFonts({
        Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
        Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }} className={"bg-white dark:bg-gray-300"} onLayout={onLayoutRootView}>
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <PortalProvider>
                    <Routes />
                    <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                </PortalProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
