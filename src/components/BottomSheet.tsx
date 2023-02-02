
import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Dimensions, TouchableWithoutFeedback, ViewStyle } from "react-native";
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
    heightLimitBehaviour?: 'top' | 'lock' | 'contentHeight';
    // a animação do lock muda dependendo de se no futuro haverá a opção de adicionar uma propriedade de altura adicional para o bottom sheet. Possuindo essa altura adicional a animação passa a ser de spring
    overDragAmount?: number;
    canDismiss?: boolean;
    defaultValues?: {
        expanded?: boolean;
        suppressHandle?: boolean;
        suppressBackdrop?: boolean;
        suppressPortal?: boolean;
    }
}

const BottomSheet = forwardRef(({ children, activeHeight, overDragAmount = 0, canDismiss = true, heightLimitBehaviour = "lock", defaultValues }: BottomSheetProps, ref) => {
    const insets = useSafeAreaInsets();

    const overDrag = overDragAmount && overDragAmount > 0 ? overDragAmount : 0;

    const height = Dimensions.get("screen").height + (defaultValues?.suppressPortal ? 24 : 0);
    const newActiveHeight = height - activeHeight - overDrag;

    const topAnimation = useSharedValue(defaultValues?.expanded ? newActiveHeight : height);
    const contentHeight = useSharedValue(0);

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

    const DISMISS_TOLERANCE = 50;

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startY = topAnimation.value;
        },
        onActive: (event, ctx: any) => {
            // Caso o usuário arraste o bottom sheet para além da posição inicial, ele é mantido na posição inicial
            if (heightLimitBehaviour === "lock" && event.translationY < 0) {
                // Caso haja uma quantidade extra de arraste, o bottom sheet é mantido na posição inicial menos a quantidade extra de arraste
                if (overDrag > 0) {
                    topAnimation.value = newActiveHeight - overDrag;
                } else {
                    // Caso não, o bottom sheet é mantido na posição inicial normalmente
                    topAnimation.value = newActiveHeight;
                }
            } else {
                // Caso contrário, o bottom sheet acompanha o arraste do usuário
                // topAnimation.value = ctx.startY + event.translationY;
                const smallWithContentHeight = heightLimitBehaviour === "contentHeight" && Math.round(contentHeight.value) <= Math.round(activeHeight);

                const outOfBoundsHeight = contentHeight.value - activeHeight;
                const insideBounds = topAnimation.value < 0 && Math.abs(topAnimation.value) < outOfBoundsHeight - newActiveHeight
                    || topAnimation.value > 0;

                // O !smallWithContentHeight previne que o usuário possa arrastar para cima quando o bottom sheet é pequeno demais para ser arrastado para cima
                if (insideBounds && event.translationY < 0 && !smallWithContentHeight || event.translationY > 0) {
                    topAnimation.value = ctx.startY + event.translationY;
                }
                console.log("outOfBoundsHeight", outOfBoundsHeight)
                console.log("contentHeight", contentHeight.value)
                console.log(contentHeight.value - activeHeight - newActiveHeight)
                console.log("anim", Math.abs(topAnimation.value))
                console.log("bounds", outOfBoundsHeight - newActiveHeight)
                console.log("inside", insideBounds)
                console.log(Math.abs(topAnimation.value) + insets.bottom)
                console.log("-----------")
            }
        },
        onEnd: (event) => {
            // Se o usuário arrastar o suficiente, o bottom sheet é fechado
            if (canDismiss && topAnimation.value > newActiveHeight + DISMISS_TOLERANCE) {
                topAnimation.value = withSpring(height, animProps);
            } else {
                // Volta para a posição inicial caso:
                // 1. a opção de dismiss estiver desativada
                // 2. o usuário não tenha arrastado o suficiente para fechar o bottom sheet

                const smallWithContentHeight = heightLimitBehaviour === "contentHeight" && Math.round(contentHeight.value) <= Math.round(activeHeight);
                // Caso o comportamento de limite de altura permita que o bottom sheet seja arrastado para cima, somente voltaremos para a posição inicial caso o usuário deslize o suficiente para fechar o bottom sheet (baixo)
                if (heightLimitBehaviour !== "lock" && topAnimation.value > newActiveHeight || smallWithContentHeight) {
                    topAnimation.value = withSpring(newActiveHeight, animProps);
                } else if (heightLimitBehaviour === "lock") {
                    // Caso contrário, possuindo trava no limite de altura, voltaremos para a posição inicial caso o usuário deslize o suficiente para baixo
                    topAnimation.value = withSpring(newActiveHeight, animProps);
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

    const defaultStyle = {
        height: activeHeight + (overDrag * 2)
    } as ViewStyle;

    const contentHeightStyle = {
        minHeight: activeHeight,
    } as ViewStyle;

    useImperativeHandle(ref, () => ({
        expand, close, update
    }), [])

    const BottomSheet = () => (
        <>
            {
                !defaultValues?.suppressBackdrop && (
                    <TouchableWithoutFeedback onPress={() => {
                        close();
                    }}>
                        <Animated.View style={backdropAnimationStyle} className='bg-black absolute top-0 bottom-0 right-0 left-0' />
                    </TouchableWithoutFeedback>
                )
            }
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                    onLayout={(event) => contentHeight.value = event.nativeEvent.layout.height}
                    style={[
                        animationStyle,
                        heightLimitBehaviour === "contentHeight" ? contentHeightStyle : defaultStyle,
                    ]}
                    className='flex flex-col bg-white dark:bg-gray-500 absolute left-0 right-0 rounded-tl-3xl rounded-tr overflow-auto'
                >
                    {
                        !defaultValues?.suppressHandle && <View className='my-3 items-center'>
                            <View className='w-12 h-1 bg-black dark:bg-gray-100 rounded-2xl my-1' />
                        </View>
                    }
                    {children}
                    {/* <View className='w-full bottom-0 bg-blue-800' style={{ height: overDrag + insets.bottom }} /> */}
                    <View className='w-full bg-transparent' style={{ height: overDrag + insets.bottom }} />
                </Animated.View>
            </PanGestureHandler>
        </>
    )

    return (
        defaultValues?.suppressPortal ?
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