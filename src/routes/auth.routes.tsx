import { createStackNavigator } from "@react-navigation/stack";

import { useColorScheme } from 'nativewind';
import colors from "global/colors";

// Screens
import Login from "screens/Auth/Login";
import Register from "screens/Auth/Register";

const Stack = createStackNavigator();

export function AuthStack() {
    const { colorScheme } = useColorScheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                detachPreviousScreen: false,
                cardStyle: { backgroundColor: colorScheme === "dark" ? colors.gray[300] : colors.white }
            }}
        >
            <Stack.Screen
                name="login"
                component={Login}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="register"
                component={Register}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}