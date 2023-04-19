import { memo, useCallback, useEffect, useState } from "react";
import Animated, {
	Layout,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import {
	Text,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import BottomSheet from "components/BottomSheet";

interface Header {
	title: string;
	subtitle: string;
}

const SPRING_OPTIONS = {
	damping: 100,
	stiffness: 1000,
};

export default function useUpdateHandler(
	sections: string[],
	HEADERS: Header[],
	onLimitReached: () => void,
	initialValue: number = 0
) {
	const { width } = useWindowDimensions();

	const [selectedSection, setSelectedSection] = useState({
		value: initialValue,
		direction: "forward",
	});
	const selectedSectionId = useSharedValue(initialValue);
	const headerPosition = useSharedValue(initialValue);

	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateX: headerPosition.value,
				},
			],
		};
	});

	const updateHandler = useCallback((id: number) => {
		"worklet";
		if (sections[selectedSectionId.value] && sections[id] && id >= 0) {
			// Bottom Sheet Animation
			BottomSheet.close(sections[selectedSectionId.value]);

			if (id > selectedSectionId.value) {
				headerPosition.value = withSpring(
					-width,
					SPRING_OPTIONS,
					() => {
						runOnJS(setSelectedSection)({
							value: id,
							direction: "forward",
						});
					}
				);
				selectedSectionId.value = withSpring(id, SPRING_OPTIONS);
			} else {
				// id < selectedSectionId.value - animação reversa
				headerPosition.value = withSpring(width, SPRING_OPTIONS, () => {
					runOnJS(setSelectedSection)({
						value: id,
						direction: "backward",
					});
				});
				selectedSectionId.value = withSpring(id, SPRING_OPTIONS);
			}

			BottomSheet.expand(sections[id]);
		} else {
			onLimitReached();
		}
	}, []);

	useEffect(() => {
		if (selectedSection.direction === "forward") {
			headerPosition.value = withSequence(
				withTiming(width, { duration: 0 }),
				withSpring(0, SPRING_OPTIONS)
			);
		} else if (selectedSection.direction === "backward") {
			headerPosition.value = withSequence(
				withTiming(-width, { duration: 0 }),
				withSpring(0, SPRING_OPTIONS)
			);
		}
	}, [selectedSection]);

	const BackButton = memo(({ isEnabled }: { isEnabled?: boolean }) =>
		isEnabled ? (
			<View className="w-full flex-col items-center justify-center">
				<TouchableOpacity
					className="flex-row bg-gray-200 items-center justify-center rounded-sm p-[5px]"
					style={{
						columnGap: 5,
						opacity: 1,
					}}
					onPress={() => updateHandler(selectedSectionId.value - 1)}
				>
					<MaterialIcons
						name="arrow-back"
						size={14}
						color={colors.white}
					/>
					<Text className="text-white text-sm">Voltar</Text>
				</TouchableOpacity>
			</View>
		) : (
			<View className="py-1.5" />
		)
	);

	const Header = memo(() => (
		<Animated.View
			className="flex-col items-center justify-center"
			style={[headerAnimatedStyle, { rowGap: 10 }]}
			layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
		>
			<Text className="font-logoRegular leading-[95%] text-4xl text-white text-center w-5/6">
				{HEADERS[selectedSection.value].title}
			</Text>
			<Text className="text-white text-sm font-semibold text-center">
				{HEADERS[selectedSection.value].subtitle}
			</Text>
		</Animated.View>
	));

	return {
		updateHandler,
		selectedSectionId,
		Header,
		BackButton,
	};
}
