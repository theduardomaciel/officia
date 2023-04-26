import {
	CardStyleInterpolators,
	createStackNavigator,
} from "@react-navigation/stack";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

import { useAuth } from "context/AuthContext";

// Screens
import Login from "screens/Auth/Login";
import Register from "screens/Auth/Register/index";
import BusinessRegister from "screens/Auth/BusinessRegister";
import SubscriptionScreen from "screens/Drawer/Subscription";

const Stack = createStackNavigator();

export function AuthStack() {
	const { colorScheme } = useColorScheme();
	const { authData } = useAuth();

	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				detachPreviousScreen: false,
				cardStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.gray[300]
							: colors.white,
				},
			}}
		>
			{
				// If the user has a id but not a selectedProjectId, it means that the user needs to create one
				!authData?.id && (
					<Stack.Screen
						name="login"
						component={Login}
						options={{
							headerShown: false,
							cardStyleInterpolator:
								CardStyleInterpolators.forFadeFromBottomAndroid,
						}}
					/>
				)
			}
			<Stack.Screen
				name="register"
				component={Register}
				options={{
					headerShown: false,
					cardStyleInterpolator:
						CardStyleInterpolators.forFadeFromBottomAndroid,
				}}
			/>
			<Stack.Screen
				name="businessRegister"
				component={BusinessRegister}
				options={{
					headerShown: false,
					cardStyleInterpolator:
						CardStyleInterpolators.forFadeFromBottomAndroid,
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
		</Stack.Navigator>
	);
}
