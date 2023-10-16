import React, {
	ReactNode,
	useCallback,
	Dispatch,
	SetStateAction,
	useMemo,
} from "react";
import {
	Text,
	View,
	Dimensions,
	TouchableWithoutFeedback,
	TouchableOpacity,
	ActivityIndicator,
	PixelRatio,
} from "react-native";

import clsx from "clsx";
import { Portal } from "@gorhom/portal";

import { PanGestureHandler, ScrollView } from "react-native-gesture-handler";

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

const DISMISS_TOLERANCE = 50;
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

type Button = {
	label: string;
	color?: string;
	disabled?: boolean;
	onPress?: () => void;
	closeOnPress?: boolean;
	isLoading?: boolean;
};

export interface ModalProps {
	children?: React.ReactNode;
	isVisible: boolean;
	toggleVisibility: () => void;
	title?: string;
	description?: string | React.ReactNode;
	icon?: string | React.ReactNode;
	buttons?: {
		label: string;
		color?: string;
		disabled?: boolean;
		onPress?: () => void;
		closeOnPress?: boolean;
	}[];
	cancelButton?: boolean;
	closeOnBackdropPress?: boolean;
}

export default function Modal({
	isVisible,
	toggleVisibility,
	closeOnBackdropPress,
	title,
	description,
	icon,
	buttons,
	cancelButton,
	children,
}: ModalProps) {
	const { height: screenHeight } = Dimensions.get("screen");

	const activeHeight = useSharedValue(0.5 * screenHeight);
	const newActiveHeight = screenHeight - activeHeight.value;

	const dragAnimation = useSharedValue(0);

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
			dragAnimation.value = withSpring(0, animProps);
		},
	});

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
				onPress={() => closeOnBackdropPress && toggleVisibility()}
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
						{description && typeof description === "string" ? (
							<Text className="text-sm text-black dark:text-text-100 mb-2">
								{description}
							</Text>
						) : (
							description && description
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
	) : null;
}

export type Section = {
	title?: string;
	description?: string | React.ReactNode;
	icon?: string | React.ReactNode;
	children?: React.ReactNode;
	buttons?: Button[];
	buttonsDirection?: "row" | "column";
	cancelButton?: boolean;
	returnButton?: boolean;
	isLoading?: boolean;
	isSoftLoading?: boolean;
};

export interface MultisectionModalProps {
	currentSection: number;
	setCurrentSection: Dispatch<SetStateAction<number>>;
	sections: (Section | React.ReactNode)[];
	closeOnBackdropPress?: boolean;
}

Modal.Multisection = ({
	currentSection,
	setCurrentSection,
	sections,
	closeOnBackdropPress = false,
}: MultisectionModalProps) => {
	const { height: screenHeight, width: screenWidth } = useMemo(
		() => Dimensions.get("screen"),
		[]
	);

	const dragAnimation = useSharedValue(0);
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
			dragAnimation.value = withSpring(0, animProps);
		},
	});

	const entering = (targetValues: EntryAnimationsValues) => {
		"worklet";
		const animations = {
			originY: withSpring(
				screenHeight / 2 - targetValues.targetHeight / 2,
				animProps
			),
			opacity: withTiming(1, { duration: 300 }),
		};
		const initialValues = {
			originY: screenHeight,
			opacity: 0,
		};
		console.log("entering", targetValues.targetHeight / 2);
		return {
			initialValues,
			animations,
		};
	};

	const enteringHorizontal = (targetValues: EntryAnimationsValues) => {
		"worklet";
		const animations = {
			originX: withSpring(
				screenWidth / 2 - targetValues.targetWidth / 2,
				animProps
			),
			opacity: withTiming(1, { duration: 300 }),
		};
		const initialValues = {
			originX: -screenWidth,
			originY: screenHeight / 2 - targetValues.targetHeight / 2,
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

	const exitingHorizontal = (values: ExitAnimationsValues) => {
		"worklet";
		const animations = {
			originX: withSpring(screenWidth, animProps),
			opacity: withTiming(0, { duration: 300 }),
		};
		const initialValues = {
			originX: values.currentOriginX,
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

	const closeModal = useCallback(() => {
		setCurrentSection(0);
	}, []);

	// Caso o currentSection seja 0, não renderizar nada
	if (currentSection === 0) return null;

	const SECTIONS = [null, ...sections];

	// console.log("Seção atual alterada para: ", currentSection);

	return (
		<Portal>
			<TouchableWithoutFeedback
				onPress={() => closeOnBackdropPress && closeModal()}
			>
				<Animated.View
					entering={fadeInBackdrop}
					exiting={fadeOutBackdrop}
					className="bg-black absolute top-0 bottom-0 right-0 left-0 opacity-40 z-10"
				/>
			</TouchableWithoutFeedback>
			{SECTIONS.map((section, index) => {
				if (index === 0) return null;

				const {
					title,
					description,
					icon,
					children,
					buttons,
					buttonsDirection,
					cancelButton,
					returnButton,
					isLoading,
					isSoftLoading,
				} = section as Section;

				// console.log(`Renderizando modal de index ${index}`);

				return currentSection === index ? (
					<PanGestureHandler
						onGestureEvent={gestureHandler}
						key={index.toString()}
					>
						<Animated.View
							entering={
								index === 1 ? entering : enteringHorizontal
							}
							exiting={
								index === 1 || index === sections.length - 1
									? exiting
									: exitingHorizontal
							}
							style={[
								animatedStyle,
								{
									flex: 1,
									left: 0,
									right: 0,
									top: 0,
									bottom: 0,
									position: "absolute",
									zIndex: 20,
									alignItems: "center",
									justifyContent: "center",
									paddingLeft: 16,
									paddingRight: 16,
								},
							]}
						>
							{!React.isValidElement(section) ? (
								<View
									className="w-full flex-col p-5 bg-white dark:bg-gray-200 rounded"
									style={{
										maxHeight: screenHeight - 100,
									}}
								>
									<View className="flex-col items-start">
										{icon && typeof icon === "string" ? (
											<MaterialIcons
												name={icon as unknown as any}
												size={
													28 *
														PixelRatio.getFontScale() +
													2
												}
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
									{description &&
									typeof description === "string" ? (
										<Text className="text-sm text-black dark:text-text-100 mb-2">
											{description}
										</Text>
									) : (
										description && description
									)}
									{children}
									{isLoading && (
										<View className="w-full py-2.5 bg-gray-100 rounded-md flex-row items-center justify-center">
											<ActivityIndicator
												size={"small"}
												color={colors.text[100]}
											/>
										</View>
									)}
									<View
										className="w-full items-center justify-between"
										style={{
											flexDirection:
												buttonsDirection ?? "row",
											columnGap: 8,
										}}
									>
										{cancelButton && (
											<TouchableOpacity
												activeOpacity={
													isSoftLoading ? 1 : 0.8
												}
												disabled={isSoftLoading}
												style={{
													opacity: isSoftLoading
														? 0.5
														: 1,
												}}
												className="flex-1 flex items-center justify-center py-3 mt-2 bg-gray-100 rounded"
												onPress={closeModal}
											>
												<Text className="text-sm text-black dark:text-white">
													Cancelar
												</Text>
											</TouchableOpacity>
										)}
										{buttons &&
											buttons.map((button, index) => (
												<TouchableOpacity
													activeOpacity={
														isSoftLoading ? 1 : 0.8
													}
													className={clsx(
														"flex-1 items-center justify-center py-3 mt-2 bg-primary rounded",
														{
															"bg-gray-100 opacity-50":
																button.disabled,
														}
													)}
													style={[
														{
															backgroundColor:
																button.color ??
																colors.primary,
														},
														buttonsDirection ===
															"column" && {
															width: "100%",
														},
													]}
													disabled={
														button.disabled ||
														isSoftLoading
													}
													key={index}
													onPress={() => {
														button.onPress &&
															button.onPress();
														if (
															button.closeOnPress
														) {
															closeModal();
														}
													}}
												>
													{isSoftLoading ? (
														<ActivityIndicator
															size={"small"}
															color={
																colors.text[100]
															}
														/>
													) : (
														<Text className="text-sm text-black dark:text-white text-center">
															{button.label}
														</Text>
													)}
												</TouchableOpacity>
											))}
									</View>
								</View>
							) : (
								(section as ReactNode)
							)}
						</Animated.View>
					</PanGestureHandler>
				) : null;
			})}
		</Portal>
	);
};
