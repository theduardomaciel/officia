import { Text, View, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Portal } from "@gorhom/portal";
import Animated, { EntryAnimationsValues, ExitAnimationsValues, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig, withTiming } from "react-native-reanimated";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

const animProps = {
    damping: 150,
    stiffness: 300
} as WithSpringConfig

interface ModalProps {
    children?: React.ReactNode;
    isVisible: boolean;
    toggleVisibility: () => void;
    title?: string;
    message?: string;
    icon?: string;
    buttons?: {
        label: string;
        color?: string;
        onPress?: () => void;
        closeOnPress?: boolean;
    }[]
    cancelButton?: boolean;
}

export default function Modal({ isVisible, toggleVisibility, title, message, icon, buttons, cancelButton, children }: ModalProps) {
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
            if (event.translationY > 0 && event.translationY < DISMISS_TOLERANCE || event.translationY < 0 && event.translationY > -DISMISS_TOLERANCE) {
                dragAnimation.value = withSpring(ctx.startY + event.translationY, animProps);
            }
        },
        onEnd: (event) => {
            // Se o usuário arrastar o suficiente, o toast é fechado
            dragAnimation.value = withSpring(0, animProps)
        }
    })

    const BACKDROP_OPACITY = 0.55;

    const fadeInBackdrop = () => {
        'worklet'
        const animations = {
            opacity: withTiming(BACKDROP_OPACITY, { duration: 500 })
        };
        const initialValues = {
            opacity: 0
        };
        const callback = (finished: boolean) => {
            // optional callback that will fire when layout animation ends
        };
        return {
            initialValues,
            animations,
            callback,
        }
    }

    const fadeOutBackdrop = () => {
        'worklet'
        const animations = {
            opacity: withTiming(0, { duration: 500 })
        };
        const initialValues = {
            opacity: BACKDROP_OPACITY
        };
        const callback = (finished: boolean) => {
            // optional callback that will fire when layout animation ends
        };
        return {
            initialValues,
            animations,
            callback,
        }
    }

    const entering = (targetValues: EntryAnimationsValues) => {
        'worklet';

        const animations = {
            originY: withSpring(newActiveHeight - targetValues.targetHeight / 2, animProps),
            opacity: withTiming(1, { duration: 400 }),
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
        'worklet';
        const animations = {
            originY: withSpring(screenHeight, animProps),
            opacity: withTiming(0, { duration: 400 }),
        };
        const initialValues = {
            originY: values.currentOriginY,
            opacity: 1,
        };
        return {
            initialValues,
            animations,
        }
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dragAnimation.value }],
    }));

    return (
        isVisible ? (
            <Portal>
                <TouchableWithoutFeedback onPress={toggleVisibility}>
                    <Animated.View
                        entering={fadeInBackdrop}
                        exiting={fadeOutBackdrop}
                        className='bg-black absolute top-0 bottom-0 right-0 left-0 opacity-40'
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
                                {
                                    icon && <MaterialIcons name={icon as unknown as any} size={28} color={colors.white} />
                                }
                                {
                                    title && <Text className="font-titleBold text-lg text-black dark:text-white mt-1 mb-1">
                                        {title}
                                    </Text>
                                }
                            </View>
                            {
                                message && <Text className="text-sm text-black dark:text-text-100 mb-2">
                                    {message}
                                </Text>
                            }
                            {children}
                            <View className="flex-row w-full items-center justify-between">
                                {
                                    cancelButton && <TouchableOpacity
                                        activeOpacity={0.8}
                                        className="flex-1 flex items-center justify-center py-3 mt-2 bg-gray-100 rounded mr-2"
                                        onPress={toggleVisibility}
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
                                            style={{ marginRight: index === buttons.length - 1 ? 0 : 8, backgroundColor: button.color ?? colors.primary.green }}
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
                                    ))
                                }
                            </View>
                        </View>
                    </Animated.View>
                </PanGestureHandler>
            </Portal>
        ) : null
    )
}