import Header from 'components/Header';
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as NavigationBar from "expo-navigation-bar";

import { Feather, MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Input from 'components/Input';
import { useColorScheme } from 'nativewind';

const NavigationButton = ({ title, onPress, colorScheme }: { title: string, onPress: () => void, colorScheme: "dark" | "light" }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPress}
            className='w-full flex-row items-center justify-between'
        >
            <Text className='font-semibold text-sm text-black dark:text-text-100'>
                {title}
            </Text>
            <MaterialIcons name='chevron-right' size={18} color={colorScheme === "dark" ? colors.text[100] : colors.black} />
        </TouchableOpacity>
    )
}

export default function Business() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { navigate } = useNavigation();

    useFocusEffect(useCallback(() => {
        NavigationBar.setPositionAsync("absolute")
        NavigationBar.setBackgroundColorAsync('#ffffff00')
    }, []))

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            <View>
                <Header title='Meu Negócio'>
                    {
                        colorScheme === 'dark' ?
                            <Feather name='moon' size={24} color={colors.text[100]} onPress={toggleColorScheme} />
                            :
                            <Feather name='sun' size={24} color={colors.black} onPress={toggleColorScheme} />
                    }
                </Header>
            </View>
            <TouchableOpacity
                activeOpacity={0.8}
                className='w-full flex-col items-center justify-center px-12 py-14 gap-y-1 border rounded-lg border-dashed border-primary-green'
            >
                <MaterialIcons name='add-photo-alternate' size={32} color={colorScheme === "dark" ? colors.white : colors.black} />
                <Text className='font-medium text-sm text-black dark:text-white'>
                    Adicionar logotipo da empresa
                </Text>
            </TouchableOpacity>
            <View>
                <Input label='Nome da Empresa' />
            </View>
            <View>
                <NavigationButton title='Dados Bancários' onPress={() => navigate("bankAccount")} colorScheme={colorScheme} />
            </View>
            <View>
                <NavigationButton title='Informações Adicionais' onPress={() => navigate("additionalInfo")} colorScheme={colorScheme} />
            </View>
            <View>
                <Input label='CNPJ' />
            </View>
            <View>
                <Input label='Razão Social' />
            </View>
            <View>
                <NavigationButton title='Telefone e Endereço' onPress={() => navigate("phoneAndAddress")} colorScheme={colorScheme} />
            </View>
            <View>
                <NavigationButton title='Redes Sociais' onPress={() => navigate("socialMedia")} colorScheme={colorScheme} />
            </View>
        </View>
    )
}