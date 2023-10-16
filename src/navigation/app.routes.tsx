import { useEffect } from "react";
import {
	CardStyleInterpolators,
	createStackNavigator,
} from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

const Stack = createStackNavigator();

import Invoice from "screens/Invoice";
import ScheduleForm from "screens/ScheduleForm";
import Order from "screens/Order";
import DayAgenda from "screens/DayAgenda";

// Business
import BasicInfo from "screens/Main/Business/screens/BasicInfo";
import AdditionalInfo from "screens/Main/Business/screens/AdditionalInfo";
import BankAccount from "screens/Main/Business/screens/Payments";
import PhoneAndAddress from "screens/Main/Business/screens/ContactAndAddress";
import SocialMedia from "screens/Main/Business/screens/SocialMedia";
import CategoriesScreen from "screens/Main/Business/screens/Categories";

import Settings from "screens/Drawer/Settings";
import DigitalSignature from "screens/Main/Business/screens/DigitalSignature";

// Notifications
import notifee, { EventType } from "@notifee/react-native";
import { createChannelId } from "utils/notificationHandler";

// Drawer Navigator
import DrawerNavigator from "./navigators/drawerNavigator";

import ProfileScreen from "screens/Drawer/Profile/index";
import ClientsScreen from "screens/Drawer/Clients";
import CatalogScreen from "screens/Drawer/Catalog";
import SubscriptionScreen from "screens/Drawer/Subscription";

// Drawer Menus Screens
import ManageData from "screens/Drawer/ManageData";
import ManageAccount from "screens/Drawer/Profile/ManageAccount";
import ManageSubscription from "screens/Drawer/Profile/ManageSubscription";

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
				name="homeDrawer"
				component={DrawerNavigator}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="dayAgenda"
				component={DayAgenda}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="bankAccount"
				component={BankAccount}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="socialMedia"
				component={SocialMedia}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="basicInfo"
				component={BasicInfo}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="additionalInfo"
				component={AdditionalInfo}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="contactAndAddress"
				component={PhoneAndAddress}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="schedule"
				component={ScheduleForm}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forVerticalIOS,
				}}
			/>
			<Stack.Screen
				name="order"
				component={Order}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="categories"
				component={CategoriesScreen}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="digitalSignature"
				component={DigitalSignature}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="settings"
				component={Settings}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="invoice"
				component={Invoice}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forVerticalIOS,
				}}
			/>
			{/* DRAWER SCREENS */}
			<Stack.Screen
				name="profile"
				component={ProfileScreen}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="clients"
				component={ClientsScreen}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="catalog"
				component={CatalogScreen}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="subscription"
				component={SubscriptionScreen}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			{/* Drawer*/}
			<Stack.Screen
				name="manageData"
				component={ManageData}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			{/* Drawer -> Profile */}
			<Stack.Screen
				name="manageAccount"
				component={ManageAccount}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
			<Stack.Screen
				name="manageSubscription"
				component={ManageSubscription}
				options={{
					cardStyleInterpolator:
						CardStyleInterpolators.forHorizontalIOS,
				}}
			/>
		</Stack.Navigator>
	);
}
