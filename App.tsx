import { PortalHost, PortalProvider } from "@gorhom/portal";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    initialWindowMetrics,
    SafeAreaProvider,
} from "react-native-safe-area-context";

// Customization
import { useColorScheme } from "nativewind";

import { Platform, UIManager } from "react-native";
if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Components
import Modal from "components/Modal";
import Toast from "components/Toast";

// App Loading (fonts, splash screen, etc.)

import { AbrilFatface_400Regular } from "@expo-google-fonts/abril-fatface";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    useFonts,
} from "@expo-google-fonts/inter";
import {
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
} from "@expo-google-fonts/raleway";

import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();

// Routes
import Routes from "navigation/routes";
import { AuthProvider, useAuth } from "context/AuthContext";

export default function App() {
    const { colorScheme } = useColorScheme();
    const { isLoading } = useAuth();

    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black,
        Raleway_400Regular,
        Raleway_600SemiBold,
        Raleway_700Bold,
        AbrilFatface_400Regular,
    });

    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
            // setIsUpdateModalVisible(true);
        }
    }, [fontsLoaded]);

    if (isLoading || !fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <GestureHandlerRootView
                style={{ flex: 1 }}
                className={"bg-white dark:bg-gray-300"}
                onLayout={onLayoutRootView}
            >
                <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                    <PortalProvider>
                        <Routes />
                        <StatusBar
                            style="light"
                            //style={colorScheme === "dark" ? "light" : "dark"}
                        />
                        {/* <Modal
                            isVisible={isUpdateModalVisible}
                            toggleVisibility={() =>
                                setIsUpdateModalVisible(!isUpdateModalVisible)
                            }
                            title="Há uma nova versão disponível"
                            description="Deseja atualizar agora?"
                            buttons={[
                                {
                                    label: "Atualizar",
                                },
                            ]}
                            cancelButton
                        /> */}
                        <Toast
                            toastPosition="top"
                            maxDragDistance={50}
                            toastOffset={"15%"}
                        />
                        <PortalHost name="ToastsHost" />
                    </PortalProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </AuthProvider>
    );
}
