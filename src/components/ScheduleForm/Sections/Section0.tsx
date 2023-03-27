import React, { useRef, useState, useCallback, useEffect, memo, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text } from "react-native";
import DatePicker from 'react-native-date-picker';

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';

// Components
import Modal from 'components/Modal';
import Input from 'components/Input';
import SectionBottomSheet from '../SectionBottomSheet';
import Calendar, { CalendarDate } from 'components/Calendar';
import { Section, SubSectionWrapper } from '../SubSectionWrapper';
import { ActionButton, SubActionButton } from 'components/Button';
import { Preview } from 'components/Preview';

// Types
import { SubServiceModel } from 'database/models/subServiceModel';
import { MaterialModel } from 'database/models/materialModel';

// Forms
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SubServiceBottomSheet from '../Forms/SubServiceBottomSheet';
import MaterialBottomSheet from '../Forms/MaterialBottomSheet';
import BottomSheet from 'components/BottomSheet';

const schema = z.object({
    name: z.string().max(30),
    additionalInfo: z.string().max(200),
    discount: z.string().max(3),
});

type SchemaType = z.infer<typeof schema>;

const Section0 = forwardRef(({ updateHandler, initialValue }: Section, ref) => {
    const { colorScheme } = useColorScheme();
    const currentDate = new Date();

    const [subServices, setSubServices] = useState<SubServiceModel[]>(initialValue?.subServices ?? []);
    const [materials, setMaterials] = useState<MaterialModel[]>(initialValue?.materials ?? []);

    const [date, setDate] = useState<CalendarDate | undefined>(initialValue?.service?.date ? { date: initialValue.service?.date.getDate(), month: initialValue.service?.date.getMonth() } : { date: currentDate.getDate(), month: currentDate.getMonth() });

    const [time, setTime] = useState(initialValue?.service?.date ?? undefined)

    const [isTimeModalVisible, setTimeModalVisible] = useState(false);
    const TimePickerModal = () => {
        const newDate = useRef(new Date());

        const onDateChange = useCallback((date: Date) => {
            newDate.current = date;
        }, [])

        const onConfirm = () => {
            setTimeModalVisible(false)
            setTime(newDate.current)
        }

        const onClean = () => {
            setTimeModalVisible(false)
            setTime(undefined)
        }

        return (
            <Modal
                isVisible={isTimeModalVisible}
                toggleVisibility={() => setTimeModalVisible(false)}
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
                        date={newDate.current}
                        onDateChange={onDateChange}
                        fadeToColor={colorScheme === "light" ? colors.white : colors.gray[200]}
                        androidVariant="nativeAndroid"
                        minuteInterval={15}
                        mode='time'
                    /* is24hourSource='locale' */
                    />
                </View>
            </Modal>
        )
    };

    const { reset, control, getValues, formState: { errors } } = useForm<SchemaType>({
        defaultValues: {
            name: initialValue?.service?.name ?? "",
            additionalInfo: (initialValue?.service?.additionalInfo ? initialValue?.service.additionalInfo : "") ?? "",
            discount: initialValue?.service?.discountPercentage ? `${initialValue?.service?.discountPercentage?.toString()}%` : "0%",
        },
        resolver: zodResolver(schema),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    useImperativeHandle(ref, () => ({
        getData: () => {
            const name = getValues('name');
            const additionalInfo = getValues('additionalInfo');
            const discount = parseInt(getValues('discount').replace("%", ""));

            console.log(name, additionalInfo, discount)

            return {
                name,
                subServices,
                materials,
                discount,
                date,
                time,
                additionalInfo
            }
        }
    }));

    const [editableData, setEditableData] = useState<SubServiceModel | MaterialModel | undefined>(undefined);

    return (
        <>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Nome do Serviço'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder={`Serviço ${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`}
                    />
                )}
                name="name"
            />

            <SubSectionWrapper
                header={{
                    title: "Serviços",
                    children: subServices && subServices?.length > 0 && <Text className='font-medium text-primary-red text-xs opacity-80'>
                        Arraste para excluir
                    </Text>
                }}
            >
                <View className='w-full'>
                    {
                        subServices && subServices?.length === 0 && (
                            <Text className='text-sm text-center text-black dark:text-white mb-6'>
                                Nenhum serviço adicionado.
                            </Text>
                        )
                    }
                    {
                        subServices.map((subService, index) => (
                            <View className='mb-4' key={index.toString()}>
                                <Preview
                                    subService={subService}
                                    onDelete={() => {
                                        setSubServices((prev) => prev.filter((s) => s.id !== subService.id));
                                    }}
                                    onEdit={() => {
                                        setEditableData(subService);
                                        BottomSheet.expand("subServiceBottomSheet")
                                    }}
                                />
                            </View>
                        ))
                    }
                </View>
                <View className='flex-row w-full items-center justify-between'>
                    <View className='flex-1 mr-3'>
                        <SubActionButton
                            onPress={() => {
                                setEditableData(undefined);
                                BottomSheet.expand("subServiceBottomSheet")
                            }}
                            label='Adicionar serviço'
                        />
                    </View>
                    <View className='w-14'>
                        <ActionButton
                            onPress={() => {

                            }}
                            style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}
                            icon="bookmark"
                        />
                    </View>
                </View>
            </SubSectionWrapper>

            <SubSectionWrapper
                header={{
                    title: "Materiais",
                }}
            >
                <View className='w-full'>
                    {
                        materials && materials?.length === 0 && (
                            <Text className='text-sm text-center text-black dark:text-white mb-6'>
                                Nenhum material adicionado.
                            </Text>
                        )
                    }
                    {
                        materials.map((material, index) => (
                            <View className='mb-4' key={index.toString()}>
                                <Preview
                                    material={material}
                                    onDelete={() => {
                                        setMaterials((prev) => prev.filter((m) => m.id !== material.id));
                                    }}
                                    onEdit={() => {
                                        setEditableData(material);
                                        BottomSheet.expand("materialBottomSheet");
                                    }}
                                />
                            </View>
                        ))
                    }
                </View>
                <View className='flex-row w-full items-center justify-between'>
                    <View className='flex-1 mr-3'>
                        <SubActionButton
                            onPress={() => {
                                setEditableData(undefined);
                                BottomSheet.expand("materialBottomSheet");
                            }}
                            label='Adicionar material'
                        />
                    </View>
                    <View className='w-14'>
                        <ActionButton
                            onPress={() => {

                            }}
                            style={{ flex: 1, paddingTop: 6, paddingBottom: 6 }}
                            icon="bookmark"
                        />
                    </View>
                </View>
            </SubSectionWrapper>

            <SubSectionWrapper header={{ title: "Data" }}>
                <Calendar
                    isStatic
                    selectedDate={date}
                    setSelectedDate={setDate}
                    style={{ padding: 16, backgroundColor: colors.gray[600] }}
                />
            </SubSectionWrapper>

            <Input
                label='Horário'
                onPress={() => setTimeModalVisible(true)}
                editable={false}
                value={time ? `${time?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : "Indeterminado"}
            />

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Desconto'
                        onFocus={() => onChange(value.toString().replace('%', ''))}
                        onBlur={() => {
                            if (parseInt(value) > 100) {
                                onChange(100);
                            }
                            onChange(`${value}%`)
                            onBlur();
                        }}
                        onChangeText={onChange}
                        keyboardType='numeric'
                        value={value.toString()}
                        placeholder='0%'
                    />
                )}
                name="discount"
            />

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Informações Adicionais'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder='Ex: O serviço deve ser realizado na sala 2, no 2º andar.'
                        textAlignVertical='top'
                        multiline
                    />
                )}
                name="additionalInfo"
            />

            <ActionButton
                label='Próximo'
                onPress={() => updateHandler && updateHandler(1)}
                preset="next"
            />

            <TimePickerModal />

            <SubServiceBottomSheet
                editableData={editableData as SubServiceModel}
                onSubmitForm={(data: SubServiceModel) => {
                    if (editableData) {
                        setSubServices((prev) => prev.map((oldService) => oldService.id === data.id ? data : oldService))
                    } else {
                        setSubServices((prev) => [...prev, data]);
                    }
                }}
            />

            <MaterialBottomSheet
                editableData={editableData as MaterialModel}
                onSubmitForm={(data: MaterialModel) => {
                    if (editableData) {
                        setMaterials((prev) => prev.map((oldMaterial) => oldMaterial.id === data.id ? data : oldMaterial))
                    } else {
                        setMaterials((prev) => [...prev, data]);
                    }
                }}
            />
        </>
    )
});

export default Section0;