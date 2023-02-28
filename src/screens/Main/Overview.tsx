import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as NavigationBar from "expo-navigation-bar";
import React, { useCallback, useEffect, useState } from 'react';
import { SectionList, Text, View } from "react-native";
import { FlatList, ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler';

import { useColorScheme } from 'nativewind';

// Components
import Container from 'components/Container';
import Header from 'components/Header';
import StatisticsCarousel from 'components/Statistics/Carousel';

import { Empty } from 'components/StatusMessage';
import { ServiceWithSubServicesPreview } from 'components/ServicePreview';
import { TagsSelector } from 'components/TagsSelector';
import { FilterView } from './Home';

// Database
import { Q } from '@nozbe/watermelondb';
import { database } from 'database/index.native';

// Types
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

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
            const services = await servicesCollection.query(Q.where('status', Q.notEq('scheduled'))).fetch()
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
        <Container>
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
                {
                    monthsWithServices.length > 0 ? (
                        <FlatList
                            data={monthsWithServices}
                            className='w-screen'
                            contentContainerStyle={{
                            }}
                            renderItem={data => <MonthDates {...data.item} />}
                        />
                    ) : (
                        <View className='w-full flex-1 items-center justify-center pt-14 px-4'>
                            <Empty message='Nenhum serviço foi arquivado até o momento.' />
                        </View>
                    )
                }
            </GestureHandlerScrollView>
        </Container>
    )
}

const MonthDates = ({ month, dates }: MonthWithServices) => {
    const { navigate } = useNavigation();

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
                renderSectionHeader={({ section: { title, data } }) => (
                    <DateServicesList title={title} data={data} />
                )}
                renderItem={({ item, index }) => (
                    <EnhancedServiceWithSubServicesPreview
                        key={index.toString()}
                        service={item}
                        onPress={() => navigate('service', { serviceId: item.id })}
                    />
                )}
            />
        </View>
    )
}

const DateServicesList = ({ title, data }: { title: string, data: ServiceModel[] }) => {
    const date = new Date(title);
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dateMonth = date.toLocaleDateString('pt-BR', { month: 'short' });

    const [earnings, setEarnings] = React.useState<number>(0);

    async function getEarnings(servicesInDate: ServiceModel[]) {
        const subServicesEarnings = await Promise.all(servicesInDate.map(async (service: any) => {
            const subServices = await service.subServices.fetch()
            const subServicesEarnings = subServices.map((subService: SubServiceModel) => subService.price)
            return subServicesEarnings.reduce((a: number, b: number) => a + b, 0)
        }))
        const earnings = subServicesEarnings.reduce((a: number, b: number) => a + b, 0)
        setEarnings(earnings)
    }

    useEffect(() => {
        getEarnings(data)
    }, [])

    return (
        <View className='flex flex-col items-start justify-center w-full'>
            <View className='flex flex-row items-center justify-between w-full mt-4 mb-2'>
                <Text className='text-black dark:text-white font-titleRegular text-sm capitalize'>
                    {dayName.split("-")[0]}, {date.getDate()} {dateMonth} {date.getFullYear()}
                </Text>
                <View className='flex flex-row items-end'>
                    <Text className='text-text-100 font-titleSemiBold text-sm'>
                        R$ {earnings},00 ganhos
                    </Text>
                </View>
            </View>
            <View className='border-b border-text-100 w-full mb-2' />
        </View>
    )
}

const EnhancedServiceWithSubServicesPreview = ({ service, ...rest }: any) => {
    const [observedSubServices, setSubServices] = useState<SubServiceModel[]>(service);

    useEffect(() => {
        service.subServices.observe().subscribe((subServices: SubServiceModel[]) => {
            setSubServices(subServices)
        })
    }, [])

    return <ServiceWithSubServicesPreview service={service} subServices={observedSubServices} {...rest} />
}