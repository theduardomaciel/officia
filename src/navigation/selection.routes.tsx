import {
	CardStyleInterpolators,
	createStackNavigator,
} from "@react-navigation/stack";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

import ProjectSelection from "screens/Auth/Selection";
import BusinessRegister from "screens/Auth/BusinessRegister";
import SubscriptionScreen from "screens/Drawer/Subscription";

const Stack = createStackNavigator();

export function SelectionStack() {
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
				name="projectSelection"
				component={ProjectSelection}
				options={{ headerShown: false }}
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
