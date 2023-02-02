import React, { useRef, useCallback } from 'react';
import { View, Text, useWindowDimensions, TouchableOpacity } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { color, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import * as NavigationBar from "expo-navigation-bar";

import Header from 'components/Header';
import { SectionsNavigator } from 'components/SectionsNavigator';
import BottomSheet, { animProps } from 'components/BottomSheet';
import Input from 'components/Input';
import Label from 'components/Label';

export default function ScheduleForm() {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();

    const [section, setSection] = React.useState(0);
    const bottomSheetRef = useRef<any>(null);

    const selectedSectionId = useSharedValue(section);

    const updateHandler = useCallback((id: number) => {
        selectedSectionId.value = withSpring(id, animProps);
        bottomSheetRef.current.update(() => setSection(id));
    }, [])

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            <View>
                <Header title='Agendamento' hasCancelButton />
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
                hideDeco
                hideBackdrop
                expandedByDefault
                activeHeight={(height * 0.775) + insets.bottom}
                canDismiss={false}
                heightLimitBehaviour="none"
                suppressPortal
            >
                <View
                    className="flex flex-1"
                    style={{
                        paddingTop: 24,
                        paddingLeft: 24,
                        paddingRight: 24,
                        paddingBottom: insets.bottom
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

const MARGIN = 20;

import { Service } from 'utils/data';
import { StaticCalendar } from 'components/Calendar';

type updateHandler = (id: number) => void;

interface Section {
    updateHandler: updateHandler;
}

interface SubSectionWrapperProps {
    header: {
        title: string;
        icon?: string;
        children?: React.ReactNode;
    },
    children: React.ReactNode
}

const SubSectionWrapper = ({ header, children }: SubSectionWrapperProps) => {
    return (
        <View className='w-full flex-col items-start justify-start gap-y-5' style={{ marginBottom: MARGIN }}>
            <View className='w-full flex-row items-center justify-between'>
                <View className='flex-row items-center justify-start'>
                    {
                        header.icon && (
                            <MaterialIcons name={header.icon as unknown as any} size={18} style={{ marginRight: 10 }} />
                        )
                    }
                    <Label>
                        {header.title}
                    </Label>
                </View>
                {header.children}
            </View>
            {children}
        </View>
    )
}

const ServicePreview = ({ service }: { service?: Service }) => {
    return (
        <View className='flex-row items-center justify-between w-full dark:bg-gray-400 rounded-sm p-3'>
            <View className='flex-1 flex-col items-start justify-center gap-y-2 mr-3'>
                <Text className='font-bold text-[15px] leading-none text-white'>
                    Aplicação de silicone em box de banheiro
                </Text>
                <View className='flex-row'>
                    <MaterialIcons name="plumbing" size={12} color={colors.white} style={{ marginRight: 5 }} />
                    <Text className='font-semibold text-black dark:text-white text-xs mr-1'>
                        Hidráulico
                    </Text>
                    <Text className='text-white text-xs'>
                        x3
                    </Text>
                </View>
            </View>
            <View className='px-3 py-1 bg-primary-green rounded-full'>
                <Text className='font-bold text-xs text-white'>
                    R$ 200
                </Text>
            </View>
        </View>
    )
}

const NextButton = ({ section, updateHandler }: { section: number, updateHandler: updateHandler }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded'
            onPress={() => updateHandler(section + 1)}
            style={{
                backgroundColor: section === 3 ? colors.primary.green : colors.gray[200],
                marginBottom: 24
            }}
        >
            <Text className='font-bold text-white text-base'>
                Próximo
            </Text>
        </TouchableOpacity>
    )
}

const Section0 = ({ updateHandler }: Section) => {
    const [services, setServices] = React.useState<Service[]>([]);

    return (
        <>
            <Input label='Nome do Serviço' placeholder='Serviço n. 011-2023' style={{ marginBottom: MARGIN }} />
            <SubSectionWrapper
                header={{
                    title: "Serviços",
                    children: <Text className='font-medium text-primary-red text-xs opacity-80'>
                        Arraste para excluir
                    </Text>
                }}
            >
                <View>
                    <ServicePreview />
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    className='flex-row items-center justify-center w-full py-3 bg-primary-green rounded'
                >
                    <MaterialIcons name='add' size={18} color={colors.white} />
                    <Text className='ml-2 font-medium text-white text-sm'>
                        Adicionar serviço
                    </Text>
                </TouchableOpacity>
            </SubSectionWrapper>
            <SubSectionWrapper header={{ title: "Data" }}>
                <StaticCalendar style={{ padding: 0 }} />
            </SubSectionWrapper>
            <Input label='Indeterminado' style={{ marginBottom: MARGIN }} />
            <Input label='Informações Adicionais' style={{ marginBottom: MARGIN }} />
            <NextButton section={0} updateHandler={updateHandler} />
        </>
    )
}

const Section1 = ({ updateHandler }: Section) => {
    return (
        <>
            <Input label='Nome do Serviço' placeholder='Serviço n. 011-2023' style={{ marginBottom: MARGIN }} />
            <View className='h-[400px]' />
            <NextButton section={1} updateHandler={updateHandler} />
        </>
    )
}

const Section2 = ({ updateHandler }: Section) => {
    return (
        <>
            <Input label='Nome do Serviço' placeholder='Serviço n. 011-2023' style={{ marginBottom: MARGIN }} />
            <NextButton section={1} updateHandler={updateHandler} />
        </>
    )
}