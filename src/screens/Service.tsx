import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container from 'components/Container';
import Header from 'components/Header';
import Modal from 'components/Modal';
import Toast from 'components/Toast';
import Dropdown, { DropdownData } from 'components/Dropdown';

import { ActionButton } from 'components/Button';
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import { Loading } from 'components/StatusMessage';
import { PreviewStatic } from 'components/Preview';
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import { Tag } from 'components/TagsSelector';

import ClientAdd from 'components/ClientForms/ClientAdd';
import ClientView from 'components/ClientForms/ClientView';

// Database
import { database } from 'database/index.native';

// Types
import type { ClientModel } from 'database/models/clientModel';
import type { MaterialModel } from 'database/models/materialModel';
import type { ServiceModel } from 'database/models/serviceModel';
import type { SubServiceModel } from 'database/models/subServiceModel';
import { removeNotification, scheduleServiceNotification } from 'utils/notificationHandler';

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

export default function Service({ route, navigation }: any) {
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
            message: "As alterações foram salvas."
        })
    }, [])

    async function fetchService() {
        const newService = await database
            .get<ServiceModel>("services")
            .find(serviceId) as ObservableServiceModel;

        if (newService.date < new Date() && newService.status === "scheduled") {
            await database.write(async () => {
                await newService.update((service: any) => {
                    service.status = "archived"
                })
            })
            removeNotification(newService.id)
        }

        setService(newService)

        //newService.observe().subscribe(setService);
        newService.subServices.observe().subscribe(setSubServices);
        newService.materials.observe().subscribe(setMaterials);
        newService.client.observe().subscribe(setClient);
    }

    useFocusEffect(
        React.useCallback(() => {
            if (updated) {
                navigation.setParams({ updated: undefined, serviceId: serviceId })
                showUpdatedServiceToast();
            }

            fetchService();
        }, [serviceId, updated])
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
                toastPosition="bottom"
                maxDragDistance={25}
                toastOffset={"10%"}
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
    const servicesTypes = [...new Set(subServices?.map(subService => subService.types.length > 0 ? subService.types.map(category => category) : []).flat())];

    // Bottom Sheets
    const expandClientAddBottomSheet = useCallback(() => {
        BottomSheet.expand("clientAddBottomSheet");
    }, [])

    const expandClientViewBottomSheet = useCallback(() => {
        BottomSheet.expand("clientViewBottomSheet");
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

        if (status === "archived") {
            await removeNotification(service.id)
        } else if (status === "scheduled" && service.date.getTime() >= new Date().getTime()) {
            await scheduleServiceNotification(service, subServices?.length ?? 0, client?.name)
        }
    }

    async function deleteService() {
        await database.write(async () => {
            const queryService = await database
                .get<ServiceModel>('services')
                .find(service.id)

            await queryService.destroyPermanently();
        })

        await removeNotification(service.id)

        setDeleteModalVisible(false);
        navigate("home", { service: "deleted" });
    }

    return (
        <Container>
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
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={client && service.status === "scheduled" ? expandClientViewBottomSheet : expandClientAddBottomSheet}
                        >
                            {
                                client ? (
                                    <View className='flex-row items-center gap-x-2'>
                                        <MaterialIcons name='person' size={18} color={colors.text[100]} />
                                        <Text className='text-base text-text-100' style={{
                                            textDecorationLine: service.status === "scheduled" ? "underline" : "none",
                                        }}>
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
                    paddingBottom: 75,
                    rowGap: 20
                }}
                showsVerticalScrollIndicator={false}
            >
                {
                    servicesTypes && servicesTypes.length > 0 && (
                        <SubSectionWrapper
                            header={{
                                title: "Categorias",
                            }}
                            preset="smallMargin"
                        >
                            <View className='h-9 w-full'>
                                <FlatList
                                    horizontal
                                    className='w-full pr-10'
                                    contentContainerStyle={{}}
                                    nestedScrollEnabled
                                    showsHorizontalScrollIndicator={false}
                                    data={servicesTypes}
                                    renderItem={({ item, index }) => (
                                        <Tag {...item} />
                                    )}
                                />
                            </View>
                        </SubSectionWrapper>
                    )
                }

                {
                    subServices && subServices.length > 0 ? (
                        <SubSectionWrapper
                            header={{
                                title: "Serviços",
                            }}
                            preset="smallMargin"
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
                    ) : subServices === undefined && (
                        <ActivityIndicator color={colors.primary.green} size="small" />
                    )
                }

                {
                    materials && materials.length > 0 ? (
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
                    ) : subServices === undefined && (
                        <ActivityIndicator color={colors.primary.green} size="small" />
                    )
                }

                <SubSectionWrapper
                    header={{
                        title: "Ações",
                    }}
                    preset="smallMargin"
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

            </ScrollView>
            <View
                className='w-screen absolute bottom-0 px-6'
                style={{
                    paddingBottom: insets.bottom + 10,
                }}
            >
                <ActionButton
                    preset='next'
                    icon={"attach-money"}
                    label={"Gerar orçamento"}
                    disabled={subServices && subServices?.length === 0}
                    onPress={() => navigate("invoice", { serviceId: service.id })}
                />
            </View>
            {
                client && (
                    <ClientView
                        client={client}
                        service={service}
                    />
                )
            }
            <ClientAdd service={service} />
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
        </Container>
    )
}