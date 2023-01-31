import React, { useCallback } from 'react';
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect, useRoute } from '@react-navigation/native';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import * as NavigationBar from "expo-navigation-bar";

import Header from 'components/Header';
import EmptyMessage from 'components/EmptyMessage';

export default function DayAgenda() {
    const route = useRoute();
    const { dateString } = route.params as { dateString: string };

    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    useFocusEffect(useCallback(() => {
        //fetchData()
        NavigationBar.setBackgroundColorAsync(colors.bg[300])
    }, []))

    return (
        <View className='flex-1 min-h-full bg-bg-300 px-6 pt-12 gap-y-5'>
            <View>
                <Header title='Serviços agendados' hasBackButton />
            </View>
            <View className='flex-row gap-x-2 items-center justify-start'>
                <MaterialIcons name='calendar-today' size={18} color={colors.text[100]} />
                <Text className='text-sm text-text-100'>{dateFormatted}</Text>
            </View>
            <ScrollView contentContainerStyle={{ height: "100%" }}>
                <View className='flex-1 flex-col items-center justify-start'>
                    <EmptyMessage style={{ paddingTop: 100 }} />
                </View>
            </ScrollView>
        </View>
    )
}