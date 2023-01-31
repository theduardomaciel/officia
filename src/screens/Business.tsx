import Header from 'components/Header';
import React, { useState } from 'react';
import { View } from "react-native";

export default function Business() {

    return (
        <View className='flex-1 min-h-full bg-bg-300 px-6 pt-12 gap-y-5'>
            <Header title='Meu Negócio' />

        </View>
    )
}