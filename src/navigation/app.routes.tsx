import { useEffect } from "react";
import {
    CardStyleInterpolators,
    createStackNavigator,
} from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

const Stack = createStackNavigator<RootStackParamList>();

import Login from "screens/Auth/Login";

import Invoice from "screens/Invoice";
import ScheduleForm from "screens/ScheduleForm";
import Order from "screens/Order";
import DateAgenda from "screens/DateAgenda";

// Business
import BasicInfo from "screens/Main/Business/screens/BasicInfo";
import AdditionalInfo from "screens/Main/Business/screens/AdditionalInfo";
import Marketplace from "screens/Main/Business/screens/Marketplace";
import BankAccount from "screens/Main/Business/screens/Payments";
import PhoneAndAddress from "screens/Main/Business/screens/ContactAndAddress";
import CategoriesScreen from "screens/Main/Business/screens/Categories";

import Settings from "screens/Drawer/Settings";
import DigitalSignature from "screens/Main/Business/screens/DigitalSignature";

// Notifications
import notifee, { EventType } from "@notifee/react-native";
import { createChannelId } from "utils/notificationHandler";

// Drawer Navigator
import DrawerNavigator from "./navigators/drawerNavigator";

import ProfileScreen from "screens/Drawer/Profile/index";
import CostumersScreen from "screens/Drawer/Costumers";
import CatalogScreen from "screens/Drawer/Catalog";
import SubscriptionScreen from "screens/Drawer/Subscription";

// Drawer Menus Screens
import ManageData from "screens/Drawer/ManageData";
import ManageAccount from "screens/Drawer/Profile/ManageAccount";
import ManageSubscription from "screens/Drawer/Profile/ManageSubscription";

// Types
import type { RootStackParamList } from "./@types";
import AccountSelection from "screens/Auth/Selection";

const DEFAULT_OPTIONS = {
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
} as const;

export function AppStack() {
    const { colorScheme } = useColorScheme();
    const { navigate } = useNavigation();

    useEffect(() => {
        createChannelId();
        return notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                const { notification } = detail;
                if (notification && detail.pressAction?.id) {
                    navigate("order", { orderId: detail.pressAction?.id });
                }
            }
        });
    }, []);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                /* contentStyle: { backgroundColor: colorScheme === "dark" ? colors.gray[400] : colors.white },
                presentation: 'card', */
                detachPreviousScreen: false,
                cardStyle: {
                    backgroundColor:
                        colorScheme === "dark"
                            ? colors.gray[300]
                            : colors.white,
                },
            }}
        >
            <Stack.Screen
                name="HomeDrawer"
                component={DrawerNavigator}
                options={{ headerShown: false }}
            />
            {/* GENERAL */}
            <Stack.Screen
                name="DateAgenda"
                component={DateAgenda}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="Order"
                component={Order}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="Invoice"
                component={Invoice}
                options={{
                    cardStyleInterpolator:
                        CardStyleInterpolators.forVerticalIOS,
                }}
            />
            {/* SCHEDULE */}
            <Stack.Screen
                name="Schedule"
                component={ScheduleForm}
                options={{
                    cardStyleInterpolator:
                        CardStyleInterpolators.forVerticalIOS,
                }}
            />
            {/* BUSINESS SCREENS */}
            <Stack.Group>
                <Stack.Screen
                    name="BasicInfo"
                    component={BasicInfo}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
                <Stack.Screen
                    name="AdditionalInfo"
                    component={AdditionalInfo}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
                <Stack.Screen
                    name="Marketplace"
                    component={Marketplace}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
                <Stack.Screen
                    name="Contact"
                    component={PhoneAndAddress}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
                <Stack.Screen
                    name="Payments"
                    component={BankAccount}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
                <Stack.Screen
                    name="Categories"
                    component={CategoriesScreen}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
                <Stack.Screen
                    name="DigitalSignature"
                    component={DigitalSignature}
                    options={{
                        cardStyleInterpolator:
                            CardStyleInterpolators.forHorizontalIOS,
                    }}
                />
            </Stack.Group>
            {/* DRAWER SCREENS */}
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="Costumers"
                component={CostumersScreen}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="Catalog"
                component={CatalogScreen}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="Subscription"
                component={SubscriptionScreen}
                options={DEFAULT_OPTIONS}
            />
            {/* Drawer -> Profile */}
            <Stack.Screen
                name="ManageAccount"
                component={ManageAccount}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="ManageSubscription"
                component={ManageSubscription}
                options={DEFAULT_OPTIONS}
            />
            {/* DRAWER OPTIONS */}
            <Stack.Screen
                name="Settings"
                component={Settings}
                options={DEFAULT_OPTIONS}
            />
            <Stack.Screen
                name="ManageData"
                component={ManageData}
                options={DEFAULT_OPTIONS}
            />
            {/* AUTHENTICATION */}
            <Stack.Screen
                name="AccountSelection"
                component={AccountSelection}
                options={{
                    headerShown: false,
                    cardStyleInterpolator:
                        CardStyleInterpolators.forFadeFromBottomAndroid,
                }}
            />
            <Stack.Screen
                name="Login"
                component={Login}
                options={{
                    headerShown: false,
                    cardStyleInterpolator:
                        CardStyleInterpolators.forFadeFromBottomAndroid,
                }}
            />
        </Stack.Navigator>
    );
}
