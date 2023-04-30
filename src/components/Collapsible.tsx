import { useState } from "react";
import { Text, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

interface CollapsibleProps {
	label: string;
	children: React.ReactNode;
	contentViewStyle?: ViewStyle;
	additionalSize?: number;
}

const TRIGGER_HEIGHT = 50;

export default function Collapsible({
	label,
	children,
	contentViewStyle,
	additionalSize: ADDITIONAL_SIZE = 0,
}: CollapsibleProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const rotation = useSharedValue(-90);

	const arrowStyle = useAnimatedStyle(() => {
		return {
			transform: [{ rotate: `${rotation.value}deg` }],
		};
	});

	const contentHeight = useSharedValue(0);
	const height = useSharedValue(TRIGGER_HEIGHT);

	const sizeStyle = useAnimatedStyle(() => {
		return {
			height: height.value,
		};
	});

	return (
		<Animated.View
			className="flex flex-col w-full"
			style={[{ overflow: "hidden" }, sizeStyle]}
		>
			<TouchableOpacity
				activeOpacity={0.5}
				style={{
					display: "flex",
					flexDirection: "row",
					width: "100%",
					height: TRIGGER_HEIGHT,
					justifyContent: "space-between",
					alignItems: "center",
					paddingTop: 15,
					paddingBottom: 15,
				}}
				onPress={() => {
					setIsExpanded(!isExpanded);
					rotation.value = withSpring(isExpanded ? -90 : 90, {
						damping: 100,
						stiffness: 100,
						mass: 0.15,
					});
					height.value = withSpring(
						isExpanded
							? TRIGGER_HEIGHT
							: contentHeight.value +
									TRIGGER_HEIGHT +
									ADDITIONAL_SIZE,
						{ damping: 100, stiffness: 100, mass: 0.15 }
					);
				}}
			>
				<Text className="font-medium text-md text-white">{label}</Text>
				<Animated.View
					className={"flex items-center justify-center w-5 h-5"}
					style={arrowStyle}
				>
					<MaterialIcons
						name="chevron-left"
						size={18}
						color={colors.white}
					/>
				</Animated.View>
			</TouchableOpacity>
			<Animated.View
				className="flex flex-col justify-between items-start"
				style={contentViewStyle}
				onLayout={(event) =>
					(contentHeight.value = event.nativeEvent.layout.height)
				}
			>
				{children}
			</Animated.View>
		</Animated.View>
	);
}
