import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import Home from "../screens/Home";
import Business from "screens/Business";
import Overview from "screens/Overview";

import colors from "global/colors";
import { MaterialIcons } from "@expo/vector-icons";

/* function HomeStack() {
    return (
        <Stack.Navigator sceneContainerStyle={{ backgroundColor: colors.bg[300] }} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    );
} */

export function AppRoutes() {
    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: "transparent" }}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.bg[500],
                    borderTopColor: "transparent",
                    height: 60,
                    paddingTop: 10,
                    paddingBottom: 10
                },
                tabBarShowLabel: false,
                tabBarInactiveTintColor: colors.text[200],
                tabBarActiveTintColor: colors.text.neutral,
            }}
        >
            <Tab.Screen
                name="home"
                component={Home}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <MaterialIcons name="event" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="overview"
                component={Overview}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <MaterialIcons name="insights" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="business"
                component={Business}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <MaterialIcons name="work" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    )
}