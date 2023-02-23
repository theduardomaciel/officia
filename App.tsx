import { useCallback } from 'react';
import { Platform, UIManager } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import { StatusBar } from 'expo-status-bar';

// Customization
import { useColorScheme } from 'nativewind';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// App Loading (fonts, splash screen, etc.)

import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";

import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

// Routes
import Routes from 'routes';

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
