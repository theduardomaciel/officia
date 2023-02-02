import Header from 'components/Header';
import { TagsSelector } from 'components/TagsSelector';
import React, { useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme } from 'nativewind';

import { FlatList, ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import StatisticsCarousel from 'components/StatisticsCarousel';
import { FilterView } from './Home';
import type { Service } from 'utils/data';

interface DateOfServices {
    title: Date | string;
    data: Service[];
}

const DATA = [
    {
        month: 'Janeiro',
        dates: [
            {
                title: '2023-01-12T00:00:00.000Z',
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
                ]
            },
            {
                title: '2023-01-18T00:00:00.000Z',
                data: [
                    {
                        date: '2023-01-18T00:00:00.000Z',
                        type: 'Elétrico',
                        description: 'Troca de alguma coisa de descarga elétrica',
                        value: 100,
                        quantity: 3,
                        client: {
                            name: 'João da Silva',
                            phone: '(11) 99999-9999',
                            address: 'Rua das Flores, 123',
                        },
                    },
                    {
                        date: '2023-01-18T00:00:00.000Z',
                        type: 'Elétrico',
                        description: 'Troca de lâmpada em banheiro',
                        value: 75,
                        quantity: 4,
                        client: {
                            name: 'Ana Clara',
                            phone: '(11) 99999-9999',
                            address: 'Moreira Castro, 123103291229323 - Tabuleiro, Maceió - AL',
                        },
                    }
                ]
            },
        ],
    },
    {
        month: 'Fevereiro',
        dates: [
            {
                title: '2023-01-12T00:00:00.000Z',
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
                ]
            },
            {
                title: '2023-01-18T00:00:00.000Z',
                data: [
                    {
                        date: '2023-01-18T00:00:00.000Z',
                        type: 'Elétrico',
                        description: 'Troca de alguma coisa de descarga elétrica',
                        value: 100,
                        quantity: 3,
                        client: {
                            name: 'João da Silva',
                            phone: '(11) 99999-9999',
                            address: 'Rua das Flores, 123',
                        },
                    },
                    {
                        date: '2023-01-18T00:00:00.000Z',
                        type: 'Elétrico',
                        description: 'Troca de lâmpada em banheiro',
                        value: 75,
                        quantity: 4,
                        client: {
                            name: 'Ana Clara',
                            phone: '(11) 99999-9999',
                            address: 'Moreira Castro, 123103291229323 - Tabuleiro, Maceió - AL',
                        },
                    },
                    {
                        date: '2023-01-18T00:00:00.000Z',
                        type: 'Elétrico',
                        description: 'Troca de alguma coisa de descarga elétrica',
                        value: 100,
                        quantity: 3,
                        client: {
                            name: 'João da Silva',
                            phone: '(11) 99999-9999',
                            address: 'Rua das Flores, 123',
                        },
                    },
                ]
            },
        ],
    },
];

export default function Overview() {
    const { colorScheme } = useColorScheme();
    const [canScrollVertically, setCanScrollVertically] = React.useState<boolean>(true);

    useFocusEffect(useCallback(() => {
        NavigationBar.setPositionAsync("absolute")
        NavigationBar.setBackgroundColorAsync('#ffffff00')
    }, []))

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-1'>
            <Header title='Visão Geral' />
            <GestureHandlerScrollView
                nestedScrollEnabled // Allows scrolling inside the ScrollView
                directionalLockEnabled // Prevents scrolling horizontally
                className='flex flex-col w-screen self-center gap-y-5'
                contentContainerStyle={{ alignItems: "flex-start", justifyContent: "center" }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={canScrollVertically}
                disallowInterruption
            /* style={{
                backgroundColor: canScrollVertically ? "green" : "red"
            }} */
            >
                <View className='flex flex-row items-start w-full px-6'>
                    <FilterView colorScheme={colorScheme} />
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
                <StatisticsCarousel setCanScrollVertically={setCanScrollVertically} />
                <FlatList
                    data={DATA}
                    className='w-screen'
                    contentContainerStyle={{
                    }}
                    renderItem={data => <MonthDates {...data.item} />}
                />
            </GestureHandlerScrollView>
        </View>
    )
}

const MonthDates = ({ month, dates }: { month: string, dates: DateOfServices[] }) => {
    return (
        <View className='flex flex-col w-full px-6'>
            <View className='flex flex-row items-center justify-between w-full mt-4 mb-2'>
                <Text className='text-black dark:text-white font-titleBold text-2xl'>
                    {month}
                </Text>
                <View className='flex flex-row items-end'>
                    <Text className='text-text-100 font-titleSemiBold text-sm'>
                        {dates.length} serviços
                    </Text>
                </View>
            </View>
            <SectionList
                sections={dates}
                stickySectionHeadersEnabled
                renderSectionHeader={({ section: { title } }) => {
                    const date = new Date(title as string);
                    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
                    const dateMonth = date.toLocaleDateString('pt-BR', { month: 'short' });

                    return (
                        <View className='flex flex-col items-start justify-center w-full'>
                            <View className='flex flex-row items-center justify-between w-full mt-4 mb-2'>
                                <Text className='text-black dark:text-white font-titleRegular text-sm capitalize'>
                                    {dayName.split("-")[0]}, {date.getDate()} {dateMonth} {date.getFullYear()}
                                </Text>
                                <View className='flex flex-row items-end'>
                                    <Text className='text-text-100 font-titleSemiBold text-sm'>
                                        R$ 175,00 ganhos
                                    </Text>
                                </View>
                            </View>
                            <View className='border-b border-text-100 w-full mb-2' />
                        </View>
                    )
                }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        key={index}
                        className='w-full flex flex-row items-center justify-between mb-2 py-2'
                        onPress={() => console.log("teste")}
                        accessible
                        activeOpacity={0.75}
                        accessibilityRole="button"
                    >
                        <View className='flex items-center justify-center w-9 mr-2'>
                            <MaterialIcons name={item.type === "Elétrico" ? "bolt" : "plumbing"} size={36} color={colors.text[100]} />
                        </View>
                        <View className='h-full max-h-8 opacity-60 border-[0.5px] border-dashed border-text-100 mr-4' />
                        <View className='flex-col items-start justify-start flex flex-1 mr-4'>
                            <Text className='font-titleSemiBold text-base text-black dark:text-white'>
                                {item.description}
                            </Text>
                            <Text className='mt-1 font-semibold text-black dark:text-white'>
                                {item.client.name} <Text className='leading-tight font-regular text-xs text-bg-100'>em {item.client.address}</Text>
                            </Text>
                        </View>
                        <View className='relative w-12 flex items-center justify-center'>
                            <Text className='absolute font-black text-[42px] opacity-20 flex-nowrap whitespace-nowrap text-text_light-100 dark:text-white'>
                                R$
                            </Text>
                            <Text className='font-black text-2xl text-black dark:text-white'>
                                110
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}