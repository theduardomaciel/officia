import { View, Text, ViewStyle, ActivityIndicator } from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "global/colors";

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

interface ErrorMessageProps {
	message: string;
	onPress?: () => void;
}

export function Error({ message, onPress }: ErrorMessageProps) {
	return (
		<View className="items-center justify-center flex-1">
			<Text className="text-zinc-400 text-xl font-bold text-center">
				{message}
			</Text>
			{onPress && (
				<MaterialCommunityIcons
					onPress={onPress}
					name="reload"
					size={32}
					color={colors.text[100]}
				/>
			)}
		</View>
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
