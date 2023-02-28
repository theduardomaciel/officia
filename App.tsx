import { PortalProvider } from '@gorhom/portal';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

// Customization
import { useColorScheme } from 'nativewind';

// App Loading (fonts, splash screen, etc.)

import { AbrilFatface_400Regular } from "@expo-google-fonts/abril-fatface"
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold } from "@expo-google-fonts/raleway";

import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

// Routes
import Routes from 'routes';
import { AuthProvider, useAuth } from 'context/AuthContext';

export default function App() {
    const { colorScheme } = useColorScheme()
    const { loading } = useAuth();

    let [fontsLoaded] = useFonts({
        Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
        Raleway_400Regular, Raleway_600SemiBold, Raleway_700Bold,
        AbrilFatface_400Regular
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (loading || !fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <GestureHandlerRootView style={{ flex: 1 }} className={"bg-white dark:bg-gray-300"} onLayout={onLayoutRootView}>
                <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                    <PortalProvider>
                        <Routes />
                        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
                    </PortalProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </AuthProvider>
    );
}
