import {
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

interface NavigationButtonProps extends TouchableOpacityProps {
	title: string;
	description?: string;
	children?: React.ReactNode;
	onPress?: () => void;
	colorScheme?: "dark" | "light";
}

export default function NavigationButton({
	title,
	description,
	children,
	onPress,
	...rest
}: NavigationButtonProps) {
	const { colorScheme } = useColorScheme();

	return (
		<TouchableOpacity
			activeOpacity={rest.activeOpacity ?? 0.6}
			onPress={onPress}
			className="w-full flex-row items-center justify-between"
		>
			<View className="flex-1 flex-col items-start justify-center mr-4">
				<Text className="font-semibold text-sm text-black dark:text-text-100">
					{title}
				</Text>
				{description && (
					<Text className="font-normal text-xs text-black dark:text-text-200">
						{description}
					</Text>
				)}
			</View>
			{children ? (
				children
			) : (
				<MaterialIcons
					name="chevron-right"
					size={18}
					color={
						colorScheme === "dark" ? colors.text[100] : colors.black
					}
				/>
			)}
		</TouchableOpacity>
	);
}
