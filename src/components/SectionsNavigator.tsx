import colors from "global/colors";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SharedValue } from "react-native-gesture-handler/lib/typescript/handlers/gestures/reanimatedWrapper";
import Animated, {
	Extrapolate,
	FadeOutDown,
	interpolate,
	interpolateColor,
	useAnimatedStyle,
} from "react-native-reanimated";

interface Props {
	sections: {
		id: number;
		title: string;
		onPress?: () => void;
	}[];
	selectedId: SharedValue<number>;
}

const MARGIN_SIZE = 15;

export function SectionsNavigator({ sections, selectedId }: Props) {
	const windowWidth = Dimensions.get("window").width - MARGIN_SIZE * 2 * 2;
	const lineWidth = windowWidth / sections.length;

	console.log(selectedId.value);

	return (
		<Animated.View
			className="flex-row w-full items-center justify-between mt-5"
			exiting={FadeOutDown}
		>
			{sections.map((section, index) => {
				const lineAnimationStyle = useAnimatedStyle(() => {
					const inputRange = [index - 1, index, index + 1];
					const outputRange = [-lineWidth, 0, lineWidth];

					return {
						transform: [
							{
								translateX: interpolate(
									selectedId?.value,
									inputRange,
									outputRange,
									Extrapolate.CLAMP
								),
							},
						],
					};
				}, [selectedId, index]);

				const textAnimationStyle = useAnimatedStyle(() => {
					const color = interpolateColor(
						selectedId.value,
						[index - 1, index, index + 1],
						[colors.gray[100], colors.primary, colors.gray[100]]
					);

					return {
						color,
					};
				}, [selectedId, index]);

				return (
					<TouchableOpacity
						key={section.id}
						activeOpacity={
							section.id === selectedId.value ? 0.7 : 1
						}
						onPress={section.onPress && section.onPress}
						style={{
							marginRight:
								index === sections.length - 1 ? 0 : MARGIN_SIZE,
						}}
						className="flex flex-col items-center justify-center flex-1"
					>
						<Animated.Text
							style={textAnimationStyle}
							className={
								"font-bold text-xs text-black dark:text-gray-100"
							}
						>
							{section.title}
						</Animated.Text>
						<View
							className={
								"bg-black overflow-hidden dark:bg-gray-100 h-[3px] rounded"
							}
							style={{
								width: lineWidth,
							}}
						>
							<Animated.View
								className={"bg-primary"}
								style={[
									{
										borderRadius: 50,
										flex: 1,
									},
									lineAnimationStyle,
								]}
							/>
						</View>
					</TouchableOpacity>
				);
			})}
		</Animated.View>
	);
}
