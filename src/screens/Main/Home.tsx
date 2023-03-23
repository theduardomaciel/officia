import React, { useCallback, useEffect, useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container from 'components/Container';
import Header, { TabBarScreenHeader } from 'components/Header';
import Toast from 'components/Toast';
import ServicePreview, { ServicePreviewProps } from 'components/ServicePreview';

import Calendar, { WeekDays, WeekView } from 'components/Calendar';
import { Empty, Loading } from 'components/StatusMessage';
import { Tag, TagObject, TagsSelector } from 'components/TagsSelector';

// Database
import { Q } from '@nozbe/watermelondb';
import { database } from 'database/index.native';

// Types
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';
import type { BusinessData, Category } from 'screens/Main/Business/@types';

export const FilterView = ({ colorScheme }: { colorScheme: string }) => (
    <View className='bg-black dark:bg-gray-200 flex-row items-center h-full mr-3 px-3 py-[7.5px] rounded-full'>
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

const hasTags = (tags: Array<TagObject>, subServices: SubServiceModel[]) => {
    const serviceTypes = subServices?.map(subService => subService.types).flat().map(type => type.name);
    //return tags.every(tag => serviceTypes.includes(tag.name))
    return tags.some(tag => serviceTypes.includes(tag.name))
}

function getWeekServices(services: ServiceModel[], date: Date) {
    const weekServices = services.filter(service => {
        const serviceDate = new Date(service.date)
        return serviceDate.getDate() > date.getDate() && (serviceDate.getDate() <= date.getDate() + 5) && !isToday(serviceDate);
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

const daysOnMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
}

export default function Home({ route, navigation }: any) {
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
    const [businessData, setBusinessData] = useState<BusinessData | undefined>(undefined)
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)

    const currentDate = new Date();
    async function fetchData() {
        setPendingServices(undefined)
        try {
            await database
                .get<ServiceModel>('services')
                .query(Q.where('status', "scheduled"))
                .observe().subscribe(services => {
                    setPendingServices(services.filter(service => service.date.getTime() >= currentDate.getTime()))
                })

            const businessData = await database.localStorage.get('businessData') as BusinessData;
            if (businessData) {
                setBusinessData(businessData)
            }
        } catch (error) {
            //console.log(error)
            setPendingServices([])
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (route?.params?.service === "created") {
                showCreatedServiceToast()
                navigation.setParams({ service: undefined })
            } else if (route?.params?.service === "deleted") {
                showDeleteServiceToast();
                navigation.setParams({ service: undefined })
            }
        }, [route.params])
    )

    useEffect(() => {
        fetchData()
    }, [])

    const [currentFilteredTags, setCurrentFilteredTags] = useState<TagObject[]>([])

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

    function handleTagSelection(data: TagObject[]) {
        setCurrentFilteredTags(data)
    }

    const statusArray = new Array(12).fill(null).map((_, month) => {
        if (month >= currentDate.getMonth()) {
            return new Array(daysOnMonth(month, currentDate.getFullYear())).fill(null).map((_, index) => {
                if (pendingServices) {
                    const firstDayOfMonth = new Date(currentDate.getFullYear(), month, 1).getDay();
                    const servicesCountOnDay = pendingServices.filter(service => {
                        const serviceDate = new Date(service.date)
                        return serviceDate.getDate() + (firstDayOfMonth - 1) === index && serviceDate.getMonth() === month
                    }).length;
                    if (servicesCountOnDay === 1) {
                        return "contains"
                    } else if (servicesCountOnDay > 1) {
                        return "busy"
                    } else {
                        return undefined
                    }
                }
            })
        } else return []
    })

    return (
        <Container>
            <TabBarScreenHeader navigation={navigation} businessData={businessData}>
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
            </TabBarScreenHeader>
            {
                isCalendarExpanded && (
                    <Animated.View entering={FadeInUp.duration(235)} exiting={FadeOutUp.duration(150)} className='flex-col items-center justify-center w-full'>
                        <Calendar statusArray={statusArray} />
                    </Animated.View>
                )
            }
            {
                !isCalendarExpanded && (
                    <Animated.View entering={FadeInUp.duration(235)} exiting={FadeOutUp} className='flex-col items-center justify-start w-full'>
                        <WeekDays />
                        <WeekView
                            statusArray={statusArray[currentDate.getMonth()].splice(0, 7)}
                            navigate={navigate}
                        />
                    </Animated.View>
                )
            }
            <Animated.View className='flex flex-row items-start w-full pr-6' layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}>
                <FilterView colorScheme={colorScheme} />
                <View className='w-full pr-10'>
                    <TagsSelector
                        tags={businessData?.categories ?? []}
                        onSelectTags={handleTagSelection}
                    />
                </View>
            </Animated.View>
            <Animated.View
                layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
                className='flex-1 pb-3'
            >
                {
                    pendingServices !== undefined ? (
                        <SectionList
                            sections={DATA}
                            keyExtractor={(item, index) => index.toString()}
                            style={{ flex: 1 }}
                            ListEmptyComponent={<Animated.View className='flex-1 items-center pt-24'>
                                <Empty />
                            </Animated.View>}
                            showsVerticalScrollIndicator={false}
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
                                filterTags={currentFilteredTags}
                            />
                            }
                        />
                    ) : <Animated.View className='flex-1'>
                        <Loading />
                    </Animated.View>
                }
            </Animated.View>
            <Toast
                toastPosition="top"
                toastOffset={"15%"}
            />
        </Container>
    );
}

export const EnhancedServicePreview = ({ service, filterTags, ...rest }: any) => {
    const [observedSubServices, setSubServices] = useState<SubServiceModel[] | undefined>(undefined);

    useEffect(() => {
        service.subServices.observe().subscribe((subServices: SubServiceModel[]) => {
            setSubServices(subServices)
        })
    }, [])

    return !filterTags || filterTags && filterTags.length === 0 || filterTags && hasTags(filterTags, observedSubServices ?? []) ? (
        <ServicePreview service={service} subServices={observedSubServices} {...rest} />
    ) : <></>
}