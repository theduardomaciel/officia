import { memo } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import Animated, { withSpring, withTiming, ZoomOut } from 'react-native-reanimated';

import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

interface Props extends TouchableOpacityProps {
    checked?: boolean;
    inverted?: boolean;
    title: string;
    customKey: string;
}

export function Checkbox({ title, checked = false, inverted, customKey, ...rest }: Props) {
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
            style={{
                flexDirection: inverted ? 'row-reverse' : 'row',
            }}
            {...rest}
        >
            {
                checked ?
                    <Animated.View
                        className='h-[30px] w-[30px] bg-primary-green rounded-[9px] items-center justify-center'
                    /* entering={entering} */
                    /* exiting={ZoomOut.duration(100)} */
                    >
                        <Feather name='check' size={20} color={colors.white} />
                    </Animated.View>
                    :
                    <View className='h-[30px] w-[30px] bg-gray-300 rounded-lg items-center justify-center' />
            }
            <Text
                className={'text-white flex-1 font-normal'}
                ellipsizeMode="tail"
                style={{
                    marginLeft: inverted ? 0 : 10,
                    marginRight: inverted ? 10 : 0,
                }}
            /* numberOfLines={1} */
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

interface GroupProps {
    data: string[];
    checked: string[];
    dispatch: (action: { type: "add" | "remove", payload: string }) => void;
}

export const CheckboxesGroup = memo(({ data, checked, dispatch }: GroupProps, ref) => {
    return (
        <View className='flex-row flex-wrap items-center justify-between'>
            {
                data.map((tag, index) => (
                    <View key={index} className='w-1/2'>
                        <Checkbox
                            customKey={`${tag}-${index}`}
                            title={tag}
                            checked={checked.includes(tag)}
                            onPress={() => {
                                if (checked.includes(tag)) {
                                    /* setChecked(checked.filter(item => item !== tag)) */
                                    /* updateTags(tag, "remove") */
                                    dispatch({ type: "remove", payload: tag });
                                } else {
                                    /* setChecked([...checked, tag]) */
                                    /* updateTags(tag, "add") */
                                    dispatch({ type: "add", payload: tag });
                                }
                            }}
                        />
                    </View>
                ))
            }
        </View>
    )
});