import { useCallback, useRef, useState } from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DatePicker from "react-native-date-picker";

import colors from "global/colors";
import { useColorScheme } from "nativewind";

// Components
import Input from "./Input";
import Label from "./Label";
import Modal from "./Modal";
import { TagObject, TagsSelector } from "./TagsSelector";
import { ActionButton } from "./Button";

interface Props {
    onSubmit: (data: any) => void;
}

export default function DateFilter({ onSubmit }: Props) {
    const { colorScheme } = useColorScheme();

    const [dateFilter, setDateFilter] = useState<{
        initialDate: Date | undefined,
        finalDate: Date | undefined,
        specific?: boolean
    } | undefined>(undefined);

    const [isDateModalVisible, setDateModalVisible] = useState<'initial' | 'final' | false>(false);
    const DatePickerModal = () => {
        const newDate = useRef(new Date());

        const onDateChange = useCallback((date: Date) => {
            newDate.current = date;
        }, [])

        const onConfirm = () => {
            setDateModalVisible(false)
            if (isDateModalVisible === 'initial') {
                setDateFilter({
                    ...dateFilter!,
                    initialDate: newDate.current
                });
            } else if (isDateModalVisible === 'final') {
                setDateFilter({
                    ...dateFilter!,
                    finalDate: newDate.current
                });
            }
        }

        const onClean = () => {
            setDateModalVisible(false)
            setDateFilter(undefined)
        }

        return (
            <Modal
                isVisible={isDateModalVisible !== false}
                toggleVisibility={() => setDateModalVisible(false)}
                title={"Selecione o horário"}
                icon="calendar-today"
                buttons={[
                    {
                        label: "Limpar",
                        onPress: onClean,
                        closeOnPress: true,
                        color: colors.primary.red
                    },
                    {
                        label: "Confirmar",
                        onPress: onConfirm,
                        closeOnPress: true,
                    }
                ]}
            >
                <View className='flex flex-1 w-full items-center justify-center'>
                    <DatePicker
                        style={{ transform: [{ scale: 0.9 }] }}
                        date={newDate.current}
                        onDateChange={onDateChange}
                        fadeToColor={colorScheme === "light" ? colors.white : colors.gray[200]}
                        androidVariant="nativeAndroid"
                        minuteInterval={15}
                        mode="date"
                    /* is24hourSource='locale' */
                    />
                </View>
            </Modal>
        )
    };

    const updateSpecificDate = useCallback((tags: TagObject[]) => {
        if (tags.length === 0) {
            setDateFilter(undefined);
            return;
        }

        const checkedTag = tags.find(tag => tag.checked);
        if (!checkedTag) {
            setDateFilter(undefined);
            return;
        }

        const initialDate = new Date();
        initialDate.setDate(initialDate.getDate() - parseInt(checkedTag.id));
        setDateFilter({ initialDate, finalDate: new Date(), specific: true });
    }, [])

    return (
        <>
            <ScrollView
                className="flex flex-1"
                contentContainerStyle={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12,
                    rowGap: 25
                }}
            >
                <Label>
                    Filtrar por data
                </Label>
                <Text className='font-bold text-sm text-text-100'>
                    Últimos períodos
                </Text>
                <View className="h-10">
                    <TagsSelector
                        tags={[
                            { name: '7 dias', id: "7", color: colors.primary.green },
                            { name: '14 dias', id: "14", color: colors.primary.green },
                            { name: '30 dias', id: "30", color: colors.primary.green },
                            { name: '90 dias', id: "90", color: colors.primary.green },
                        ]}
                        height={40}
                        onSelectTags={updateSpecificDate}
                        pallette='dark'
                        uniqueSelection
                    />
                </View>
                <Text className='font-bold text-sm text-text-100'>
                    Período específico
                </Text>
                <View className='flex-row w-full items-center justify-between' style={{
                    opacity: dateFilter?.specific ? 0.5 : 1
                }}>
                    <View className='flex-1 mr-3'>
                        <Input
                            label='Data Inicial'
                            value={dateFilter?.initialDate?.toISOString().split('T')[0].replaceAll('-', '/').split('/').reverse().join('/')}
                            onPress={() => setDateModalVisible('initial')}
                            editable={false}
                            disabled={dateFilter?.specific}
                            pallette='dark'
                            style={{ height: 40 }}
                            required
                        />
                    </View>
                    <View className='flex-1'>
                        <Input
                            label='Data Final'
                            value={dateFilter?.finalDate?.toISOString().split('T')[0].replaceAll('-', '/').split('/').reverse().join('/')}
                            onPress={() => setDateModalVisible('final')}
                            editable={false}
                            disabled={dateFilter?.specific}
                            pallette='dark'
                            style={{ height: 40 }}
                            required
                        />
                    </View>
                </View>
                <ActionButton
                    label={`Filtrar`}
                    icon={'filter-alt'}
                    style={{
                        backgroundColor: colors.primary.green
                    }}
                    onPress={() => onSubmit(dateFilter)}
                />
            </ScrollView>
            <DatePickerModal />
        </>
    )
}