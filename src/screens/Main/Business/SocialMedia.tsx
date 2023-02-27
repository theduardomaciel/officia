import React from 'react';
import { View, Text, ScrollView } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Header from 'components/Header';

export default function SocialMedia() {
    return (
        <View className='flex-1 min-h-full px-6 pt-12' style={{ rowGap: 20 }}>
            <Header title='Redes Sociais' returnButton />
            <ScrollView className='flex-1' contentContainerStyle={{ rowGap: 15 }}>

            </ScrollView>
        </View>
    )
}