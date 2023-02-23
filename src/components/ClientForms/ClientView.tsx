import React, { useRef, useCallback } from 'react';
import { Text, View, TouchableOpacity, Linking } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors, { primary } from 'global/colors';

import WhatsAppIcon from 'src/assets/icons/whatsapp.svg'

// Types
import type { ServiceModel } from 'database/models/serviceModel';
import type { ClientModel } from 'database/models/clientModel';

// Components
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import Title from 'components/Title';
import ClientSelect from './ClientSelect';
import { ActionButton, SubActionButton } from 'components/ActionButton';
import ClientEdit from './ClientEdit';
import ClientAdd from './ClientAdd';
import { database } from 'database/index.native';

interface Props {
    bottomSheetRef: React.RefObject<BottomSheetActions>;
    client: ClientModel;
    service: ServiceModel;
}

export default function ClientView({ bottomSheetRef, client, service }: Props) {

    // Bottom Sheets
    const clientSelectBottomSheet = useRef<BottomSheetActions>(null);
    const clientSelectBottomSheetOpenHandler = useCallback(() => {
        clientSelectBottomSheet.current?.expand();
    }, [])

    const clientAddBottomSheetRef = useRef<BottomSheetActions>(null);

    const clientEditBottomSheet = useRef<BottomSheetActions>(null);
    const clientEditBottomSheetOpenHandler = useCallback(() => {
        clientEditBottomSheet.current?.expand();
    }, [])

    const bottomSheetCloseHandler = useCallback(() => {
        bottomSheetRef.current?.close();
    }, [])

    async function removeServiceClient() {
        bottomSheetCloseHandler();

        try {
            await database.write(async () => {
                await service.update((service: any) => {
                    service.client.id = null
                })
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <BottomSheet
            height={"47%"}
            ref={bottomSheetRef}
        >
            <View
                className='flex flex-1 gap-y-5 items-center justify-between'
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12
                }}
            >
                <View className='flex-col items-center justify-center'>
                    <Title ellipsizeMode="tail" numberOfLines={1}>
                        {client.name}
                    </Title>
                    <View className='flex-row items-center justify-center gap-x-4'>
                        <TouchableOpacity
                            className='flex-row mt-2 items-center justify-center'
                            activeOpacity={0.8}
                            onPress={() => {
                                const phoneNumber = client.contact!.replace(/\D/g, '');
                                Linking.openURL(`tel:${phoneNumber}`)
                            }}
                        >
                            <MaterialIcons name='phone' size={16} color={colors.text[200]} />
                            <Text className='text-black dark:text-text-200 text-base underline ml-2'>
                                {client.contact}
                            </Text>
                        </TouchableOpacity>
                        <View className='h-4 w-[1px] mt-2  bg-text-200' />
                        <TouchableOpacity
                            className='flex-row mt-2 items-center justify-center'
                            activeOpacity={0.8}
                            onPress={() => {
                                const phoneNumber = client.contact!.replace(/\D/g, '');
                                Linking.openURL(`whatsapp://send?text=&phone=${phoneNumber}`)
                            }}
                        >
                            <WhatsAppIcon width={16} height={16} color={colors.text[200]} />
                            <Text className='text-black dark:text-text-200 text-base ml-2'>
                                Conversar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className='rounded-full w-24 h-24 flex items-center justify-center bg-gray-100 mr-4'>
                    <MaterialIcons name="person" size={48} color={colors.text[100]} />
                </View>
                <ActionButton
                    icon='directions'
                    label='Visualizar rota'
                    onPress={() => { }}
                />
                <View className='flex-row w-full items-center justify-between'>
                    <View className='flex-1 mr-3'>
                        <SubActionButton
                            /* label='Editar dados' */
                            icon='edit'
                            preset='dashed'
                            borderColor={colors.primary.blue}
                            onPress={clientEditBottomSheetOpenHandler}
                        />
                    </View>
                    <View className='flex-1 mr-3'>
                        <SubActionButton
                            /* label='Alterar cliente' */
                            icon='swap-horiz'
                            preset='dashed'
                            borderColor={colors.primary.yellow}
                            onPress={() => {
                                bottomSheetCloseHandler();
                                clientSelectBottomSheetOpenHandler();
                            }}
                        />
                    </View>
                    <View className='flex-1'>
                        <SubActionButton
                            /* label='Alterar cliente' */
                            icon='do-not-disturb-on'
                            preset='dashed'
                            borderColor={colors.primary.red}
                            onPress={removeServiceClient}
                        />
                    </View>
                </View>
            </View>
            <ClientEdit
                bottomSheetRef={clientEditBottomSheet}
                lastBottomSheetRef={bottomSheetRef}
                client={client}
            />
            <ClientAdd
                bottomSheetRef={clientAddBottomSheetRef}
                service={service}
            />
            <ClientSelect
                bottomSheetRef={clientSelectBottomSheet}
                service={service}
                lastBottomSheetRef={bottomSheetRef}
            />
        </BottomSheet>
    )
}