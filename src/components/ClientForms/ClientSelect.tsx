import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Text, View, TouchableOpacity } from "react-native";
import { FlatList } from 'react-native-gesture-handler';

import { MaterialIcons } from "@expo/vector-icons";
import colors, { primary } from 'global/colors';

// Types
import type { ClientModel } from 'database/models/clientModel';

// Components
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import Title from 'components/Title';
import { database } from 'database/index.native';

interface Props {
    lastBottomSheetRef: React.RefObject<BottomSheetActions>;
    bottomSheetRef: React.MutableRefObject<any>;
    onSelectClient?: (data: ClientModel) => void;
}

export default function ClientSelect({ lastBottomSheetRef, bottomSheetRef, onSelectClient }: Props) {
    const [clients, setClients] = useState<ClientModel[]>([]);

    const lastBottomSheetRefOpenHandler = useCallback(() => {
        lastBottomSheetRef.current?.expand();
    }, [])

    const bottomSheetCloseHandler = useCallback(() => {
        bottomSheetRef.current?.close();
    }, [])

    async function handleSelectClient(client: ClientModel) {
        bottomSheetCloseHandler();

        onSelectClient?.(client);
    }

    async function fetchClients() {
        const clients = await database
            .get<ClientModel>("clients")
            .query()
            .observe()

        setClients(clients as unknown as ClientModel[]);
    }

    useEffect(() => {
        fetchClients();
    }, [])

    return (
        <BottomSheet
            height={"35%"}
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
                <FlatList
                    data={clients}
                    renderItem={({ item }) => (
                        <ClientPreview
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
            </View>
        </BottomSheet>
    )
}

const ClientPreview = ({ client, onPress }: { client: ClientModel, onPress: () => void }) => {
    return (
        <View className='flex flex-row items-center gap-x-4'>
            <TouchableOpacity className='flex flex-1' onPress={onPress}>
                <View className='rounded-full w-9 h-9 bg-gray-100'>
                    <MaterialIcons name="person" size={18} color={colors.text[100]} />
                </View>
                <View className='flex-row items-center justify-start'>
                    <Text className='font-bold mr-2'>{client.name}</Text>
                    <Text className='text-gray-500'>{client.contact}</Text>
                </View>
            </TouchableOpacity>
            <View className='flex flex-row items-center justify-end gap-x-4'>
                <MaterialIcons name="delete" size={18} color={colors.primary.red} />
            </View>
        </View>
    )
}