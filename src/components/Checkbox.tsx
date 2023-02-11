import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import Animated, { withSpring, withTiming, ZoomOut } from 'react-native-reanimated';
import clsx from 'clsx';

import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

interface Props extends TouchableOpacityProps {
    checked?: boolean;
    title: string;
    customKey: string;
}

export function Checkbox({ title, checked = false, customKey, ...rest }: Props) {
    const entering = (targetValues: any) => {
        'worklet';
        const animations = {
            opacity: withTiming(1, { duration: 150 }),
            transform: [
                { scale: withSpring(1, { mass: 0.2, damping: 10, stiffness: 50 }) },
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
        <TouchableOpacity
            key={customKey}
            activeOpacity={0.8}
            className='flex-row mb-2 items-center'
            {...rest}
        >
            {
                checked ?
                    <Animated.View
                        className='h-[30px] w-[30px] bg-primary-green rounded-[9px] items-center justify-center'
                        entering={entering}
                    /* exiting={ZoomOut.duration(100)} */
                    >
                        <Feather name='check' size={20} color={colors.white} />
                    </Animated.View>
                    :
                    <View className='h-[30px] w-[30px] bg-gray-300 rounded-lg items-center justify-center' />
            }
            <Text className={'text-white ml-3 flex-1 font-normal'} ellipsizeMode="tail" /* numberOfLines={1} */>
                {title}
            </Text>
        </TouchableOpacity>
    );
}