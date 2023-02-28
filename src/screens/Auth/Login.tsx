import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from "react-native";

// Visuals
import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Logo from "src/assets/icons/logo.svg";

// Components
import Input from 'components/Input';

// Animations
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUOTES = [
    {
        title: "Simplicidade.",
        description: "Estamos aqui para unir tudo que o seu negócio precisa em um só lugar."
    }
]

const validateEmail = (email: string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

export default function Login({ navigation }: any) {
    const inserts = useSafeAreaInsets();
    const RANDOM_QUOTE_INDEX = Math.floor(Math.random() * QUOTES.length)

    const viewPosition = useSharedValue(0);
    const viewAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withSpring(viewPosition.value, { damping: 10, stiffness: 100 })
                }
            ]
        }
    })

    const inputRef = React.useRef("");

    const [isInvalid, setIsInvalid] = React.useState(false);
    const handleLogin = useCallback(() => {
        const validateEmailResult = validateEmail(inputRef.current);
        if (validateEmailResult) {
            setIsInvalid(false)
            navigation.navigate("register", { email: inputRef.current })
        } else {
            setIsInvalid(true)
        }
    }, [])

    return (
        <View className='flex-1 min-h-full px-6 items-center justify-center'>
            <Animated.View
                className='flex flex-col items-center justify-center w-full'
                style={viewAnimatedStyle}
            >
                <Logo />
                <View className='flex-col items-center justify-center w-3/4 mt-32 mb-12'>
                    <Text className='font-logoRegular text-4xl text-center dark:text-white mb-4'>
                        {QUOTES[RANDOM_QUOTE_INDEX].title}
                    </Text>
                    <Text className='font-semibold text-center leading-5 dark:text-white'>
                        {QUOTES[RANDOM_QUOTE_INDEX].description}
                    </Text>
                </View>
                <View className='flex flex-col items-center justify-center w-full'>
                    <View className='w-full'>
                        <Input
                            autoCapitalize='none'
                            keyboardType='email-address'
                            placeholder='Comece inserindo o e-mail do seu negócio'
                            onChangeText={(text: string) => inputRef.current = text}
                        />
                    </View>
                    <TouchableOpacity
                        className='rounded w-full py-4 items-center justify-center bg-gray-200 mt-4'
                        activeOpacity={0.8}
                        onPress={handleLogin}
                    >
                        <Text className='text-center font-semibold text-white'>
                            Continuar
                        </Text>
                    </TouchableOpacity>
                    {
                        isInvalid && (
                            <Text className='absolute -bottom-8 left-0 w-full text-center text-primary-red'>
                                O e-mail inserido é inválido.
                            </Text>
                        )
                    }
                </View>
            </Animated.View>
            <View
                className='flex-col bg-transparent w-screen absolute bottom-0-0 left-0 items-center justify-center'
                style={{
                    bottom: inserts.bottom ? inserts.bottom + 25 : 25,
                    left: 0,

                }}
            >
                <View className='border-t border-dashed border-t-gray-100 w-24 mb-2 h-1' />
                <Text className='w-full text-center text-xs text-gray-100'>
                    officia v0.1.1.early-access
                </Text>
            </View>
        </View>
    )
}