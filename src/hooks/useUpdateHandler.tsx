import { memo, useCallback } from "react";
import Animated, {
	Layout,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
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

interface UpdateHandlerProps {
	sections: string[];
	sectionsConfig?: {
		[key: string]: {
			backButtonProps?: {
				label?: string;
				isVisible?: boolean;
				disabled?: boolean;
				suppressBackButton?: boolean;
			};
		};
	};
	HEADERS: Header[];
	onLimitReached?: () => void;
	initialValue?: number;
}

export default function useUpdateHandler({
	sections,
	HEADERS,
	onLimitReached,
	initialValue = 0,
}: UpdateHandlerProps) {
	const { width } = useWindowDimensions();

	const COLUMN_GAP = width / 2;
	const ANIMATION_WIDTH = width - 24 * 2;

	const getPosition = useCallback(
		(id: number) => -(ANIMATION_WIDTH + COLUMN_GAP) * id,
		[width]
	);

	const selectedSectionId = useSharedValue(initialValue);
	const headerPosition = useSharedValue(getPosition(initialValue));

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
			// Close current section bottom sheet
			BottomSheet.close(sections[selectedSectionId.value]);

			// Update selected section
			const POSITION = getPosition(id);

			headerPosition.value = withSpring(POSITION, SPRING_OPTIONS);
			selectedSectionId.value = withSpring(id, SPRING_OPTIONS);

			// Open next section bottom sheet
			BottomSheet.expand(sections[id]);
		} else {
			onLimitReached && onLimitReached();
		}
	}, []);

	const Header = memo(() => (
		<Animated.View
			className={"w-full items-center justify-start flex-row"}
			style={[headerAnimatedStyle, { columnGap: COLUMN_GAP }]}
			layout={Layout.springify().damping(7).stiffness(100).mass(0.25)}
		>
			{HEADERS.map((header, index) => (
				<View
					key={index}
					className="flex-col items-center justify-center"
					style={{ rowGap: 10, width: ANIMATION_WIDTH }}
				>
					<Text className="font-logoRegular leading-[95%] text-4xl text-white text-center w-5/6">
						{header.title}
					</Text>
					<Text className="text-white text-sm font-semibold text-center">
						{header.subtitle}
					</Text>
				</View>
			))}
		</Animated.View>
	));

	const BackButton = memo(
		({
			customConfig,
		}: {
			customConfig?: {
				label?: string;
				isHidden?: boolean;
				disabled?: boolean;
				suppressIcon?: boolean;
			};
		}) =>
			!customConfig?.isHidden ? (
				<View className="w-full flex-col items-center justify-center">
					<TouchableOpacity
						className="flex-row bg-gray-200 items-center justify-center rounded-sm p-[5px]"
						style={{
							columnGap: 5,
							opacity: 1,
						}}
						disabled={customConfig?.disabled}
						onPress={() =>
							updateHandler(selectedSectionId.value - 1)
						}
					>
						{!customConfig?.suppressIcon && (
							<MaterialIcons
								name="arrow-back"
								size={14}
								color={colors.white}
							/>
						)}
						<Text className="text-white text-sm">
							{customConfig?.label ?? "Voltar"}
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View className="py-1.5" />
			)
	);

	return {
		updateHandler,
		selectedSectionId,
		Header,
		BackButton,
	};
}
