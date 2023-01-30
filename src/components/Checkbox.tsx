import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import Animated, { withSpring, withTiming, ZoomOut } from 'react-native-reanimated';
import clsx from 'clsx';

import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

interface Props extends TouchableOpacityProps {
    checked?: boolean;
    title: string;
}

export function Checkbox({ title, checked = false, ...rest }: Props) {
    const entering = (targetValues: any) => {
        'worklet';
        const animations = {
            opacity: withTiming(1, { duration: 500 }),
            transform: [
                { scale: withSpring(1, { mass: 0.5, damping: 10, stiffness: 50 }) },
            ],
        };
        const initialValues = {
            opacity: 0,
            transform: [{ scale: 0 }],
        };
        return {
            initialValues,
            animations,
        };
    };

    return (
        <TouchableOpacity activeOpacity={0.8} className='flex-row mb-2 items-center' {...rest}>
            {
                checked ?
                    <Animated.View
                        className='h-8 w-8 bg-green-500 rounded-lg items-center justify-center'
                        entering={entering}
                        exiting={ZoomOut}
                    >
                        <Feather name='check' size={20} color={colors.white} />
                    </Animated.View>
                    :
                    <View className='h-8 w-8 bg-zinc-800 rounded-lg items-center justify-center' />
            }
            <Text className={'text-white ml-3 font-normal'}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}