import React, { useCallback, useEffect, useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Calendar, { WeekDays, WeekView } from 'components/Calendar';
import EmptyMessage from 'components/EmptyMessage';
import Header from 'components/Header';
import Loading from 'components/Loading';
import ServicePreview from 'components/ServicePreview';
import { Tag, TagsSelector } from 'components/TagsSelector';
import Toast from 'components/Toast';

// Utils
import { tags } from 'global/tags';

// Database
import { Q } from '@nozbe/watermelondb';
import { database } from 'database/index.native';

// Types
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

export const FilterView = ({ colorScheme }: { colorScheme: string }) => (
    <View className='bg-black dark:bg-gray-200 flex-row items-center  h-full mr-3 px-3 rounded-full'>
        <MaterialIcons name='filter-alt' color={colorScheme === "dark" ? colors.text[100] : colors.white} size={20} />
        <Text className='text-white dark:text-text-100 font-semibold text-sm ml-2'>
            Filtros
        </Text>
    </View>
)

export const isToday = (date: Date) => {
    const today = new Date()
    return (date.getDate() === today.getDate() /* || date.getDate() === today.getDate() + 1 */) ? true : false
}

function getWeekServices(services: ServiceModel[], week: Date) {
    const weekServices = services.filter(service => {
        const serviceDate = new Date(service.date)
        return serviceDate.getDate() >= week.getDate() && serviceDate.getDate() <= week.getDate() + 6 && !isToday(serviceDate);
    })
    return weekServices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).reverse()
}

function getMonthServices(services: ServiceModel[], month: Date, excludeElements: Array<ServiceModel> = []) {
    const monthServices = services.filter(service => {
        const serviceDate = new Date(service.date)
        return serviceDate.getMonth() === month.getMonth() && serviceDate.getFullYear() === month.getFullYear() && !excludeElements.includes(service) && !isToday(serviceDate);
    })
    return monthServices
}

export default function Home({ route }: any) {
    const { navigate } = useNavigation()
    const { colorScheme } = useColorScheme();

    const showCreatedServiceToast = useCallback(() => {
        Toast.show({
            preset: "success",
            title: "Serviço criado com sucesso!",
            message: "Agora você pode acessar o orçamento do serviço agendado.",
        })
    }, [])

    const showDeleteServiceToast = useCallback(() => {
        Toast.show({
            preset: "success",
            title: "Serviço excluído com sucesso!",
            message: "Agora não será mais possível acessá-lo.",
        })
    }, [])

    const [pendingServices, setPendingServices] = useState<ServiceModel[] | undefined>(undefined)
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)

    const currentDate = new Date();
    async function fetchData() {
        setPendingServices(undefined)
        try {
            const services = await database
                .get<ServiceModel>('services')
                .query(Q.where('status', "scheduled"))
                .fetch()

            setPendingServices(services)
        } catch (error) {
            console.log(error)
            setPendingServices([])
        }
    }

    useFocusEffect(useCallback(() => {
        if (pendingServices === undefined || pendingServices.length === 0) {
            fetchData()
        }
        if (route.params?.service === "created") {
            showCreatedServiceToast()
        } else if (route.params?.service === "deleted") {
            showDeleteServiceToast
        }
    }, []))

    const isolatedServices = pendingServices?.filter(service => isToday(service.date)).reverse() ?? []
    const weekServices = getWeekServices(pendingServices || [], currentDate);
    const monthServices = getMonthServices(pendingServices || [], currentDate, weekServices)
    const otherServices = pendingServices?.filter(service => !isolatedServices.includes(service) && !weekServices.includes(service) && !monthServices.includes(service)) ?? []

    const DATA = [
        ...isolatedServices.length > 0 ? [{
            title: 'blank',
            data: isolatedServices,
        }] : [],
        ...weekServices.length > 0 ? [{
            title: 'Esta semana',
            data: weekServices,
        }] : [],
        ...monthServices.length > 0 ? [{
            title: 'Este mês',
            data: monthServices,
        }] : [],
        ...otherServices.length > 0 ? [{
            title: 'Próximos',
            data: otherServices,
        }] : [],
    ]

    function handleTagSelection(data: Tag[]) {
        /* console.log(data) */
    }

    const weekDayStatusArray = new Array(7).fill(null).map((_, index) => {
        const servicesCountOnDay = weekServices.filter(service => new Date(service.date).getDay() === index).length;
        if (servicesCountOnDay === 1) {
            return "contains"
        } else if (servicesCountOnDay > 1) {
            return "busy"
        } else {
            return undefined
        }
    })

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5 relative'>
            <View>
                <Header title='Agendado'>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        className='flex flex-row items-center justify-center px-3 py-1 bg-gray_light-neutral bg-black dark:bg-gray-200 rounded-full'
                        onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
                    >
                        <MaterialIcons
                            name="expand-more"
                            size={16}
                            className={"m-0"}
                            color={colorScheme === "dark" ? colors.text[100] : colors.white}
                            style={{
                                transform: [
                                    { rotate: isCalendarExpanded ? '180deg' : '0deg' }
                                ],
                            }}
                        />
                        <Text className='text-sm ml-1 text-white dark:text-text-100'>
                            {isCalendarExpanded ? 'Minimizar' : 'Expandir'}
                        </Text>
                    </TouchableOpacity>
                </Header>
            </View>
            {
                isCalendarExpanded && (
                    <Animated.View entering={FadeInUp.duration(235)} exiting={FadeOutUp.duration(150)} className='flex-col items-center justify-center w-full'>
                        <Calendar />
                    </Animated.View>
                )
            }
            {
                !isCalendarExpanded && (
                    <Animated.View entering={FadeInUp.duration(235)} exiting={FadeOutUp} className='flex-col items-center justify-start w-full'>
                        <WeekDays />
                        <WeekView
                            weekDayStatusArray={weekDayStatusArray}
                            navigate={navigate}
                        />
                    </Animated.View>
                )
            }
            <Animated.View className='flex-row items-start w-full' layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}>
                <FilterView colorScheme={colorScheme} />
                <TagsSelector
                    tags={tags}
                    onSelectTags={handleTagSelection}
                />
            </Animated.View>
            <Animated.View
                layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
                className='flex-1 pb-3'
            >
                {
                    pendingServices && pendingServices.length === 0 ? (
                        <Animated.View className='flex-1 items-center pt-24'>
                            <EmptyMessage />
                        </Animated.View>
                    ) : pendingServices && pendingServices.length > 0 ? (
                        <SectionList
                            sections={DATA}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ flex: 1 }}
                            renderSectionHeader={({ section: { title } }) => (
                                title !== 'blank' ? (
                                    <Text className='text-xl font-titleBold text-white mb-2'>
                                        {title}
                                    </Text>
                                ) : <></>
                            )}
                            renderItem={({ item, section }) => <EnhancedServicePreview
                                key={item.id}
                                onPress={() => navigate("service", { serviceId: item.id })}
                                service={item}
                                additionalInfo={section.title === "Esta semana" || section.title === "blank" ? "day" : "date"}
                            />
                            }
                        />
                    ) : <Animated.View className='flex-1'>
                        <Loading message='Aguarde enquanto os serviços agendados são carregados...' />
                    </Animated.View>
                }
            </Animated.View>
            <Toast
                toastPosition="top"
                toastOffset={"85%"}
            />
        </View>
    );
}

export const EnhancedServicePreview = ({ service, ...rest }: any) => {
    const [observedSubServices, setSubServices] = useState<SubServiceModel[] | undefined>(undefined);

    useEffect(() => {
        service.subServices.observe().subscribe((subServices: SubServiceModel[]) => {
            setSubServices(subServices)
        })
    }, [])

    return <ServicePreview service={service} subServices={observedSubServices} {...rest} />
}