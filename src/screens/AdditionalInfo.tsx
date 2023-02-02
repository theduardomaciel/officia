import React, { useCallback } from 'react';
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect, useRoute } from '@react-navigation/native';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import * as NavigationBar from "expo-navigation-bar";

import Header from 'components/Header';

export default function AdditionalInfo() {
    useFocusEffect(useCallback(() => {
        NavigationBar.setBackgroundColorAsync(colors.gray[300])
    }, []))

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            <View>
                <Header title='Informações Adicionais' returnButton />
            </View>
            <ScrollView contentContainerStyle={{ height: "100%" }}>

            </ScrollView>
        </View>
    )
}