import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme } from 'nativewind/dist/use-color-scheme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';

import colors from 'global/colors';
import { MaterialIcons } from "@expo/vector-icons";

import Header from 'components/Header';
import EmptyMessage from 'components/EmptyMessage';
import { Tag, TagsSelector } from 'components/TagsSelector';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

import Calendar, { WeekView, WeekDays } from 'components/Calendar';
import { UIManager } from 'react-native';
import { tags } from 'global/tags';

export const FilterView = ({ colorScheme }: { colorScheme: string }) => (
    <View className='bg-black dark:bg-gray-200 flex-row items-center  h-full mr-3 px-3 rounded-full'>
        <MaterialIcons name='filter-alt' color={colorScheme === "dark" ? colors.text[100] : colors.white} size={20} />
        <Text className='text-white dark:text-text-100 font-semibold text-sm ml-2'>
            Filtros
        </Text>
    </View>
)

export default function Home() {
    const { navigate } = useNavigation()
    const { colorScheme } = useColorScheme();
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
    } */

    useFocusEffect(useCallback(() => {
        //fetchData()
        NavigationBar.setPositionAsync("absolute")
        NavigationBar.setBackgroundColorAsync("transparent")
    }, []))

    function handleTagSelection(data: Tag[]) {
        /* console.log(data) */
    }

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5 relative'>
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
                        <WeekView navigate={navigate} />
                    </Animated.View>
                )
            }
            <Animated.View className='flex flex-row items-start w-full' layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}>
                <FilterView colorScheme={colorScheme} />
                <TagsSelector
                    tags={tags}
                    onSelectTags={handleTagSelection}
                />
            </Animated.View>
            <Animated.ScrollView
                layout={Layout.springify().damping(7).stiffness(85).mass(0.25)}
                className='w-full h-full bg-light_gray-100 dark:bg-gray-200 rounded-xl mb-5'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50, height: 500, display: "flex", flex: 1, alignItems: 'center', justifyContent: "center" }}
            >
                <EmptyMessage />
            </Animated.ScrollView>
        </View>
    );
}