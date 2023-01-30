import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";

import Animated, { FadeInUp, FadeInDown, FadeOutDown, FadeOutUp, Layout, Easing } from 'react-native-reanimated';

import colors from 'global/colors';

import Header from 'components/Header';
import EmptyMessage from 'components/EmptyMessage';
import { Tag, TagsSelector } from 'components/TagsSelector';
import Calendar, { WeekView, WeekDays } from 'components/Calendar';

export default function Home() {
    const { navigate } = useNavigation()
    const insets = useSafeAreaInsets();

    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)

    /* async function fetchData() {
        try {
            const response = await api.get('/summary');
            setSummary(response.data)
        } catch (error) {
            console.log(error, "erro")
            setSummary([])
        }
    }

    useFocusEffect(useCallback(() => {
        fetchData()
    }, [])) */

    function handleTagSelection(data: Tag[]) {
        console.log(data)
    }

    return (
        <View className='flex-1 min-h-full bg-bg-300 px-6 pt-12 gap-y-5'>
            <Header title='Agendado'>
                <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex flex-row items-center justify-center px-3 py-1 bg-bg-200 rounded-full'
                    onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
                >
                    <MaterialIcons
                        name="expand-more"
                        size={16}
                        className={"m-0"}
                        color={colors.text[100]}
                    />
                    <Text className='text-sm ml-1 text-text-100'>
                        Expandir
                    </Text>
                </TouchableOpacity>
            </Header>
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
                        <WeekView />
                    </Animated.View>
                )
            }
            <Animated.View className='flex flex-row items-start w-full' layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}>
                <View className='bg-bg-200 flex-row items-center  h-full mr-3 px-3 rounded-full'>
                    <MaterialIcons name='filter-alt' color={colors.text[100]} size={20} />
                    <Text className='text-text-100 font-semibold text-sm ml-2'>
                        Filtros
                    </Text>
                </View>
                <TagsSelector
                    tags={[
                        { id: 1, title: 'Hidráulico', icon: "plumbing", checked: false },
                        { id: 2, title: 'Elétrico', icon: "bolt", checked: false },
                    ]}
                    onSelectTags={handleTagSelection}
                />
            </Animated.View>
            <Animated.ScrollView
                layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
                className='w-full h-[500px] bg-bg-200 rounded-xl mb-5'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50, height: 500, display: "flex", flex: 1, alignItems: 'center', justifyContent: "center" }}
            >
                <EmptyMessage />
            </Animated.ScrollView>
        </View>
    );
}