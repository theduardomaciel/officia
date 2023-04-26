import React from "react";
import {
	Text,
	View,
	Dimensions,
	TouchableWithoutFeedback,
	TouchableOpacity,
} from "react-native";

import clsx from "clsx";
import { Portal } from "@gorhom/portal";

import { PanGestureHandler } from "react-native-gesture-handler";

import Animated, {
	EntryAnimationsValues,
	ExitAnimationsValues,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	WithSpringConfig,
	withTiming,
} from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

const animProps = {
	damping: 150,
	stiffness: 800,
} as WithSpringConfig;

export interface ModalProps {
	children?: React.ReactNode;
	isVisible: boolean;
	toggleVisibility: () => void;
	suppressCloseOnBackdropPress?: boolean;
	title?: string;
	message?: string | React.ReactNode;
	icon?: string | React.ReactNode;
	buttons?: {
		label: string;
		color?: string;
		disabled?: boolean;
		onPress?: () => void;
		closeOnPress?: boolean;
	}[];
	cancelButton?: boolean;
}

export default function Modal({
	isVisible,
	toggleVisibility,
	suppressCloseOnBackdropPress,
	title,
	message,
	icon,
	buttons,
	cancelButton,
	children,
}: ModalProps) {
	const { height: screenHeight } = Dimensions.get("screen");

	const activeHeight = useSharedValue(0.5 * screenHeight);
	const newActiveHeight = screenHeight - activeHeight.value;

	const dragAnimation = useSharedValue(0);

	const DISMISS_TOLERANCE = 50;
	const gestureHandler = useAnimatedGestureHandler({
		onStart: (_, ctx: any) => {
			ctx.startY = dragAnimation.value;
		},
		onActive: (event, ctx: any) => {
			if (
				(event.translationY > 0 &&
					event.translationY < DISMISS_TOLERANCE) ||
				(event.translationY < 0 &&
					event.translationY > -DISMISS_TOLERANCE)
			) {
				dragAnimation.value = withSpring(
					ctx.startY + event.translationY,
					animProps
				);
			}
		},
		onEnd: (event) => {
			// Se o usuário arrastar o suficiente, o toast é fechado
			dragAnimation.value = withSpring(0, animProps);
		},
	});

	const BACKDROP_OPACITY = 0.55;

	const fadeInBackdrop = () => {
		"worklet";
		const animations = {
			opacity: withTiming(BACKDROP_OPACITY, { duration: 300 }),
		};
		const initialValues = {
			opacity: 0,
		};
		const callback = (finished: boolean) => {
			// optional callback that will fire when layout animation ends
		};
		return {
			initialValues,
			animations,
			callback,
		};
	};

	const fadeOutBackdrop = () => {
		"worklet";
		const animations = {
			opacity: withTiming(0, { duration: 300 }),
		};
		const initialValues = {
			opacity: BACKDROP_OPACITY,
		};
		const callback = (finished: boolean) => {
			// optional callback that will fire when layout animation ends
		};
		return {
			initialValues,
			animations,
			callback,
		};
	};

	const entering = (targetValues: EntryAnimationsValues) => {
		"worklet";

		const animations = {
			originY: withSpring(
				newActiveHeight - targetValues.targetHeight / 2,
				animProps
			),
			opacity: withTiming(1, { duration: 300 }),
		};
		const initialValues = {
			originY: screenHeight,
			opacity: 0,
		};
		return {
			initialValues,
			animations,
		};
	};

	const exiting = (values: ExitAnimationsValues) => {
		"worklet";
		const animations = {
			originY: withSpring(screenHeight, animProps),
			opacity: withTiming(0, { duration: 300 }),
		};
		const initialValues = {
			originY: values.currentOriginY,
			opacity: 1,
		};
		return {
			initialValues,
			animations,
		};
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: dragAnimation.value }],
	}));

	return isVisible ? (
		<Portal>
			<TouchableWithoutFeedback
				onPress={() =>
					!suppressCloseOnBackdropPress && toggleVisibility
				}
			>
				<Animated.View
					entering={fadeInBackdrop}
					exiting={fadeOutBackdrop}
					className="bg-black absolute top-0 bottom-0 right-0 left-0 opacity-40"
				/>
			</TouchableWithoutFeedback>
			<PanGestureHandler onGestureEvent={gestureHandler}>
				<Animated.View
					entering={entering}
					exiting={exiting}
					style={animatedStyle}
					className="w-screen absolute top-0 left-0 px-6 z-10 flex items-center justify-center"
				>
					<View className="w-full flex-col items-start p-5 bg-white dark:bg-gray-200 rounded">
						<View className="flex-col items-start">
							{icon && typeof icon === "string" ? (
								<MaterialIcons
									name={icon as unknown as any}
									size={28}
									color={colors.white}
								/>
							) : (
								icon && icon
							)}
							{title && (
								<Text className="font-titleBold text-lg text-black dark:text-white mt-1 mb-1">
									{title}
								</Text>
							)}
						</View>
						{message && typeof message === "string" ? (
							<Text className="text-sm text-black dark:text-text-100 mb-2">
								{message}
							</Text>
						) : (
							message && message
						)}
						{children}
						<View className="flex-row w-full items-center justify-between">
							{cancelButton && (
								<TouchableOpacity
									activeOpacity={0.8}
									className="flex-1 flex items-center justify-center py-3 mt-2 bg-gray-100 rounded mr-2"
									onPress={toggleVisibility}
								>
									<Text className="text-sm text-black dark:text-white">
										Cancelar
									</Text>
								</TouchableOpacity>
							)}
							{buttons &&
								buttons.map((button, index) => (
									<TouchableOpacity
										activeOpacity={0.8}
										className={clsx(
											"flex-1 items-center justify-center py-3 mt-2 bg-primary rounded",
											{
												"bg-gray-100 opacity-50":
													button.disabled,
											}
										)}
										style={{
											marginRight:
												index === buttons.length - 1
													? 0
													: 8,
											backgroundColor:
												button.color ?? colors.primary,
										}}
										disabled={button.disabled}
										key={index}
										onPress={() => {
											button.onPress && button.onPress();
											if (button.closeOnPress) {
												toggleVisibility();
											}
										}}
									>
										<Text className="text-sm text-black dark:text-white">
											{button.label}
										</Text>
									</TouchableOpacity>
								))}
						</View>
					</View>
				</Animated.View>
			</PanGestureHandler>
		</Portal>
	) : (
		<></>
	);
}
