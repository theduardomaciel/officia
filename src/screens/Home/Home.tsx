import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, UIManager, RefreshControl, SectionList, FlatListProps, ViewStyle } from 'react-native';
import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme } from 'nativewind/dist/use-color-scheme';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';

import colors from 'global/colors';
import { MaterialIcons } from "@expo/vector-icons";

import Header from 'components/Header';
import EmptyMessage from 'components/EmptyMessage';
import { Tag, TagsSelector } from 'components/TagsSelector';
import Calendar, { WeekView, WeekDays } from 'components/Calendar';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { tags } from 'global/tags';

import { database } from 'database/index.native';
import { ServiceModel } from 'database/models/serviceModel';

import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables'

import Toast from 'components/Toast';
import Loading from 'components/Loading';
import ServicePreview from 'components/ServicePreview';

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
            console.log(error, "erro")
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
        NavigationBar.setPositionAsync("absolute")
        NavigationBar.setBackgroundColorAsync("transparent")
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
                        <WeekView /* weekDaysTypes={} */ navigate={navigate} />
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
                                title !== 'blank' ? <Title>
                                    {title}
                                </Title> : <></>
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
                toastOffset={"0%"}
            />
        </View>
    );
}

const enhance = withObservables(['service'], ({ service }) => ({
    service,
    subServices: service.subServices,  // "Shortcut syntax" for `service.subServices.observe()`
}))

const EnhancedServicePreview = enhance(ServicePreview)

const Title = ({ children }: { children: React.ReactNode }) => (
    <Text className='text-xl font-titleBold text-white mb-2'>
        {children}
    </Text>
)