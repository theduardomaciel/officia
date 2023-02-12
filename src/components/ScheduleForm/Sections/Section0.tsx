import React, { useRef, useState, useCallback, useEffect, memo, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text } from "react-native";
import DatePicker from 'react-native-date-picker';

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';

// Components
import Modal from 'components/Modal';
import Input from 'components/Input';
import SectionBottomSheet from '../SectionBottomSheet';
import { CalendarDate, StaticCalendar } from 'components/Calendar';
import { MARGIN, NextButton, Section, SubSectionWrapper } from '../SubSectionWrapper';
import { SubActionButton } from 'components/ActionButton';
import { Preview } from 'components/Preview';

// Types
import { SubServiceModel } from 'database/models/subServiceModel';
import { MaterialModel } from 'database/models/materialModel';

// Bottom Sheets
import MaterialBottomSheet from '../Forms/MaterialBottomSheet';
import SubServiceBottomSheet from '../Forms/SubServiceBottomSheet';

// Forms
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { runOnUI } from 'react-native-reanimated';
import Form from '../Forms/Form';


const schema = z.object({
    name: z.string().max(30),
    additionalInfo: z.string().max(200),
});

interface FormData {
    name: string;
    additionalInfo: string;
}

const Section0 = forwardRef(({ bottomSheetRef, updateHandler }: Section, ref) => {
    const { colorScheme } = useColorScheme();
    const currentDate = new Date();

    const [subServices, setSubServices] = useState<SubServiceModel[]>([]);
    const [date, setDate] = useState<CalendarDate>({ date: currentDate.getDate() + 1, month: currentDate.getMonth() });
    const [time, setTime] = useState(currentDate)
    const [materials, setMaterials] = useState<MaterialModel[]>([]);

    const timeModalRef = useRef<any>(null);
    const DatePickerModal = memo(function DatePickerModal() {
        const newDate = useRef(new Date());

        const onDateChange = useCallback((date: Date) => {
            newDate.current = date;
        }, [])

        const onConfirm = () => {
            timeModalRef.current.close();
            setTime(newDate.current)
        }

        return (
            <Modal
                ref={timeModalRef}
                title={"Selecione o horário"}
                icon="calendar-today"
                buttons={[
                    {
                        label: "Confirmar",
                        onPress: onConfirm,
                        closeOnPress: true,
                    }
                ]}
                cancelButton
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
    });

    const { control, getValues, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useImperativeHandle(ref, () => ({
        getData: () => {
            const name = getValues('name');
            const additionalInfo = getValues('additionalInfo');

            return {
                name,
                subServices,
                materials,
                date,
                time,
                additionalInfo
            }
        }
    }));

    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef} expanded={true}>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Nome do Serviço'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{ marginBottom: MARGIN }}
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
                                        Form.expand({
                                            editableData: subService,
                                            onSubmitForm: () => { },
                                            type: "subService"
                                        })
                                    }}
                                />
                            </View>
                        ))
                    }
                </View>
                <SubActionButton
                    onPress={() => {
                        Form.expand({
                            editableData: undefined,
                            onSubmitForm: (data: SubServiceModel) => {
                                setSubServices((prev) => [...prev, data]);
                            },
                            type: "subService"
                        })
                    }}
                    label='Adicionar serviço'
                />
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
                                        Form.expand({
                                            editableData: material,
                                            onSubmitForm: () => { },
                                            type: "material"
                                        })
                                    }}
                                />
                            </View>
                        ))
                    }
                </View>
                <SubActionButton
                    onPress={() => {
                        Form.expand({
                            editableData: undefined,
                            onSubmitForm: (data: MaterialModel) => {
                                setMaterials((prev) => [...prev, data]);
                            },
                            type: "material"
                        })
                    }}
                    label='Adicionar material'
                />
            </SubSectionWrapper>

            <SubSectionWrapper header={{ title: "Data" }}>
                <StaticCalendar
                    selectedDate={date}
                    setSelectedDate={setDate}
                    style={{ padding: 16, backgroundColor: colors.gray[600] }}
                />
            </SubSectionWrapper>

            <Input
                onPress={() => timeModalRef.current.open()}
                label='Horário'
                editable={false}
                value={`${time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                style={{ marginBottom: MARGIN }}
            />

            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Informações Adicionais'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{ marginBottom: MARGIN }}
                        placeholder='Ex: O serviço deve ser realizado na sala 2, no 2º andar.'
                        textAlignVertical='top'
                        multiline
                    />
                )}
                name="additionalInfo"
            />

            <NextButton onPress={() => updateHandler && updateHandler(1)} />

            <DatePickerModal />
        </SectionBottomSheet>
    )
});

export default Section0;