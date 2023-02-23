import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
/* import { createNativeStackNavigator } from '@react-navigation/native-stack' */

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import Business from "screens/Main/Business";
import Home from "screens/Main/Home";
import Overview from "screens/Main/Overview";

import Invoice from "screens/Invoice";
import ScheduleForm from "screens/ScheduleForm";
import Service from "screens/Service";

import AdditionalInfo from "screens/AdditionalInfo";
import BankAccount from "screens/BankAccount";
import DayAgenda from "screens/DayAgenda";
import PhoneAndAddress from "screens/PhoneAndAddress";
import SocialMedia from "screens/SocialMedia";

const FormBase = () => <View style={{ flex: 1, backgroundColor: colors.gray[300] }} />

function HomeStack() {
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();

    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: "transparent" }}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colorScheme === "dark" ? colors.gray[500] : colors.white,
                    borderTopColor: "transparent",
                    height: insets.bottom ? 60 + insets.bottom : 80,
                    paddingTop: 0,
                    paddingBottom: insets.bottom ? insets.bottom : 10
                },
                tabBarShowLabel: false,
                headerShadowVisible: false,
                tabBarInactiveTintColor: colorScheme === "dark" ? colors.text[200] : colors.text[200],
                tabBarActiveTintColor: colorScheme === "dark" ? colors.white : colors.black,
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
            <Tab.Screen
                name="bottomchat"
                /* Pass in a blank component as the base (this never gets shown) */
                component={FormBase}
                options={{
                    tabBarLabel: "Check-in",
                    tabBarItemStyle: {
                        position: "absolute",
                        width: 55,
                        height: 55,
                        backgroundColor: colors.primary.green,
                        borderRadius: 99999,
                        right: 25,
                        bottom: 85,
                    },
                    tabBarIcon: ({ size, color, ...rest }) => (
                        <MaterialIcons name="add" size={size} color={colorScheme === "dark" ? colors.white : colors.black} />
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault()
                        navigation.navigate("schedule")
                    },
                })}
            />
        </Tab.Navigator>
    );
}

export function AppRoutes() {
    const { colorScheme } = useColorScheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                /* contentStyle: { backgroundColor: colorScheme === "dark" ? colors.gray[400] : colors.white },
                presentation: 'card', */
                detachPreviousScreen: false,
                cardStyle: { backgroundColor: colorScheme === "dark" ? colors.gray[300] : colors.white }
            }}
        >
            <Stack.Screen
                name="homeTab"
                component={HomeStack}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="dayAgenda"
                component={DayAgenda}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen name="bankAccount"
                component={BankAccount}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen name="socialMedia"
                component={SocialMedia}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen name="additionalInfo"
                component={AdditionalInfo}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen name="phoneAndAddress"
                component={PhoneAndAddress}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen
                name="schedule"
                component={ScheduleForm}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                }}
            />
            <Stack.Screen
                name="service"
                component={Service}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen
                name="invoice"
                component={Invoice}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                }}
            />
            {/* <Stack.Screen
                name="login"
                component={Login}
                options={{ headerShown: false }}
            /> */}
        </Stack.Navigator>
    )
}