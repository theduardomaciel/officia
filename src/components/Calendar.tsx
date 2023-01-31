import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";

import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function WeekDays() {
    return (
        <View className='flex flex-row items-center justify-between w-full px-4'>
            {
                WEEK_DAYS.map((day, index) => {
                    return (
                        <Text key={`day_${index}`} className="font-semibold text-xs text-text-100">
                            {day.charAt(0).toUpperCase()}
                        </Text>
                    )
                })
            }
        </View>
    )
}

function DayView({ date, isToday, style, navigate }: { date: Date, isToday?: boolean, style?: ViewStyle, navigate: any }) {
    const dateString = date.toISOString();
    return (
        <TouchableOpacity
            className='flex w-10 h-10 rounded-full items-center justify-center p-1 bg-bg-200 border-text-neutral'
            style={{ borderWidth: isToday ? 1 : 0, ...style }}
            activeOpacity={0.65}
            onPress={() => navigate('dayAgenda', { dateString })}
        >
            <Text className='font-semibold text-md text-text-neutral'>
                {date.getDate()}
            </Text>
        </TouchableOpacity>
    )
}

export function WeekView({ startDate, navigate }: { startDate?: Date, navigate: any }) {
    const currentDate = new Date();
    const lastDayOfMonth = new Date(startDate ? startDate.getFullYear() : currentDate.getFullYear(), startDate ? startDate.getMonth() + 1 : currentDate.getMonth() + 1, 0).getDate();

    let startDateDayOfMonth = startDate ? startDate.getDate() : new Date().getDate();

    return (
        <View className='flex flex-row items-center justify-between w-full mt-2'>
            {
                WEEK_DAYS.map((day, index) => {
                    const DATE = startDateDayOfMonth <= lastDayOfMonth ? startDateDayOfMonth++ : lastDayOfMonth - startDateDayOfMonth + index;
                    return (
                        <DayView
                            key={`day_number${index}`}
                            navigate={navigate}
                            date={new Date(currentDate.getFullYear(), currentDate.getMonth(), DATE)}
                            isToday={DATE === currentDate.getDate()}
                        />
                    )
                })
            }
        </View>
    )
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function getMonthInfo(currentMonth: number, currentDate: Date) {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1).getDay();
    const lastDateOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate();
    const firstDateOfMonth = new Date(currentDate.getFullYear(), currentMonth, 1).getDate();

    const daysAmountOnCalendar = firstDayOfMonth >= 4 ? 42 : 35;
    //console.log(daysAmountOnCalendar, "quantidade de dias")

    let monthDates = Array.from({ length: lastDateOfMonth - firstDateOfMonth + 1 }, (_, index) => {
        return {
            date: firstDateOfMonth + index,
            month: currentMonth
        };
    })

    const remainingDaysOnLastMonth = firstDayOfMonth;
    //console.log(firstDayOfMonth, "primeiro dia do mês")

    if (remainingDaysOnLastMonth > 0) {
        const lastMonthLastDate = new Date(currentDate.getFullYear(), currentMonth, 0).getDate();
        const remainingPreviousMonthDates = Array.from({ length: remainingDaysOnLastMonth }, (_, index) => {
            return {
                date: lastMonthLastDate - index,
                month: currentMonth - 1
            };
        }).reverse()

        //console.log(remainingPreviousMonthDates, "restantes no mês anterior")
        monthDates = remainingPreviousMonthDates.concat(monthDates); // invertemos as arrays
    }

    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDay();
    const remainingDaysOnNextMonth = 7 - lastDayOfMonth - 1;
    //console.log(lastDayOfMonth, "último dia do mês")

    if (remainingDaysOnNextMonth > 0) {
        const nextMonthFirstDate = new Date(currentDate.getFullYear(), currentMonth + 1, 1).getDate();
        const remainingNextMonthDates = Array.from({ length: remainingDaysOnNextMonth }, (_, index) => {
            return {
                date: nextMonthFirstDate + index,
                month: currentMonth + 1
            };
        })

        //console.log(remainingNextMonthDates, "restantes no próximo mês")
        monthDates = monthDates.concat(remainingNextMonthDates).splice(0, daysAmountOnCalendar);
    }

    return { monthDates, firstDayOfMonth, lastDayOfMonth, remainingDaysOnLastMonth, remainingDaysOnNextMonth };
}

const monthInfos = Array.from({ length: 12 }, (_, index) => {
    return getMonthInfo(index, new Date());
})

export default function Calendar() {
    const { navigate } = useNavigation();

    const currentDate = new Date();
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());

    const { monthDates, firstDayOfMonth, lastDayOfMonth, remainingDaysOnLastMonth, remainingDaysOnNextMonth } = monthInfos[currentMonth];

    const canDecrease = currentMonth > 0;
    const canIncrease = currentMonth < 11;

    const END_POSITION = 250;
    const position = useSharedValue(0);
    const opacity = useSharedValue(1);

    function worklet(index: number) {
        setCurrentMonth(currentMonth + index);
    }

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationX > 0 && !canDecrease) return;
            if (e.translationX < 0 && !canIncrease) return;
            position.value = e.translationX;
            opacity.value = 1 - Math.abs(e.translationX) / (END_POSITION / 2);
        })
        .onEnd((e) => {
            if (e.translationX > 0 && !canDecrease) return;
            if (e.translationX < 0 && !canIncrease) return;
            if (position.value > 0) {
                // Vai para a direita - diminui
                position.value = withTiming(END_POSITION, { duration: 350 }, () => {
                    'worklet';
                    position.value = -END_POSITION
                    position.value = withTiming(0, { duration: 250 })
                    opacity.value = withTiming(1, { duration: 250 });
                });
                runOnJS(worklet)(-1);
            } else {
                // Vai para a esquerda - aumenta
                position.value = withTiming(-END_POSITION, { duration: 250 }, () => {
                    'worklet';
                    position.value = END_POSITION
                    position.value = withTiming(0, { duration: 250 })
                    opacity.value = withTiming(1, { duration: 250 });
                });
                runOnJS(worklet)(1);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: position.value }],
        opacity: opacity.value
    }));

    return (
        <GestureHandlerRootView className="w-full">
            <View className="flex-col w-full bg-bg-500 rounded-xl p-4">
                <View className="flex-row items-center justify-around mb-2">
                    <MaterialIcons
                        name="chevron-left"
                        size={24}
                        className="active:scale-50"
                        disabled={currentMonth <= 0}
                        style={{ opacity: currentMonth <= 0 ? 0.25 : 1 }}
                        color={colors.text.neutral}
                        onPress={() => currentMonth > 0 && setCurrentMonth(actualStateMonth => actualStateMonth - 1)}
                    />
                    <GestureDetector gesture={panGesture}>
                        <Animated.Text style={animatedStyle} className="text-text-neutral w-3/4 text-center font-titleBold text-xl">
                            {MONTHS[currentMonth]}
                        </Animated.Text>
                    </GestureDetector>
                    <MaterialIcons
                        name="chevron-right"
                        size={24}
                        disabled={currentMonth >= 11}
                        style={{ opacity: currentMonth >= 11 ? 0.25 : 1 }}
                        color={colors.text.neutral}
                        onPress={() => currentMonth < 11 && setCurrentMonth(actualStateMonth => actualStateMonth + 1)}
                    />
                </View>

                <View className="flex-col items-center justify-center w-full mb-2">
                    <WeekDays />
                </View>

                <View className="flex-row items-center justify-between w-full flex-wrap">
                    {
                        monthDates.map((date, index) => {
                            const REMAINING_LAST = remainingDaysOnLastMonth > 0 && index < remainingDaysOnLastMonth;
                            const REMAINING_NEXT = remainingDaysOnNextMonth > 0 && index >= monthDates.length - remainingDaysOnNextMonth;

                            return (
                                <DayView
                                    key={`calendar_${index}`}
                                    date={new Date(currentDate.getFullYear(), date.month, date.date)}
                                    isToday={date.date == currentDate.getDate() && index >= firstDayOfMonth && index <= lastDayOfMonth}
                                    navigate={navigate}
                                    style={{
                                        opacity: (REMAINING_LAST || REMAINING_NEXT) ? 0.5 : 1,
                                        marginBottom: 5,
                                        marginRight: 5,
                                        width: 35,
                                        height: 35,
                                    }}
                                />
                            )
                        })
                    }
                </View>
            </View>
        </GestureHandlerRootView>
    )
}