import React from "react";
import Animated, {
	Extrapolate,
	interpolate,
	useAnimatedProps,
	useAnimatedStyle,
} from "react-native-reanimated";
import { BlurView } from "@react-native-community/blur";
import { BottomSheetBackdropProps } from ".";
import { useColorScheme } from "nativewind";
import { TouchableWithoutFeedback } from "react-native";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const CustomBackdrop = ({
	animatedPosition,
	screenHeight,
	newActiveHeight,
	onBackdropPress,
}: BottomSheetBackdropProps) => {
	const { colorScheme } = useColorScheme();

	const backdropAnimationStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			animatedPosition.value,
			[screenHeight, newActiveHeight],
			[0, 1]
		);
		const display = opacity === 0 ? "none" : "flex";

		return {
			opacity,
			display,
		};
	});

	return (
		<TouchableWithoutFeedback onPress={onBackdropPress}>
			<AnimatedBlurView
				style={[
					backdropAnimationStyle,
					{
						position: "absolute",
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
					},
				]}
				blurType={colorScheme === "dark" ? "dark" : "light"}
				blurAmount={5}
			/>
		</TouchableWithoutFeedback>
	);
};

export default CustomBackdrop;
