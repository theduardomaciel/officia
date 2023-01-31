import Header from 'components/Header';
import { TagsSelector } from 'components/TagsSelector';
import React, { useState } from 'react';
import { View, Text, SectionList, ScrollView } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import StatisticsCarousel from 'components/StatisticsCarousel';

const DATA = [
    {
        title: 'Janeiro',
        data: [
            {
                date: '2023-01-12T00:00:00.000Z',
                type: 'Hidráulico',
                description: 'Troca de válvula de descarga',
                value: 100,
                quantity: 3,
                client: {
                    name: 'João da Silva',
                    phone: '(11) 99999-9999',
                    address: 'Rua das Flores, 123',
                },
            },
            {
                date: '2023-01-12T00:00:00.000Z',
                type: 'Elétrico',
                description: 'Troca de lâmpada em sala de estar',
                value: 75,
                quantity: 1,
                client: {
                    name: 'Ana Luísa',
                    phone: '(11) 99999-9999',
                    address: 'Moreira Soares, 12 - Antares, Maceió - AL',
                },
            }
        ],
    },
    {
        title: 'Fevereiro',
        data: [
            {
                date: '2023-01-12T00:00:00.000Z',
                type: 'Elétrico',
                description: "Instalação de chuveiro elétrico",
                value: 150,
                quantity: 1,
                client: {
                    name: 'João da Silva',
                    phone: '(11) 99999-9999',
                    address: 'Rua das Flores, 123',
                },
            },
            {
                date: '2023-01-12T00:00:00.000Z',
                type: 'Hidráulico',
                description: "Troca de cano de pia da cozinha",
                value: 100,
                quantity: 1,
                client: {
                    name: 'Ana Luísa',
                    phone: '(11) 99999-9999',
                    address: 'Moreira Soares, 12 - Antares, Maceió - AL',
                },
            },
            {
                date: '2023-01-12T00:00:00.000Z',
                type: 'Elétrico',
                description: "Troca de interruptor de luz",
                value: 50,
                quantity: 1,
                client: {
                    name: 'João da Silva',
                    phone: '(11) 99999-9999',
                    address: 'Rua das Flores, 123',
                },
            },
        ]
    }
];

export default function Overview() {
    const [canScrollVertically, setCanScrollVertically] = React.useState<boolean>(true);

    return (
        <View className='flex-1 min-h-full bg-bg-300 px-6 pt-12 gap-y-5'>
            <Header title='Visão Geral' />
            <View className='flex flex-row items-start w-full'>
                <View className='bg-bg-200 flex-row items-center  h-full mr-3 px-3 rounded-full'>
                    <MaterialIcons name='filter-alt' color={colors.text[100]} size={20} />
                    <Text className='text-text-100 font-semibold text-sm ml-2'>
                        Filtros
                    </Text>
                </View>
                <View className='w-full pr-10'>
                    <TagsSelector
                        tags={[
                            { title: 'Datas' },
                            { title: 'Tipos' },
                        ]}
                        hasClearButton
                        insertPaddingRight
                        onSelectTags={() => { }}
                    />
                </View>
            </View>
            <ScrollView
                directionalLockEnabled // Prevents scrolling horizontally
                className='flex flex-col w-screen self-center'
                contentContainerStyle={{ alignItems: "flex-start", justifyContent: "center" }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={canScrollVertically}
                style={{
                    backgroundColor: canScrollVertically ? "green" : "red"
                }}
            >
                <StatisticsCarousel setCanScrollVertically={setCanScrollVertically} />
                <SectionList
                    sections={DATA}
                    contentContainerStyle={{
                        height: '100%',
                    }}
                    renderItem={({ item, index }) => (
                        <View key={index} className='bg-bg-200 rounded-lg p-4'>
                            <Text className='text-text-100 font-semibold text-sm'>
                                {item.type}
                            </Text>
                            <Text className='text-text-100 text-sm'>
                                {item.description}
                            </Text>
                            <Text className='text-text-100 text-sm'>
                                {item.client.name}
                            </Text>
                            <Text className='text-text-100 text-sm'>
                                {item.client.address}
                            </Text>
                        </View>
                    )}
                />
            </ScrollView>
        </View>
    )
}