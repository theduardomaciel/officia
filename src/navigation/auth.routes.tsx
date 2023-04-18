import {
	CardStyleInterpolators,
	createStackNavigator,
} from "@react-navigation/stack";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Screens
import Login from "screens/Auth/Login";
import Register from "screens/Auth/Register";
import BusinessRegister from "screens/Auth/BusinessRegister";

const Stack = createStackNavigator();

export function AuthStack() {
	const { colorScheme } = useColorScheme();

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
			<Stack.Screen
				name="login"
				component={Login}
				options={{ headerShown: false }}
			/>
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
		</Stack.Navigator>
	);
}
