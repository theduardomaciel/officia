import React, {
	useCallback,
	forwardRef,
	useImperativeHandle,
	useMemo,
} from "react";
import {
	View,
	Dimensions,
	TouchableWithoutFeedback,
	ViewStyle,
} from "react-native";
import {
	Gesture,
	GestureDetector,
	PanGestureHandler,
} from "react-native-gesture-handler";
import { Portal } from "@gorhom/portal";

import Animated, {
	interpolate,
	runOnJS,
	runOnUI,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withDecay,
	withSpring,
	WithSpringConfig,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetProps } from ".";

export const animProps = {
	damping: 100,
	stiffness: 400,
} as WithSpringConfig;

const BottomSheetUI = forwardRef(
	(
		{
			children,
			onDismiss,
			onDismissed,
			onExpand,
			onExpanded,
			height,
			backdropComponent: BackdropComponent,
			dismissOnBackdropPress = true,
			overDragAmount = 0,
			canDismiss = true,
			heightLimitBehaviour = "lock",
			defaultValues,
			colors,
			suppressBackdrop,
			suppressHandle,
			suppressPortal,
			simultaneousHandlers,
			panRef,
		}: BottomSheetProps,
		ref
	) => {
		const insets = useSafeAreaInsets();

		const overDrag =
			overDragAmount && overDragAmount > 0 ? overDragAmount : 0;

		const screenHeight =
			Dimensions.get("screen").height + (suppressPortal ? 24 : 0);
		const activeHeight =
			(screenHeight * parseFloat(height.split("%")[0])) / 100;
		const newActiveHeight = screenHeight - activeHeight - overDrag;

		const topAnimation = useSharedValue(
			defaultValues?.expanded ? newActiveHeight : screenHeight
		);
		const contentHeight = useSharedValue(0);

		const animationStyle = useAnimatedStyle(() => {
			const top = topAnimation.value;
			return {
				top,
			};
		});

		const backdropAnimationStyle = useAnimatedStyle(() => {
			const opacity = interpolate(
				topAnimation.value,
				[screenHeight, newActiveHeight],
				[0, 0.75]
			);
			const display = opacity === 0 ? "none" : "flex";

			return {
				opacity,
				display,
			};
		});

		console.log("rerender bottomsheet");

		const DISMISS_TOLERANCE = 50;

		/* const panGesture = useMemo(
			() =>
				Gesture.Pan()
					.onStart((event) => {
						topAnimation.value = event.absoluteY;
					})
					.onUpdate((event) => {
						// Caso o usuário arraste o bottom sheet para além da posição inicial, ele é mantido na posição inicial
						if (
							heightLimitBehaviour === "lock" &&
							event.translationY < 0
						) {
							// Caso haja uma quantidade extra de arraste, o bottom sheet é mantido na posição inicial menos a quantidade extra de arraste
							if (
								overDrag > 0 &&
								Math.abs(event.translationY) < overDrag
							) {
								topAnimation.value =
									event.absoluteY + event.translationY;
							} else {
								// Caso não, o bottom sheet é mantido na posição inicial normalmente

								// Com overDrag, voltamos com suavidade
								if (overDrag > 0) {
									topAnimation.value = withSpring(
										newActiveHeight,
										animProps
									);
								} else {
									// Sem overDrag, somente limitamos o arraste
									topAnimation.value = newActiveHeight;
								}
							}
						} else {
							// Caso contrário, o bottom sheet acompanha o arraste do usuário
							// topAnimation.value = ctx.startY + event.translationY;
							const smallWithContentHeight =
								heightLimitBehaviour === "contentHeight" &&
								Math.round(contentHeight.value) <=
									Math.round(activeHeight);

							const outOfBoundsHeight =
								contentHeight.value - activeHeight;
							const insideBounds =
								(topAnimation.value < 0 &&
									Math.abs(topAnimation.value) <
										outOfBoundsHeight - newActiveHeight) ||
								topAnimation.value > 0;

							// O !smallWithContentHeight previne que o usuário possa arrastar para cima quando o bottom sheet é pequeno demais para ser arrastado para cima
							if (
								(insideBounds &&
									event.translationY < 0 &&
									!smallWithContentHeight) ||
								event.translationY > 0
							) {
								topAnimation.value = Math.max(
									event.absoluteY + event.translationY,
									newActiveHeight - outOfBoundsHeight
								);
							}
						}
					})
					.onEnd((event) => {
						// Se o usuário arrastar o suficiente, o bottom sheet é fechado
						if (
							canDismiss &&
							topAnimation.value >
								newActiveHeight + DISMISS_TOLERANCE
						) {
							topAnimation.value = withSpring(
								screenHeight,
								animProps,
								() => {
									if (onDismissed) {
										runOnJS(onDismissed)();
									}
								}
							);
							if (onDismiss) {
								runOnJS(onDismiss)();
							}
						} else {
							// Volta para a posição inicial caso:
							// 1. a opção de dismiss estiver desativada
							// 2. o usuário não tenha arrastado o suficiente para fechar o bottom sheet

							const smallWithContentHeight =
								heightLimitBehaviour === "contentHeight" &&
								Math.round(contentHeight.value) <=
									Math.round(activeHeight);
							// Caso o comportamento de limite de altura permita que o bottom sheet seja arrastado para cima, somente voltaremos para a posição inicial caso o usuário deslize o suficiente para fechar o bottom sheet (baixo)
							if (
								(heightLimitBehaviour !== "lock" &&
									topAnimation.value > newActiveHeight) ||
								smallWithContentHeight
							) {
								topAnimation.value = withSpring(
									newActiveHeight,
									animProps
								);
							} else if (heightLimitBehaviour === "lock") {
								// Caso contrário, possuindo trava no limite de altura, voltaremos para a posição inicial caso o usuário deslize o suficiente para baixo
								topAnimation.value = withSpring(
									newActiveHeight,
									animProps
								);
							} else if (
								heightLimitBehaviour === "contentHeight"
							) {
								const outOfBoundsHeight =
									contentHeight.value - activeHeight;
								topAnimation.value = withDecay({
									velocity: event.velocityY,
									deceleration: 0.995,
									clamp: [
										newActiveHeight - outOfBoundsHeight,
										newActiveHeight,
									],
								});
							}
						}
					}),
			[]
		); */

		const gestureHandler = useAnimatedGestureHandler({
			onStart: (_, ctx: any) => {
				ctx.startY = topAnimation.value;
			},
			onActive: (event, ctx: any) => {
				// Caso o usuário arraste o bottom sheet para além da posição inicial, ele é mantido na posição inicial
				if (heightLimitBehaviour === "lock" && event.translationY < 0) {
					// Caso haja uma quantidade extra de arraste, o bottom sheet é mantido na posição inicial menos a quantidade extra de arraste
					if (
						overDrag > 0 &&
						Math.abs(event.translationY) < overDrag
					) {
						topAnimation.value = ctx.startY + event.translationY;
					} else {
						// Caso não, o bottom sheet é mantido na posição inicial normalmente

						// Com overDrag, voltamos com suavidade
						if (overDrag > 0) {
							topAnimation.value = withSpring(
								newActiveHeight,
								animProps
							);
						} else {
							// Sem overDrag, somente limitamos o arraste
							topAnimation.value = newActiveHeight;
						}
					}
				} else {
					// Caso contrário, o bottom sheet acompanha o arraste do usuário
					// topAnimation.value = ctx.startY + event.translationY;
					const smallWithContentHeight =
						heightLimitBehaviour === "contentHeight" &&
						Math.round(contentHeight.value) <=
							Math.round(activeHeight);

					const outOfBoundsHeight =
						contentHeight.value - activeHeight;
					const insideBounds =
						(topAnimation.value < 0 &&
							Math.abs(topAnimation.value) <
								outOfBoundsHeight - newActiveHeight) ||
						topAnimation.value > 0;

					// O !smallWithContentHeight previne que o usuário possa arrastar para cima quando o bottom sheet é pequeno demais para ser arrastado para cima
					if (
						(insideBounds &&
							event.translationY < 0 &&
							!smallWithContentHeight) ||
						event.translationY > 0
					) {
						topAnimation.value = Math.max(
							ctx.startY + event.translationY,
							newActiveHeight - outOfBoundsHeight
						);
					}
					/* console.log("outOfBoundsHeight", outOfBoundsHeight)
                console.log("contentHeight", contentHeight.value)
                console.log(contentHeight.value - activeHeight - newActiveHeight)
                console.log("anim", Math.abs(topAnimation.value))
                console.log("bounds", outOfBoundsHeight - newActiveHeight)
                console.log("inside", insideBounds)
                console.log(Math.abs(topAnimation.value) + insets.bottom)
                console.log("-----------") */
				}
			},
			onEnd: (event) => {
				// Se o usuário arrastar o suficiente, o bottom sheet é fechado
				if (
					canDismiss &&
					topAnimation.value > newActiveHeight + DISMISS_TOLERANCE
				) {
					topAnimation.value = withSpring(
						screenHeight,
						animProps,
						() => {
							if (onDismissed) {
								runOnJS(onDismissed)();
							}
						}
					);
					if (onDismiss) {
						runOnJS(onDismiss)();
					}
				} else {
					// Volta para a posição inicial caso:
					// 1. a opção de dismiss estiver desativada
					// 2. o usuário não tenha arrastado o suficiente para fechar o bottom sheet

					const smallWithContentHeight =
						heightLimitBehaviour === "contentHeight" &&
						Math.round(contentHeight.value) <=
							Math.round(activeHeight);
					// Caso o comportamento de limite de altura permita que o bottom sheet seja arrastado para cima, somente voltaremos para a posição inicial caso o usuário deslize o suficiente para fechar o bottom sheet (baixo)
					if (
						(heightLimitBehaviour !== "lock" &&
							topAnimation.value > newActiveHeight) ||
						smallWithContentHeight
					) {
						topAnimation.value = withSpring(
							newActiveHeight,
							animProps
						);
					} else if (heightLimitBehaviour === "lock") {
						// Caso contrário, possuindo trava no limite de altura, voltaremos para a posição inicial caso o usuário deslize o suficiente para baixo
						topAnimation.value = withSpring(
							newActiveHeight,
							animProps
						);
					} else if (heightLimitBehaviour === "contentHeight") {
						const outOfBoundsHeight =
							contentHeight.value - activeHeight;
						topAnimation.value = withDecay({
							velocity: event.velocityY,
							deceleration: 0.995,
							clamp: [
								newActiveHeight - outOfBoundsHeight,
								newActiveHeight,
							],
						});
					}
				}
			},
		});

		const expand = useCallback(() => {
			"worklet";
			onExpand && runOnJS(onExpand)();
			topAnimation.value = withSpring(newActiveHeight, animProps, () => {
				onExpanded && runOnJS(onExpanded)();
			});
		}, []);

		const close = useCallback(() => {
			"worklet";
			/* onDismiss && runOnJS(onDismiss)(); */
			topAnimation.value = withSpring(screenHeight, animProps, () => {
				onDismissed && runOnJS(onDismissed)();
			});
		}, []);

		const update = useCallback((updateFunction: () => void) => {
			"worklet";
			onExpand && runOnJS(onExpand)();
			topAnimation.value = withSpring(screenHeight, animProps, () => {
				if (updateFunction) {
					runOnJS(updateFunction)();
				}
				onExpanded && runOnJS(onExpanded)();
				topAnimation.value = withSpring(newActiveHeight, animProps);
			});
		}, []);

		const onBackdropPress = useCallback(() => {
			if (dismissOnBackdropPress) {
				close();
				onDismiss && onDismiss();
			}
		}, [close, onDismiss]);

		const defaultStyle = {
			height: activeHeight + overDrag * 2,
		} as ViewStyle;

		const contentHeightStyle = {
			minHeight: activeHeight,
		} as ViewStyle;

		useImperativeHandle(
			ref,
			useCallback(
				() => ({
					expand,
					close,
					update,
				}),
				[expand, close, update]
			)
		);

		function BottomSheet() {
			return (
				<>
					{!suppressBackdrop && (
						<TouchableWithoutFeedback onPress={onBackdropPress}>
							<Animated.View
								key="BottomSheetBackdrop"
								style={[
									backdropAnimationStyle,
									colors?.backdrop
										? { backgroundColor: colors?.backdrop }
										: {},
								]}
								className="bg-black absolute top-0 bottom-0 right-0 left-0"
							/>
						</TouchableWithoutFeedback>
					)}
					{BackdropComponent ? (
						<BackdropComponent
							animatedPosition={topAnimation}
							screenHeight={screenHeight}
							newActiveHeight={newActiveHeight}
							onBackdropPress={onBackdropPress}
						/>
					) : null}
					{/* <GestureDetector gesture={panGesture}> */}
					<PanGestureHandler
						ref={panRef}
						onGestureEvent={gestureHandler}
						waitFor={simultaneousHandlers}
						//simultaneousHandlers={simultaneousHandlers}
					>
						<Animated.View
							onLayout={(event) =>
								(contentHeight.value =
									event.nativeEvent.layout.height)
							}
							style={[
								animationStyle,
								heightLimitBehaviour === "contentHeight"
									? contentHeightStyle
									: defaultStyle,
								colors?.background
									? { backgroundColor: colors?.background }
									: {},
							]}
							className="flex flex-col bg-white dark:bg-gray-200 absolute left-0 right-0 rounded-tl-3xl rounded-tr overflow-auto"
						>
							{!suppressHandle && (
								<View className="my-3 items-center">
									<View className="w-12 h-1 bg-black dark:bg-gray-100 rounded-2xl my-1" />
								</View>
							)}
							{children}
							{/* <View className='w-full bottom-0 bg-blue-800' style={{ height: overDrag + insets.bottom }} /> */}
							<View
								className="w-full bg-transparent"
								style={{ height: overDrag + insets.bottom }}
							/>
						</Animated.View>
					</PanGestureHandler>
					{/* </GestureDetector> */}
				</>
			);
		}

		return suppressPortal ? (
			<BottomSheet />
		) : (
			<Portal>
				<BottomSheet />
			</Portal>
		);
	}
);

export default BottomSheetUI;
