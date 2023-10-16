import { TouchableOpacity, View, Text, ViewProps } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import clsx from "clsx";
import { Image } from "expo-image";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Types
import { BusinessData } from "screens/Main/Business/@types";
import { useEffect, useState } from "react";
import { userStorage } from "context/AuthContext";
import { safeJsonParse } from "utils";

interface HeaderProps extends ViewProps {
	returnButton?: boolean | (() => void);
	cancelButton?: boolean | (() => void);
	title?: string;
	description?: string;
	upperChildren?: React.ReactNode;
	aboveTitle?: React.ReactNode;
	bellowTitle?: React.ReactNode;
	navigationHistory?: Array<string>;
}

export default function Header({
	title,
	description,
	cancelButton,
	returnButton,
	children,
	upperChildren,
	aboveTitle,
	bellowTitle,
	navigationHistory,
	...props
}: HeaderProps) {
	const { colorScheme } = useColorScheme();
	const { goBack } = useNavigation();

	return (
		<View
			className="flex flex-col items-start justify-center w-full"
			style={{ rowGap: 5 }}
		>
			{(returnButton || cancelButton) && (
				<View className="flex-row w-full items-center justify-between">
					{returnButton && (
						<TouchableOpacity
							className="mb-2"
							disabled={!returnButton}
							style={{
								opacity: returnButton ? 1 : 0,
							}}
							onPress={
								typeof returnButton === "function"
									? returnButton
									: () => {
											goBack();
									  }
							}
						>
							<MaterialIcons
								name="keyboard-backspace"
								size={24}
								color={
									colorScheme === "dark"
										? colors.white
										: colors.black
								}
							/>
						</TouchableOpacity>
					)}
					{cancelButton && (
						<TouchableOpacity
							className="mb-2"
							onPress={
								typeof returnButton === "function"
									? returnButton
									: () => {
											goBack();
									  }
							}
						>
							<MaterialIcons
								name="close"
								size={24}
								color={
									colorScheme === "dark"
										? colors.white
										: colors.black
								}
							/>
						</TouchableOpacity>
					)}
					{upperChildren && upperChildren}
				</View>
			)}
			{title && (
				<View className="flex-col w-full gap-y-1">
					{navigationHistory &&
						navigationHistory.length > 0 &&
						navigationHistory.map((item, index) => (
							<Text
								key={index}
								className="text-text_light-neutral dark:text-text-100 text-xl font-medium"
							>
								{item}
								{index <= navigationHistory.length - 1 && " /"}
							</Text>
						))}
					{aboveTitle}
					<View
						className="w-full flex-row items-center justify-between"
						{...props}
					>
						<Text className="text-text_light-neutral dark:text-white text-4xl font-titleBold">
							{title}
						</Text>
						{children}
					</View>
					{description && (
						<Text className="text-sm leading-4 text-text-200">
							{description}
						</Text>
					)}
					{bellowTitle}
				</View>
			)}
		</View>
	);
}

interface Props {
	title?: string;
	children?: HeaderProps["children"];
	navigation: any;
}

function getGreeting() {
	const hour = new Date().getHours();

	if (hour < 12) {
		return "Bom dia";
	} else if (hour < 18) {
		return "Boa tarde";
	} else {
		return "Boa noite";
	}
}

const ANIM_PROPS = {
	damping: 100,
	stiffness: 1000,
	mass: 2,
	overshootClamping: true,
};

export function TabBarScreenHeader({ title, children, navigation }: Props) {
	const name = userStorage.getString("name") || "Usuário";

	const isVisible = useSharedValue(1);

	const TEXTS = [
		`${getGreeting()}, ${name.split(" ")[0]}!`,
		`Tenha um ótimo dia!`,
		`Seu período de avaliação acaba em 5 dias.`,
	];
	const [currentIndex, setCurrentIndex] = useState(0);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: isVisible.value,
		transform: [{ translateY: isVisible.value * 100 - 100 }],
	}));

	useEffect(() => {
		isVisible.value = withRepeat(
			withSequence(
				withDelay(1000, withSpring(1, ANIM_PROPS)),
				withDelay(
					15000,
					withSpring(0, ANIM_PROPS, () => {
						const newIndex = Math.floor(
							Math.random() * TEXTS.length
						);
						runOnJS(setCurrentIndex)(newIndex);
					})
				)
			),
			-1,
			false
			/* (finished) => {
				const resultStr = finished
					? "All repeats are completed"
					: "withRepeat cancelled";
				console.log(resultStr);
			} */
		);
	}, []);

	const SYNC_STATUS = "error";

	return (
		<View className="flex flex-row items-center justify-between w-full">
			<View
				className={clsx(
					"flex flex-row items-center justify-start mr-2",
					{
						"flex-1": !!children,
					}
				)}
				style={{ columnGap: 10 }}
			>
				<TouchableOpacity
					className={clsx(
						"flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 relative"
					)}
					activeOpacity={0.8}
					onPress={() => navigation.openDrawer()}
				>
					{SYNC_STATUS === "error" && (
						<>
							<View className="w-full h-full rounded-full border-[2.5px] border-yellow absolute top-0 left-0 items-center justify-center z-20">
								<MaterialIcons
									name="sync-problem"
									size={24}
									className="z-30"
									color={colors.white}
								/>
								<View className="w-full h-full rounded-full absolute top-0 left-0 bg-black opacity-50 -z-10" />
							</View>
							<MaterialIcons
								name="person"
								size={24}
								color={colors.text[100]}
							/>
						</>
					)}
				</TouchableOpacity>
				{children && (
					<Animated.Text
						style={animatedStyle}
						className="flex flex-1 text-xs text-text-100 w-full whitespace-pre-line"
					>
						{TEXTS[currentIndex]}
					</Animated.Text>
				)}
			</View>
			{title && (
				<Text className="font-titleBold text-lg text-text-100">
					{title}
				</Text>
			)}
			{children ? children : <View className="w-12 h-full" />}
			{/* <View className="border-b-[1px] border-b-gray-200 w-screen absolute left-1/2 -bottom-2" style={{ transform: [{ translateX: -100 }] }} /> */}
		</View>
	);
}
