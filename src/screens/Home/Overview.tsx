import Header from 'components/Header';
import { TagsSelector } from 'components/TagsSelector';
import React, { useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme } from 'nativewind';

import { FlatList, ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler'
import { useFocusEffect } from '@react-navigation/native';

import StatisticsCarousel from 'components/StatisticsCarousel';
import { FilterView } from './Home';

// DB
import type { ServiceModel } from 'database/models/serviceModel';
import { ServiceWithSubServicesPreview } from 'components/ServicePreview';
import { database } from 'database/index.native';
import withObservables from '@nozbe/with-observables';

interface MonthWithServices {
    month: string;
    dates: DateWithServices[];
}

interface DateWithServices {
    title: string,
    data: ServiceModel[];
}

const monthsNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function Overview() {
    const { colorScheme } = useColorScheme();
    const [canScrollVertically, setCanScrollVertically] = React.useState<boolean>(true);
    const [services, setServices] = React.useState<ServiceModel[] | undefined>(undefined);

    async function fetchData() {
        setServices(undefined)
        try {
            const servicesCollection = database.get<ServiceModel>('services')
            const services = await servicesCollection.query().fetch()
            setServices(services)
        } catch (error) {
            console.log(error, "erro")
            setServices([])
        }
    }

    useFocusEffect(useCallback(() => {
        if (services === undefined) {
            fetchData()
        }
        NavigationBar.setPositionAsync("absolute")
        NavigationBar.setBackgroundColorAsync("transparent")
    }, []))

    const monthsWithServices = React.useMemo(() => {
        const monthsWithServices: MonthWithServices[] = [];
        const months = services?.map(service => new Date(service.date).getMonth()) ?? [];
        const uniqueMonths = [...new Set(months)];
        uniqueMonths.forEach(month => {
            const servicesInMonth = services?.filter(service => new Date(service.date).getMonth() === month) ?? [];
            const dates = servicesInMonth.map(service => new Date(service.date).toISOString().split('T')[0]);
            const uniqueDates = [...new Set(dates)];
            const datesWithServices: DateWithServices[] = [];
            uniqueDates.forEach(date => {
                const servicesInDate = servicesInMonth.filter(service => new Date(service.date).toISOString().split('T')[0] === date);
                datesWithServices.push({
                    title: date,
                    data: servicesInDate,
                });
            });
            monthsWithServices.push({
                month: monthsNames[month],
                dates: datesWithServices,
            });
        });
        return monthsWithServices;
    }, [services]);

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
                                { title: 'Datas', value: "dates" },
                                { title: 'Tipos', value: "types" },
                            ]}
                            hasClearButton
                            insertPaddingRight
                            onSelectTags={() => { }}
                        />
                    </View>
                </View>
                <StatisticsCarousel setCanScrollVertically={setCanScrollVertically} />
                <FlatList
                    data={monthsWithServices}
                    className='w-screen'
                    contentContainerStyle={{
                    }}
                    renderItem={data => <MonthDates {...data.item} />}
                />
            </GestureHandlerScrollView>
        </View>
    )
}

const MonthDates = ({ month, dates }: MonthWithServices) => {
    return (
        <View className='flex flex-col w-full px-6'>
            <View className='flex flex-row items-center justify-between w-full mt-4 mb-2'>
                <Text className='text-black dark:text-white font-titleBold text-2xl'>
                    {month}
                </Text>
                <View className='flex flex-row items-end'>
                    {
                        dates.length > 2 && (
                            <Text className='text-text-100 font-titleSemiBold text-sm'>
                                {dates.length} serviços
                            </Text>
                        )
                    }
                </View>
            </View>
            <SectionList
                sections={dates}
                stickySectionHeadersEnabled
                renderSectionHeader={({ section: { title } }) => {
                    const date = new Date(title);
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
                                        R$ x,00 ganhos
                                    </Text>
                                </View>
                            </View>
                            <View className='border-b border-text-100 w-full mb-2' />
                        </View>
                    )
                }}
                renderItem={({ item, index }) => (
                    <EnhancedServicePreview
                        key={index.toString()}
                        service={item}
                        onPress={() => { }}
                    />
                )}
            />
        </View>
    )
}

const enhance = withObservables(['service'], ({ service }) => ({
    service,
    subServices: service.subServices, // "Shortcut syntax" for `service.subServices.observe()`
}))

const EnhancedServicePreview = enhance(ServiceWithSubServicesPreview)