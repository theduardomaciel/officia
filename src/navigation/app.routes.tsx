import { useEffect } from "react";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { useColorScheme } from 'nativewind';
import colors from "global/colors";

const Stack = createStackNavigator();

import Invoice from "screens/Invoice";
import ScheduleForm from "screens/ScheduleForm";
import Service from "screens/Service";
import DayAgenda from "screens/DayAgenda";

// Business
import BasicInfo from "screens/Main/Business/screens/BasicInfo";
import AdditionalInfo from "screens/Main/Business/screens/AdditionalInfo";
import BankAccount from "screens/Main/Business/screens/BankAccount";
import PhoneAndAddress from "screens/Main/Business/screens/ContactAndAddress";
import SocialMedia from "screens/Main/Business/screens/SocialMedia";
import CategoriesScreen from "screens/Main/Business/screens/Categories";

import Settings from "screens/Main/Business/screens/Settings";
import DigitalSignature from "screens/Main/Business/screens/DigitalSignature";

// Notifications
import notifee, { EventType } from "@notifee/react-native";
import { createChannelId } from "utils/notificationHandler";

// Drawer Navigator
import DrawerNavigator from "./navigators/drawerNavigator";

export function AppStack() {
    const { colorScheme } = useColorScheme();
    const { navigate } = useNavigation();

    useEffect(() => {
        createChannelId();
        return notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                const { notification } = detail;
                if (notification && detail.pressAction?.id) {
                    navigate('service', { serviceId: detail.pressAction?.id })
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
                cardStyle: { backgroundColor: colorScheme === "dark" ? colors.gray[300] : colors.white }
            }}
        >
            <Stack.Screen
                name="homeDrawer"
                component={DrawerNavigator}
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
            <Stack.Screen name="basicInfo"
                component={BasicInfo}
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
            <Stack.Screen name="contactAndAddress"
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
                name="categories"
                component={CategoriesScreen}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen
                name="digitalSignature"
                component={DigitalSignature}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
            />
            <Stack.Screen
                name="settings"
                component={Settings}
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
        </Stack.Navigator>
    )
}