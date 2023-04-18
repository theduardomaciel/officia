import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Screens
import Business from "screens/Main/Business/index";
import Home from "screens/Main/Home";
import Overview from "screens/Main/Overview";

const FormBase = () => (
	<View style={{ flex: 1, backgroundColor: colors.gray[300] }} />
);

export default function HomeNavigator() {
	const insets = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();

	return (
		<Tab.Navigator
			sceneContainerStyle={{ backgroundColor: "transparent" }}
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.gray[500]
							: colors.white,
					borderTopColor: "transparent",
					height: insets.bottom ? 60 + insets.bottom : 80,
					paddingTop: 0,
					paddingBottom: insets.bottom ? insets.bottom : 10,
				},
				tabBarShowLabel: false,
				headerShadowVisible: false,
				tabBarInactiveTintColor:
					colorScheme === "dark"
						? colors.text[200]
						: colors.text[200],
				tabBarActiveTintColor:
					colorScheme === "dark" ? colors.white : colors.black,
			}}
		>
			<Tab.Screen
				name="home"
				component={Home}
				options={{
					tabBarIcon: ({ color, size, focused }) => (
						<MaterialIcons name="event" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="overview"
				component={Overview}
				options={{
					tabBarIcon: ({ color, size, focused }) => (
						<MaterialIcons
							name="insights"
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tab.Screen
				name="business"
				component={Business}
				options={{
					tabBarIcon: ({ color, size, focused }) =>
						focused ? (
							<MaterialIcons
								name="work"
								size={size}
								color={color}
							/>
						) : (
							<MaterialIcons
								name="work-outline"
								size={size}
								color={color}
							/>
						),
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
						backgroundColor: colors.primary,
						borderRadius: 99999,
						right: 25,
						bottom: 85,
					},
					tabBarIcon: ({ size, color, ...rest }) => (
						<MaterialIcons
							name="add"
							size={size}
							color={
								colorScheme === "dark"
									? colors.white
									: colors.black
							}
						/>
					),
				}}
				listeners={({ navigation }) => ({
					tabPress: (e) => {
						e.preventDefault();
						navigation.navigate("schedule");
					},
				})}
			/>
		</Tab.Navigator>
	);
}
