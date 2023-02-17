import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, FlatList } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors, { primary } from 'global/colors';

// Types
import type { ClientModel } from 'database/models/clientModel';

// Components
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import Title from 'components/Title';
import { database } from 'database/index.native';
import EmptyMessage from 'components/EmptyMessage';
import { ServiceModel } from 'database/models/serviceModel';
import Modal from 'components/Modal';
import { Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { SubActionButton } from 'components/ActionButton';
import ClientAdd from './ClientAdd';

interface Props {
    lastBottomSheetRef: React.RefObject<BottomSheetActions>;
    bottomSheetRef: React.MutableRefObject<any>;
    service: ServiceModel;
    onSelectClient?: (data: ClientModel) => void;
}

export default function ClientSelect({ lastBottomSheetRef, bottomSheetRef, service }: Props) {
    const [clients, setClients] = useState<ClientModel[]>([]);

    const lastBottomSheetRefOpenHandler = useCallback(() => {
        lastBottomSheetRef.current?.expand();
    }, [])

    const bottomSheetCloseHandler = useCallback(() => {
        bottomSheetRef.current?.close();
    }, [])

    async function handleSelectClient(client: ClientModel) {
        bottomSheetCloseHandler();

        try {
            await database.write(async () => {
                await service.update((service: any) => {
                    service.client.id = client.id
                })
            })
        } catch (error) {
            console.log("Não foi")
        }

        console.log('foi')
        /* onSelectClient?.(client); */
    }

    async function fetchClients() {
        await database
            .get<ClientModel>("clients")
            .query()
            .observe().subscribe((clients) => {
                setClients(clients)
            })
    }

    useEffect(() => {
        fetchClients();
    }, [])

    return (
        <BottomSheet
            height={/* clientAddBottomSheetRef ? "40%" : */ "35%"}
            ref={bottomSheetRef}
            /* onExpand={fetchClients} */
            onDismiss={lastBottomSheetRefOpenHandler}
        >
            <View
                className='flex flex-1 gap-y-5'
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12
                }}
            >
                <Title>
                    Selecionar cliente
                </Title>
                {
                    clients.length > 0 ? (
                        <FlatList
                            data={clients}
                            renderItem={({ item }) => (
                                <EnhancedClientPreview
                                    client={item}
                                    onPress={() => handleSelectClient(item)}
                                />
                            )}
                            className='flex flex-1 relative'
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingBottom: 16,
                            }}
                        />
                    ) : (
                        <View className='flex flex-1 items-center justify-center'>
                            <EmptyMessage message='Nenhum cliente foi adicionado até o momento.' />
                        </View>
                    )
                }
                {/* {
                    clientAddBottomSheetOpenHandler && (
                        <SubActionButton
                            onPress={() => {
                                bottomSheetCloseHandler();
                                clientAddBottomSheetOpenHandler();
                            }}
                            icon="add"
                            label='Adicionar cliente'
                            preset='dashed'
                        />
                    )
                } */}
            </View>
        </BottomSheet>
    )
}

async function deleteClient(client: ClientModel) {
    console.log("teste")
    await database.write(async () => {
        const servicesWithClient = await database
            .get<ServiceModel>("services")
            .query(Q.where("client_id", client.id))
            .fetch()

        await Promise.all(servicesWithClient.map(async (service) => {
            await service.update((service: any) => {
                service.client.id = null;
            })
        }))

        await client.destroyPermanently();
    })
}

interface ConfirmDeleteModalProps {
    isVisible: boolean;
    setVisible: (value: boolean) => void;
    client: ClientModel;
}

export function ClientDeleteModal({ isVisible, setVisible, client }: ConfirmDeleteModalProps) {
    return (
        <Modal
            isVisible={isVisible}
            setVisible={(value: boolean) => setVisible(value)}
            title={"Você tem certeza?"}
            message="Os dados do cliente não poderão ser recuperados."
            icon="delete"
            buttons={[
                {
                    label: "Remover",
                    onPress: () => {
                        deleteClient(client)
                    },
                    color: primary.red,
                    closeOnPress: true,
                }
            ]}
            cancelButton
        />
    )
}

const ClientPreview = ({ client, onPress }: { client: ClientModel, onPress: () => void }) => {
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

    return (
        <View className='flex flex-row items-center gap-x-4 mb-4'>
            <TouchableOpacity className='flex flex-1 flex-row items-center justify-start' activeOpacity={0.7} onPress={onPress}>
                <View className='rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 mr-4'>
                    <MaterialIcons name="person" size={18} color={colors.text[100]} />
                </View>
                <View className='flex-col items-start justify-center'>
                    <Text className='font-titleSemiBold text-base text-white mr-2'>{client.name}</Text>
                    <Text className='text-sm text-text-200'>{client.contact ?? "Não possui contato"}</Text>
                </View>
            </TouchableOpacity>
            <View className='flex flex-row items-center justify-end gap-x-4'>
                <MaterialIcons name="delete" size={18} color={colors.primary.red} onPress={() => setDeleteModalVisible(true)} />
            </View>
            <ClientDeleteModal
                isVisible={isDeleteModalVisible}
                setVisible={setDeleteModalVisible}
                client={client}
            />
        </View>
    )
}

const enhance = withObservables(['client'], ({ client }) => ({
    client
}))

const EnhancedClientPreview = enhance(ClientPreview)