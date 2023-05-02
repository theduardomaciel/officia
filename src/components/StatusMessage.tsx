import {
	View,
	Text,
	ViewStyle,
	ActivityIndicator,
	useAnimatedValue,
	TouchableOpacityProps,
	TouchableOpacity,
} from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "global/colors";
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSpring,
} from "react-native-reanimated";

interface EmptyMessageProps {
	message?: string;
	style?: ViewStyle;
}

export function Empty({ message, style }: EmptyMessageProps) {
	const { colorScheme } = useColorScheme();

	return (
		<View className="items-center justify-center flex-1 px-4" style={style}>
			<MaterialIcons
				name="search"
				size={56}
				color={colorScheme === "dark" ? colors.white : colors.black}
			/>
			<Text className="text-lg font-bold leading-5 text-center text-black dark:text-white mt-2">
				Está um pouco vazio por aqui...
			</Text>
			{message && (
				<Text className="text-black dark:text-white text-base text-center leading-5">
					{message}
				</Text>
			)}
		</View>
	);
}

export interface ErrorStatusProps extends TouchableOpacityProps {
	onPress?: () => void;
	isLoading?: boolean;
	iconSize?: number;
	defaultText?: string;
}

export function ErrorStatus({
	onPress,
	iconSize = 24,
	isLoading,
	children,
	style,
	defaultText,
	...rest
}: ErrorStatusProps) {
	const refreshIconRotation = useSharedValue(0);
	const refreshIconAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${refreshIconRotation.value}deg`,
				},
			],
		};
	});

	return (
		<TouchableOpacity
			className="items-center justify-center w-full px-4"
			activeOpacity={!onPress ? 1 : isLoading ? 0.5 : 0.7}
			disabled={!onPress || isLoading}
			style={[style, { opacity: isLoading ? 0.5 : 1 }]}
			onPress={
				onPress
					? async () => {
							refreshIconRotation.value = withRepeat(
								withSpring(refreshIconRotation.value + 360, {
									damping: 10,
									mass: 0.65,
									stiffness: 100,
								}),
								-1
							);
							await onPress();
							cancelAnimation(refreshIconRotation);
							refreshIconRotation.value = withSpring(0);
					  }
					: undefined
			}
			{...rest}
		>
			{children ? (
				children
			) : defaultText ? (
				<Text className="text-zinc-400 text-xl font-bold text-center mb-4">
					{defaultText}
				</Text>
			) : (
				<Text className="text-zinc-400 text-xl font-bold text-center mb-4">
					Erro ao carregar
				</Text>
			)}
			{onPress && (
				<Animated.View style={refreshIconAnimatedStyle}>
					<MaterialIcons
						name="replay"
						size={iconSize}
						color={colors.text[200]}
					/>
				</Animated.View>
			)}
		</TouchableOpacity>
	);
}

interface LoadingMessageProps {
	color?: string;
	message?: string;
}

export function Loading({ color, message }: LoadingMessageProps) {
	return (
		<View className="items-center justify-center flex-1">
			<ActivityIndicator
				color={color ? color : colors.primary}
				size="large"
			/>
			<Text className="mt-3 mb-20 max-w-[75vw] text-white font-medium text-center text-lg">
				{message && message}
			</Text>
		</View>
	);
}
