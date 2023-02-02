
import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Dimensions, TouchableWithoutFeedback } from "react-native";
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Portal } from "@gorhom/portal";

import Animated, { interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, WithSpringConfig } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const animProps = {
    damping: 100,
    stiffness: 400
} as WithSpringConfig

interface BottomSheetProps {
    children: React.ReactNode;
    activeHeight: number;
    expandedByDefault?: boolean;
    hideDeco?: boolean;
    hideBackdrop?: boolean;
    heightLimitBehaviour?: 'none' | 'lock' | 'limit' | 'spring';
    canDismiss?: boolean;
    suppressPortal?: boolean;
}

const BottomSheet = forwardRef(({ children, expandedByDefault, activeHeight, canDismiss = true, heightLimitBehaviour = "spring", hideDeco, hideBackdrop, suppressPortal }: BottomSheetProps, ref) => {
    const insets = useSafeAreaInsets();

    const height = Dimensions.get("screen").height;
    const modalHeight = Dimensions.get("window").height;
    console.log(height, modalHeight)

    const newActiveHeight = height - activeHeight;

    const topAnimation = useSharedValue(expandedByDefault ? newActiveHeight : height);

    const animationStyle = useAnimatedStyle(() => {
        const top = topAnimation.value;
        return {
            top
        }
    })

    const backdropAnimationStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            topAnimation.value,
            [height, newActiveHeight],
            [0, 0.75]
        );
        const display = opacity === 0 ? "none" : "flex";

        return {
            opacity,
            display
        }
    })

    const MINIMUM_HEIGHT = -50 - insets.bottom;

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startY = topAnimation.value;
        },
        onActive: (event, ctx: any) => {
            if (heightLimitBehaviour === "none") {
                // Allow passing screen height
                topAnimation.value = ctx.startY + event.translationY;
                if (topAnimation.value < MINIMUM_HEIGHT) {
                    topAnimation.value = MINIMUM_HEIGHT;
                }
                console.log(topAnimation.value)
            } else {
                // Not allow passing screen height
                // Animates back when limit is reached
                if (event.translationY < -0) {
                    if (heightLimitBehaviour === "spring") {
                        topAnimation.value = withSpring(newActiveHeight, animProps)
                    }
                } else {
                    topAnimation.value = ctx.startY + event.translationY, animProps;
                }
            }
        },
        onEnd: (event) => {
            if (canDismiss) {
                // Allow drag down to dismiss (and returns to original position when released)
                if (topAnimation.value > newActiveHeight + 50) {
                    topAnimation.value = withSpring(height, animProps)
                } else {
                    // Caso o comportamento seja de bloqueio, travaremos o bottom sheet na altura máxima
                    if (heightLimitBehaviour === "lock") {
                        topAnimation.value = withSpring(height, animProps)
                    } else if (heightLimitBehaviour !== "none") {
                        // Por contrário, volta para a altura padrão
                        topAnimation.value = withSpring(newActiveHeight, animProps)
                    }
                }
                // Don't allow drag down to dismiss
                // topAnimation.value = withSpring(newActiveHeight, animProps)
            } else {
                // Returns to original position when released bellow active height
                if (topAnimation.value > newActiveHeight - 50) {
                    topAnimation.value = withSpring(newActiveHeight, animProps)
                }
            }
        }
    })

    const expand = useCallback(() => {
        'worklet';
        topAnimation.value = withSpring(newActiveHeight, animProps)
    }, [])

    const close = useCallback(() => {
        'worklet';
        topAnimation.value = withSpring(height, animProps)
    }, [])

    const update = useCallback((updateFunction: () => void) => {
        'worklet';
        topAnimation.value = withSpring(height, animProps, () => {
            if (updateFunction) {
                runOnJS(updateFunction)();
            }
            topAnimation.value = withSpring(newActiveHeight, animProps)
        })
    }, [])

    useImperativeHandle(ref, () => ({
        expand, close, update
    }), [])

    const BottomSheet = () => (
        <>
            {
                !hideBackdrop && (
                    <TouchableWithoutFeedback onPress={() => {
                        close();
                    }}>
                        <Animated.View style={backdropAnimationStyle} className='bg-black absolute top-0 bottom-0 right-0 left-0' />
                    </TouchableWithoutFeedback>
                )
            }
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                    style={[animationStyle, suppressPortal ? { paddingBottom: insets.bottom, minHeight: activeHeight + insets.bottom } : { height: activeHeight }]}
                    className='flex flex-col bg-white dark:bg-gray-500 absolute left-0 right-0 rounded-tl-3xl rounded-tr overflow-auto'
                >
                    {
                        !hideDeco && <View className='my-3 items-center'>
                            <View className='w-12 h-1 bg-black dark:bg-gray-100 rounded-2xl my-1' />
                        </View>
                    }
                    {children}
                    {/* <View className='w-full absolute bottom-0 h-1 bg-blue-800' /> */}
                </Animated.View>
            </PanGestureHandler>
        </>
    )

    return (
        suppressPortal ?
            (
                <BottomSheet />
            ) : (
                <Portal>
                    <BottomSheet />
                </Portal>
            )
    )
});

export default BottomSheet;