import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Text, View, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Portal } from "@gorhom/portal";
import Animated, { interpolate, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

const animProps = {
    damping: 150,
    stiffness: 300
} as WithSpringConfig

interface ModalProps {
    children: React.ReactNode;
    title?: string;
    message?: string;
    icon?: string;
    buttons?: {
        label: string;
        onPress: () => void;
        closeOnPress?: boolean;
    }[]
    cancelButton?: boolean;
}

const Modal = forwardRef(({ title, message, icon, buttons, cancelButton, children }: ModalProps, ref) => {
    const { height: screenHeight } = Dimensions.get("screen");

    const contentHeight = useSharedValue(0);

    const activeHeight = useSharedValue(0.5 * screenHeight);
    const newActiveHeight = screenHeight - activeHeight.value;

    const topAnimation = useSharedValue(screenHeight);
    const animationStyle = useAnimatedStyle(() => {
        const compensation = contentHeight.value > 0 ? contentHeight.value / 2 : 0;
        const top = topAnimation.value - compensation; // removemos metade do tamanho do conteúdo para que o conteúdo fique centralizado
        const display = top === screenHeight - compensation || top === -screenHeight - compensation ? "none" : "flex";

        return {
            top,
            display,
        }
    })

    const backdropAnimationStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            topAnimation.value,
            [-screenHeight, newActiveHeight, screenHeight + contentHeight.value],
            [0, 0.75, 0]
        );
        const display = opacity === 0 ? "none" : "flex";
        const pointerEvents = topAnimation.value !== newActiveHeight ? "none" : "auto"

        return {
            opacity,
            display,
            pointerEvents
        }
    })

    const DISMISS_TOLERANCE = 50;
    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startY = topAnimation.value;
        },
        onActive: (event, ctx: any) => {
            if (event.translationY > 0 && event.translationY < DISMISS_TOLERANCE || event.translationY < 0 && event.translationY > -DISMISS_TOLERANCE) {
                topAnimation.value = withSpring(ctx.startY + event.translationY, animProps);
            }
        },
        onEnd: (event) => {
            // Se o usuário arrastar o suficiente, o toast é fechado
            topAnimation.value = withSpring(newActiveHeight, animProps);
        }
    })

    const open = useCallback(() => {
        'worklet';
        topAnimation.value = withSpring(newActiveHeight, animProps);
    }, [])

    const close = useCallback(() => {
        'worklet';
        topAnimation.value = withSpring(screenHeight + contentHeight.value, animProps)
    }, [])

    // This must use useCallback to ensure the ref doesn't get set to null and then a new ref every render.
    useImperativeHandle(
        ref,
        useCallback(
            () => ({
                open,
                close,
            }),
            [close, open]
        )
    );

    return (
        <Portal>
            <TouchableWithoutFeedback
                onPress={() => {
                    close();
                }}
            >
                <Animated.View
                    style={[backdropAnimationStyle]}
                    className='bg-black absolute top-0 bottom-0 right-0 left-0'
                />
            </TouchableWithoutFeedback>
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                    style={[animationStyle]}
                    className="w-screen absolute top-0 left-0 px-6 z-10 flex items-center justify-center"
                >
                    <View
                        onLayout={event => contentHeight.value = event.nativeEvent.layout.height}
                        className="w-full flex-col items-start p-5 bg-white dark:bg-gray-200 rounded"
                    >
                        <View className="flex-col items-start">
                            {
                                icon && <MaterialIcons name={icon as unknown as any} size={28} color={colors.white} />
                            }
                            {
                                title && <Text className="font-titleBold text-lg text-black dark:text-white mt-1">
                                    {title}
                                </Text>
                            }
                        </View>
                        {
                            message && <Text className="text-sm text-black dark:text-white">
                                {message}
                            </Text>
                        }
                        {children}
                        <View className="flex-row w-full items-center justify-between">
                            {
                                cancelButton && <TouchableOpacity
                                    activeOpacity={0.8}
                                    className="flex-1 flex items-center justify-center py-3 mt-2 bg-gray-100 rounded mr-2"
                                    onPress={() => {
                                        close();
                                    }}
                                >
                                    <Text className="text-sm text-black dark:text-white">
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                            }
                            {
                                buttons && buttons.map((button, index) => (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        className="flex-1 items-center justify-center py-3 mt-2 bg-primary-green rounded"
                                        style={{ marginRight: index === buttons.length - 1 ? 0 : 8 }}
                                        key={index}
                                        onPress={() => {
                                            button.onPress();
                                            button.closeOnPress && close();
                                        }}
                                    >
                                        <Text className="text-sm text-black dark:text-white">
                                            {button.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        </Portal>
    )
});

export default Modal;