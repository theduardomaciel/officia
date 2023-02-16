import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from 'global/colors';
import { MaterialIcons } from "@expo/vector-icons";

// Components
import Header from 'components/Header';
import { NextButton, SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import { Tag } from 'components/TagsSelector';
import { PreviewStatic } from 'components/Preview';
import { ActionButton } from 'components/ActionButton';
import Toast from 'components/Toast';
import ClientAdd from 'components/ClientForms/ClientAdd';
import { BottomSheetActions } from 'components/BottomSheet';
import Dropdown, { DropdownData } from 'components/Dropdown';

// Database
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';

import { database } from 'database/index.native';
import { ServiceModel } from 'database/models/serviceModel';

// Types
import type { SubServiceModel } from 'database/models/subServiceModel';
import type { MaterialModel } from 'database/models/materialModel';
import { tags } from 'global/tags';

interface Props {
    service: ServiceModel;
    subServices: SubServiceModel[];
    materials: MaterialModel[];
}

export default function Service({ route }: any) {
    const { serviceId } = route.params;
    const [service, setService] = React.useState<ServiceModel | undefined>(undefined);

    async function fetchService() {
        const service = await database
            .get<ServiceModel>("services")
            .find(serviceId);

        setService(service);
    }

    useEffect(() => {
        fetchService();
    }, [])

    return (
        service ? (
            <EnhancedScreenContent service={service} />
        ) : <></>
    )
}

const STATUS_DATA = [
    { label: "Agendado", value: "scheduled", icon: "calendar-today" },
    { label: "Em garantia", value: "warranty", icon: "verified" },
    { label: "Arquivado", value: "archived", icon: "archive" },
] as DropdownData[];

function ScreenContent({ service, subServices, materials }: Props) {
    const insets = useSafeAreaInsets();
    const servicesTypes = [...new Set(subServices?.map(subService => subService.types).flat())];

    // Bottom Sheets
    const clientAddBottomSheetRef = React.useRef<BottomSheetActions>(null);

    const expandClientAddBottomSheet = useCallback(() => {
        clientAddBottomSheetRef.current?.expand();
    }, [])

    // Dropdowns
    const [serviceStatus, setServiceStatus] = React.useState(service.status);
    const statusDropdownRef = useRef<any>(null);

    const statusDropdownOpenHandler = useCallback(() => {
        statusDropdownRef.current?.open();
    }, [])

    async function updateStatus(status: string) {
        setServiceStatus(status);

        await database.write(async () => {
            const queryService = await database
                .get<ServiceModel>('services')
                .find(service.id)

            await queryService.update(service => {
                service.status = status;
            })
        })
    }

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            <View>
                <Header
                    title={service?.name ?? "teste"}
                    returnButton
                    upperChildren={
                        <View className='flex-row items-center gap-x-2'>
                            <MaterialIcons name='calendar-today' size={18} color={colors.text[100]} />
                            <Text className='text-sm text-text-100'>
                                {service?.date?.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - {service?.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        </View>
                    }
                    aboveTitle={
                        <TouchableOpacity className='flex-row items-center gap-x-2' activeOpacity={0.8} onPress={statusDropdownOpenHandler}>
                            <MaterialIcons
                                name={STATUS_DATA.find(status => status.value === serviceStatus)?.icon as unknown as any}
                                size={14}
                                color={colors.text[100]}
                            />
                            <Text className='text-sm text-text-100 uppercase'>
                                {STATUS_DATA.find(status => status.value === serviceStatus)?.label}
                            </Text>
                            <MaterialIcons name='arrow-drop-down' size={14} color={colors.text[100]} />
                        </TouchableOpacity>
                    }
                    bellowTitle={
                        <TouchableOpacity activeOpacity={0.8} onPress={expandClientAddBottomSheet}>
                            <Text className='text-base underline text-text-100'>
                                Adicionar dados do cliente
                            </Text>
                        </TouchableOpacity>
                    }
                />
            </View>
            <ScrollView
                className=''
                contentContainerStyle={{
                    paddingBottom: 75
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className='flex-col'>
                    {
                        servicesTypes && servicesTypes.length > 0 && (
                            <SubSectionWrapper header={{
                                title: "Categorias"
                            }}>
                                <ScrollView
                                    horizontal
                                    className='w-full'
                                    contentContainerStyle={{}}
                                    nestedScrollEnabled
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {
                                        servicesTypes?.map((type, index) => {
                                            const tagData = tags.find(tag => tag.value === type);

                                            return (
                                                tagData && (
                                                    <Tag
                                                        key={index.toString()}
                                                        isChecked
                                                        activeOpacity={1}
                                                        height={35}
                                                        title={tagData?.title}
                                                        icon={tagData?.icon}
                                                    />
                                                )
                                            )
                                        })
                                    }
                                </ScrollView>
                            </SubSectionWrapper>
                        )
                    }

                    {
                        subServices && subServices.length > 0 && (
                            <SubSectionWrapper
                                header={{
                                    title: "Serviços",
                                }}
                            >
                                <View className='w-full'>
                                    {
                                        subServices?.map((subService, index) => (
                                            <View className='mb-2' key={index.toString()}>
                                                <PreviewStatic
                                                    palette="light"
                                                    hasBorder
                                                    subService={subService}
                                                />
                                            </View>
                                        ))
                                    }
                                </View>
                            </SubSectionWrapper>
                        )
                    }

                    {
                        materials && materials.length > 0 && (
                            <SubSectionWrapper
                                header={{
                                    title: "Materiais",
                                }}
                            >
                                <View className='w-full'>
                                    {
                                        materials?.map((material, index) => {
                                            console.log(material)
                                            return (
                                                <View className='mb-2' key={index.toString()}>
                                                    <PreviewStatic
                                                        palette="light"
                                                        hasBorder
                                                        material={material}
                                                    />
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                            </SubSectionWrapper>
                        )
                    }

                    <SubSectionWrapper
                        header={{
                            title: "Ações",
                        }}
                    >
                        <View className='flex w-full gap-y-2'>
                            <ActionButton
                                label='Editar serviço'
                                icon='edit'
                                style={{ paddingTop: 12, paddingBottom: 12 }}
                                onPress={() => { }}
                            />
                            <View>
                                <ActionButton
                                    label='Excluir serviço'
                                    icon='delete'
                                    style={{ backgroundColor: colors.primary.red, paddingTop: 12, paddingBottom: 12 }}
                                    onPress={() => { }}
                                />
                            </View>
                        </View>
                    </SubSectionWrapper>
                </View>

            </ScrollView>
            <View
                className='w-screen absolute bottom-0 px-6'
                style={{
                    paddingBottom: insets.bottom + 10,
                }}
            >
                <NextButton
                    icon={"attach-money"}
                    title={"Gerar orçamento"}
                />
            </View>
            <Toast
                toastPosition="top"
                maxDragDistance={25}
                toastOffset={"75%"}
            />
            <ClientAdd bottomSheetRef={clientAddBottomSheetRef} onSubmitForm={() => { }} />
            <Dropdown
                ref={statusDropdownRef}
                data={STATUS_DATA}
                bottomSheetHeight={"28%"}
                bottomSheetLabel={"Selecione o status do serviço"}
                selected={serviceStatus}
                setSelected={updateStatus}
            />
        </View>
    )
}

const enhance = withObservables(['service'], ({ service }) => ({
    service,
    subServices: service.subServices,
    materials: service.materials,
}))

const EnhancedScreenContent = enhance(ScreenContent)