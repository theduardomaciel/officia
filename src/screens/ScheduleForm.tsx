import React, { useRef, useCallback } from 'react';
import { View, Text, useWindowDimensions, TouchableOpacity } from "react-native";
import { useSharedValue, withSpring } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Header from 'components/Header';
import Input from 'components/Input';
import { SectionsNavigator } from 'components/SectionsNavigator';
import { StaticCalendar } from 'components/Calendar';

import BottomSheet, { animProps } from 'components/BottomSheet';
import AddSubService from 'components/ScheduleForm/AddSubService';

import { ServicePreview } from 'components/ServicePreview';
import { MARGIN, SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';

import type { Material, SubService } from 'types/service';
import { SubActionButton } from 'components/ActionButton';
import Modal from 'components/Modal';
import DatePicker from 'react-native-date-picker';
import { useColorScheme } from 'nativewind';

export default function ScheduleForm() {
    const { height } = useWindowDimensions();

    const [section, setSection] = React.useState(0);
    const selectedSectionId = useSharedValue(section);

    const bottomSheetRef = useRef<any>(null);
    const updateHandler = useCallback((id: number) => {
        selectedSectionId.value = withSpring(id, animProps);
        bottomSheetRef.current.update(() => setSection(id));
    }, [])

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            {/* <StatusBar backgroundColor={colors.gray[300]} barStyle={"light-content"} /> */}
            <View>
                <Header
                    title='Agendamento'
                    cancelButton={section === 0}
                    returnButton={section !== 0 ? () => updateHandler(section - 1) : undefined}
                />
            </View>
            <SectionsNavigator
                selectedId={selectedSectionId}
                sections={[
                    {
                        id: 0,
                        title: "Básico",
                        onPress: () => section !== 0 && updateHandler(0)
                    },
                    {
                        id: 1,
                        title: "Detalhes",
                        onPress: () => section !== 1 && updateHandler(1)
                    },
                    {
                        id: 2,
                        title: "Revisão",
                        onPress: () => section !== 2 && updateHandler(2)
                    }
                ]}
            />
            <BottomSheet
                ref={bottomSheetRef}
                defaultValues={{
                    expanded: true,
                    suppressBackdrop: true,
                    suppressHandle: true,
                    suppressPortal: true
                }}
                height={"76%"}
                canDismiss={false}
                heightLimitBehaviour="contentHeight"
                colors={{
                    background: colors.gray[500],
                }}
            >
                <View
                    className="flex flex-1"
                    style={{
                        paddingTop: 24,
                        paddingLeft: 24,
                        paddingRight: 24,
                        paddingBottom: 12
                    }}
                >
                    {
                        section === 0 ? (
                            <Section0 updateHandler={updateHandler} />
                        ) : section === 1 ? (
                            <Section1 updateHandler={updateHandler} />
                        ) : (
                            <Section2 updateHandler={updateHandler} />
                        )
                    }
                </View>
            </BottomSheet>
        </View>
    )
}

type updateHandler = (id: number) => void;
interface Section {
    updateHandler: updateHandler;
}

const Section0 = ({ updateHandler }: Section) => {
    const { colorScheme } = useColorScheme();

    const [date, setDate] = React.useState(new Date())
    const [subServices, setSubServices] = React.useState<SubService[]>([]);
    const [materials, setMaterials] = React.useState<Material[]>([]);

    const dateModalRef = useRef<any>(null);
    const serviceBottomSheetRef = useRef<any>(null);

    const serviceBottomSheetOpenHandler = useCallback(() => {
        serviceBottomSheetRef.current.expand();
    }, [])

    return (
        <>
            <Input label='Nome do Serviço' placeholder='Serviço n. 011-2023' style={{ marginBottom: MARGIN }} />

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
                                <ServicePreview subService={subService} setSubServices={setSubServices} />
                            </View>
                        ))
                    }
                </View>
                <SubActionButton
                    onPress={serviceBottomSheetOpenHandler}
                    label='Adicionar serviço'
                />
            </SubSectionWrapper>

            <SubSectionWrapper header={{ title: "Data" }}>
                <StaticCalendar style={{ padding: 16, backgroundColor: colors.gray[600] }} />
            </SubSectionWrapper>

            <Input
                onPress={() => dateModalRef.current.open()}
                label='Horário'
                editable={false}
                value={`${date.getHours()}:${date.getMinutes()}`}
                style={{ marginBottom: MARGIN }}
            />

            <Input label='Informações Adicionais' textAlignVertical='top' style={{ marginBottom: MARGIN, minHeight: 100, paddingTop: 15 }} />

            <NextButton section={0} updateHandler={updateHandler} />

            <AddSubService
                serviceBottomSheetRef={serviceBottomSheetRef}
                setSubServices={setSubServices}
                materials={materials}
                setMaterials={setMaterials}
            />
            <Modal ref={dateModalRef}
                title={"Selecione o horário"}
                icon="calendar-today"
                buttons={[
                    {
                        label: "Confirmar",
                        onPress: () => { },
                        closeOnPress: true,
                    }
                ]}
                cancelButton
            >
                <View className='flex flex-1 w-full items-center justify-center'>
                    <DatePicker
                        date={date}
                        onDateChange={setDate}
                        fadeToColor={colorScheme === "light" ? colors.white : colors.gray[200]}
                        androidVariant="nativeAndroid"
                        minuteInterval={15}
                        mode='time'
                        locale='en'
                        is24hourSource='locale'
                    />
                </View>
            </Modal>
        </>
    )
}

const Section1 = ({ updateHandler }: Section) => {
    return (
        <>
            <Input label='Nome do Serviço' placeholder='Serviço n. 011-2023' style={{ marginBottom: MARGIN }} />
            <NextButton section={1} updateHandler={updateHandler} />

        </>
    )
}

const Section2 = ({ updateHandler }: Section) => {
    return (
        <>

            <NextButton section={2} updateHandler={updateHandler} />
        </>
    )
}

const NextButton = ({ section, updateHandler }: { section: number, updateHandler: updateHandler }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded'
            onPress={section === 2 ? () => updateHandler(0) : () => updateHandler(section + 1)}
            style={{
                backgroundColor: section === 2 ? colors.primary.green : colors.gray[200],
            }}
        >
            <Text className='font-bold text-white text-base'>
                {section === 2 ? "Agendar" : "Próximo"}
            </Text>
        </TouchableOpacity>
    )
}