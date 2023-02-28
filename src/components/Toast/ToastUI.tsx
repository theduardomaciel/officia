import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Portal } from "@gorhom/portal";
import { Dimensions, Text, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import ErrorIcon from "assets/icons/error.svg";

import type { ToastConfig } from ".";

const ERROR_TITLE = "Opa! Parece que algo deu errado!";
const SUCCESS_TITLE = "Sucesso!";

const animProps = {
    damping: 150,
    stiffness: 300
} as WithSpringConfig

const ToastUI = forwardRef(({ toastProps = { preset: "error" }, toastPosition = "top", toastOffset = "100%", maxDragDistance, autoDismissDelay = 5000 }: ToastConfig, ref) => {
    const { height: screenHeight } = Dimensions.get("screen");
    const currentTimeout = useRef<any>(null);

    const contentHeight = useSharedValue(0);

    const parsedHeight = parseFloat(toastOffset.split("%")[0]) / 100 * screenHeight
    const activeHeight = useSharedValue(toastPosition === "top" ? screenHeight - parsedHeight : parsedHeight);
    const newActiveHeight = screenHeight - activeHeight.value;

    const topAnimation = useSharedValue(toastPosition === "top" ? -screenHeight : screenHeight);
    const animationStyle = useAnimatedStyle(() => {
        const compensation = contentHeight.value > 0 ? contentHeight.value / 2 : 0;
        const top = topAnimation.value - compensation; // removemos metade do tamanho do conteúdo para que o conteúdo fique centralizado
        const display = top === screenHeight - compensation || top === -screenHeight - compensation ? "none" : "flex";
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
            if (maxDragDistance && (toastPosition === "bottom" && event.translationY < -maxDragDistance || toastPosition === "top" && event.translationY > maxDragDistance)) {
                topAnimation.value = withSpring(ctx.startY, animProps);
            } else {
                topAnimation.value = ctx.startY + event.translationY;
            }
        },
        onEnd: (event) => {
            // Se o usuário arrastar o suficiente, o toast é fechado
            if (topAnimation.value > newActiveHeight + DISMISS_TOLERANCE && toastPosition === "bottom") {
                // Arrastado para baixo
                topAnimation.value = withSpring(screenHeight, animProps);
            } else if (topAnimation.value < newActiveHeight - DISMISS_TOLERANCE && toastPosition === "top") {
                // Arrastado para cima
                topAnimation.value = withSpring(-screenHeight, animProps);
            } else {
                topAnimation.value = withSpring(newActiveHeight, animProps);
            }
        }
    })

    const show = useCallback(() => {
        'worklet';
        //console.log("Por incrível que pareça chegou aqui!")
        if (autoDismissDelay && autoDismissDelay > 0) {
            currentTimeout.current = setTimeout(() => {
                hide(toastPosition);
                clearTimeout(currentTimeout.current);
            }, autoDismissDelay)
        }
        topAnimation.value = withSpring(newActiveHeight, animProps);
    }, [])

    const hide = useCallback((direction: "top" | "bottom") => {
        'worklet';
        currentTimeout.current && clearTimeout(currentTimeout.current);
        topAnimation.value = withSpring(direction === "bottom" ? screenHeight : -screenHeight, animProps)
    }, [])

    // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
    useImperativeHandle(
        ref,
        useCallback(
            () => ({
                show,
                hide,
            }),
            [hide, show]
        )
    );

    return (
        <Portal>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                    style={[animationStyle]}
                    className="w-screen absolute top-0 left-0 px-6 z-10 flex items-center justify-center"
                >
                    <View
                        onLayout={event => contentHeight.value = event.nativeEvent.layout.height}
                        className="w-full flex-col items-start px-4 py-3 bg-white dark:bg-gray-200 border border-dashed rounded"
                        style={{
                            borderColor: toastProps?.preset === "error" ? colors.primary.red : colors.primary.green
                        }}
                    >
                        <View className="flex-col items-start">
                            <View className="mb-2">
                                {
                                    toastProps?.preset === "error" ?
                                        <ErrorIcon />
                                        :
                                        toastProps?.preset === "success" ?
                                            <MaterialIcons name="check-circle" size={24} color={colors.white} />
                                            :
                                            <MaterialIcons name={toastProps?.icon as unknown as any} size={24} color={colors.white} />
                                }
                            </View>
                            <Text className="font-titleBold text-lg mb-1 text-black dark:text-white" style={{
                                lineHeight: 20
                            }}>
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