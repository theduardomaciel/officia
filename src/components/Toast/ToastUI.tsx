import { Text, View, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Portal } from "@gorhom/portal";
import Animated, { cancelAnimation, interpolate, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import ErrorIcon from "assets/icons/error.svg";
import colors from "global/colors";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { ToastConfig } from ".";

const ERROR_TITLE = "Opa! Parece que algo deu errado!";
const SUCCESS_TITLE = "Sucesso!";

const animProps = {
    damping: 150,
    stiffness: 300
} as WithSpringConfig

const ToastUI = forwardRef(({ toastProps = { preset: "error" }, toastPosition = "top", toastOffset = "100%", autoDismissDelay = 5000 }: ToastConfig, ref) => {
    console.log(toastOffset)
    const { height: screenHeight } = Dimensions.get("screen");

    const activeHeight = parseFloat(toastOffset.split("%")[0]) / 100 * screenHeight;
    const newActiveHeight = screenHeight - activeHeight;
    console.log(newActiveHeight, toastOffset)

    const topAnimation = useSharedValue(toastPosition === "top" ? -screenHeight : screenHeight);

    const animationStyle = useAnimatedStyle(() => {
        const top = topAnimation.value;
        const display = top === screenHeight || top === -screenHeight ? "none" : "flex";
        const opacity = interpolate(
            topAnimation.value,
            [(screenHeight / 8), newActiveHeight, -(screenHeight / 8)],
            [0, 1, 0],
        );

        return {
            top,
            display,
            opacity
        }
    })

    const DISMISS_TOLERANCE = 50;
    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startY = topAnimation.value;
        },
        onActive: (event, ctx: any) => {
            // Caso o usuário arraste o bottom sheet para além da posição inicial, ele é mantido na posição inicial
            topAnimation.value = ctx.startY + event.translationY;
        },
        onEnd: (event) => {
            // Se o usuário arrastar o suficiente, o bottom sheet é fechado
            if (topAnimation.value > newActiveHeight + DISMISS_TOLERANCE) {
                // Arrastado para baixo
                topAnimation.value = withSpring(screenHeight, animProps, () => {
                    if (toastPosition === "top") {
                        topAnimation.value = -screenHeight;
                    }
                });
            } else if (topAnimation.value < newActiveHeight - DISMISS_TOLERANCE) {
                // Arrastado para cima
                topAnimation.value = withSpring(-screenHeight, animProps, () => {
                    if (toastPosition === "bottom") {
                        topAnimation.value = screenHeight;
                    }
                });
            } else {
                topAnimation.value = withSpring(newActiveHeight, animProps);
            }
        }
    })

    const show = useCallback(() => {
        'worklet';
        console.log("Por incrível que pareça chegou aqui?")
        const timeout = setTimeout(() => {
            if (topAnimation.value === newActiveHeight) {
                hide(toastPosition);
                clearTimeout(timeout);
            }
        }, autoDismissDelay)
        console.log(newActiveHeight, "newActiveHeight")
        topAnimation.value = withSpring(newActiveHeight, animProps);
    }, [])

    const hide = useCallback((direction: "top" | "bottom") => {
        'worklet';
        topAnimation.value = withSpring(direction === "bottom" ? screenHeight : -screenHeight, animProps)
    }, [])

    // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
    useImperativeHandle(
        ref,
        useCallback(
            () => ({
                show,
                hide
            }),
            [hide, show]
        )
    );

    return (
        <Portal>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                    // onLayout={event => contentHeight.value = event.nativeEvent.layout.height}
                    style={animationStyle}
                    className="w-screen absolute top-0 left-0 px-6 z-10 flex items-center justify-center"
                >
                    <View className="w-full flex-col items-start px-4 py-3 bg-white dark:bg-gray-200 border border-dashed border-primary-red rounded">
                        <View className="flex-col items-start">
                            {
                                toastProps?.preset === "error" ?
                                    <ErrorIcon />
                                    :
                                    toastProps?.preset === "success" ?
                                        <MaterialIcons name="check-circle" size={28} color={colors.white} />
                                        :
                                        <MaterialIcons name={toastProps?.icon as unknown as any} size={28} color={colors.white} />
                            }
                            <Text className="font-titleBold text-lg text-black dark:text-white">
                                {toastProps?.title ? toastProps?.title
                                    : toastProps?.preset === "error" ? ERROR_TITLE
                                        : toastProps?.preset === "success" ? SUCCESS_TITLE
                                            : ""}
                            </Text>
                        </View>
                        <Text className="text-sm text-black dark:text-white">
                            {toastProps?.message}
                        </Text>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </Portal>
    )
});

export default ToastUI;