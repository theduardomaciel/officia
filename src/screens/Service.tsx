import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import { ActionButton } from 'components/ActionButton';
import { BottomSheetActions } from 'components/BottomSheet';
import Dropdown, { DropdownData } from 'components/Dropdown';
import Header from 'components/Header';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import { PreviewStatic } from 'components/Preview';
import { NextButton, SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import { Tag } from 'components/TagsSelector';
import Toast from 'components/Toast';

import ClientAdd from 'components/ClientForms/ClientAdd';
import ClientView from 'components/ClientForms/ClientView';

// Database
import { database } from 'database/index.native';

// Types
import type { ClientModel } from 'database/models/clientModel';
import type { MaterialModel } from 'database/models/materialModel';
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

import { tags } from 'global/tags';

interface Props {
    service: ServiceModel;
    subServices?: SubServiceModel[];
    materials?: MaterialModel[];
    client?: ClientModel;
}

interface ObservableServiceModel extends ServiceModel {
    subServices: any;
    materials: any;
}

export default function Service({ route }: any) {
    const { serviceId, updated } = route.params;

    const [service, setService] = React.useState<ServiceModel | undefined>(undefined);
    const [subServices, setSubServices] = React.useState<SubServiceModel[] | undefined>(undefined);
    const [materials, setMaterials] = React.useState<MaterialModel[] | undefined>(undefined);
    const [client, setClient] = React.useState<ClientModel | undefined>(undefined);

    const showUpdatedServiceToast = useCallback(() => {
        Toast.show({
            preset: "success",
            icon: "edit",
            title: "O serviço foi atualizado com sucesso!",
        })
    }, [])

    async function fetchService() {
        const newService = await database
            .get<ServiceModel>("services")
            .find(serviceId) as ObservableServiceModel;

        setService(newService)
        newService.subServices.observe().subscribe(setSubServices);
        newService.materials.observe().subscribe(setMaterials);
        newService.client.observe().subscribe(setClient);
    }

    useFocusEffect(
        React.useCallback(() => {
            if (updated) {
                showUpdatedServiceToast();
            }

            fetchService();
            /* return () => unsubscribe(); */
        }, [serviceId])
    );

    return (
        <>
            {
                service ? (
                    <ScreenContent
                        service={service}
                        subServices={subServices}
                        materials={materials}
                        client={client}
                    />
                ) : (
                    <View className='flex-1 items-center justify-center pt-24'>
                        <Loading />
                    </View>
                )
            }
            <Toast
                toastPosition="top"
                toastOffset={"90%"}
            />
        </>
    )
}

const STATUS_DATA = [
    { label: "Agendado", value: "scheduled", icon: "calendar-today" },
    /* { label: "Em garantia", value: "warranty", icon: "verified" }, */
    { label: "Arquivado", value: "archived", icon: "archive" },
] as DropdownData[];

function ScreenContent({ service, subServices, materials, client }: Props) {
    const insets = useSafeAreaInsets();
    const { navigate } = useNavigation();

    const [isDeleteModalVisible, setDeleteModalVisible] = React.useState(false);
    const servicesTypes = [...new Set(subServices?.map(subService => subService.types).flat())];

    // Bottom Sheets
    const clientAddBottomSheetRef = React.useRef<BottomSheetActions>(null);
    const expandClientAddBottomSheet = useCallback(() => {
        clientAddBottomSheetRef.current?.expand();
    }, [])

    const clientViewBottomSheetRef = React.useRef<BottomSheetActions>(null);
    const expandClientViewBottomSheet = useCallback(() => {
        clientViewBottomSheetRef.current?.expand();
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

    async function deleteService() {
        await database.write(async () => {
            const queryService = await database
                .get<ServiceModel>('services')
                .find(service.id)

            await queryService.destroyPermanently();
        })

        setDeleteModalVisible(false);
        navigate("home", { service: "deleted" });
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
                        <TouchableOpacity activeOpacity={0.8} onPress={client ? expandClientViewBottomSheet : expandClientAddBottomSheet}>
                            {
                                client ? (
                                    <View className='flex-row items-center gap-x-2'>
                                        <MaterialIcons name='person' size={18} color={colors.text[100]} />
                                        <Text className='text-base underline text-text-100'>
                                            {client.name}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className='text-base underline text-text-100'>
                                        Adicionar dados do cliente
                                    </Text>
                                )
                            }
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
                                onPress={() => navigate('schedule', { serviceId: service.id })}
                            />
                            <View>
                                <ActionButton
                                    label='Excluir serviço'
                                    icon='delete'
                                    style={{ backgroundColor: colors.primary.red, paddingTop: 12, paddingBottom: 12 }}
                                    onPress={() => setDeleteModalVisible(true)}
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
                    onPress={() => navigate("invoice", { serviceId: service.id })}
                />
            </View>
            <Toast
                toastPosition="top"
                maxDragDistance={25}
                toastOffset={"75%"}
            />
            {
                client && (
                    <ClientView
                        bottomSheetRef={clientViewBottomSheetRef}
                        client={client}
                        service={service}
                    />
                )
            }
            <ClientAdd
                bottomSheetRef={clientAddBottomSheetRef}
                service={service}
            />
            <Dropdown
                ref={statusDropdownRef}
                data={STATUS_DATA}
                bottomSheetHeight={"23%"}
                bottomSheetLabel={"Selecione o status do serviço"}
                selected={serviceStatus}
                setSelected={updateStatus}
            />
            <Modal
                isVisible={isDeleteModalVisible}
                toggleVisibility={() => setDeleteModalVisible(false)}
                title={"Você tem certeza?"}
                message="É possível arquivar este serviço a qualquer momento, ao invés de deletá-lo."
                icon="delete"
                buttons={[
                    {
                        label: "Remover",
                        onPress: deleteService,
                        color: colors.primary.red,
                        closeOnPress: true,
                    }
                ]}
                cancelButton
            />
        </View>
    )
}