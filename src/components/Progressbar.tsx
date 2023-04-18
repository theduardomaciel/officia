import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

interface Props {
	progress?: number;
}

export function Progressbar({ progress = 0 }: Props) {
	const animatedProgress = useSharedValue(progress);

	const style = useAnimatedStyle(() => {
		return {
			width: `${animatedProgress.value}%`,
		};
	});

	useEffect(() => {
		animatedProgress.value = withSpring(progress, {
			mass: 0.5,
			damping: 10,
			stiffness: 50,
		});
	}, [progress]);

	return (
		<View className="w-full h-3 rounded-xl bg-zinc-700 mt-4">
			<Animated.View
				className="h-3 rounded-xl bg-primary"
				style={style}
			/>
		</View>
	);
}
