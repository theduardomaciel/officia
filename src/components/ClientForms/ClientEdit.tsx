import React, { useRef, useCallback } from 'react';
import { Text, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { runOnUI } from 'react-native-reanimated';

import { MaterialIcons } from "@expo/vector-icons";
import colors, { primary } from 'global/colors';

// Form
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Types
import type { ServiceModel } from 'database/models/serviceModel';
import type { ClientModel } from 'database/models/clientModel';

// Components
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import { ActionButton, SubActionButton } from 'components/ActionButton';
import Title from 'components/Title';
import Toast from 'components/Toast';
import ClientSelect, { ClientDeleteModal } from './ClientSelect';

import { database } from 'database/index.native';
import ClientDataForm, { ClientFormValues, clientSchema } from './ClientDataForm';
import ClientAdd from './ClientAdd';

interface Props {
    bottomSheetRef: React.RefObject<BottomSheetActions>;
    lastBottomSheetRef: React.RefObject<BottomSheetActions>;
    client: ClientModel;
}

export default function ClientEdit({ bottomSheetRef, lastBottomSheetRef, client }: Props) {
    const [isDeleteModalVisible, setDeleteModalVisible] = React.useState(false);

    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o cliente."
        })
    }

    const bottomSheetCloseHandler = useCallback(() => {
        bottomSheetRef.current?.close();
    }, [])

    async function handleUpdate(updatedClient: ClientModel) {
        try {
            await database.write(async () => {
                await client.update((clientToUpdate: any) => {
                    if (updatedClient.name) {
                        clientToUpdate.name = updatedClient.name;
                    }
                    if (updatedClient.contact) {
                        clientToUpdate.contact = updatedClient.contact;
                    }
                    if (updatedClient.address) {
                        clientToUpdate.address = updatedClient.address;
                    }
                })
            });
        } catch (error) {
            console.log(error)
        }
    }

    // Form
    const { handleSubmit, control, reset, formState: { errors } } = useForm<ClientFormValues>({
        defaultValues: {
            name: client.name,
            contact: client.contact!,
            address: client.address ?? undefined,
        },
        resolver: zodResolver(clientSchema),
        mode: 'onBlur',
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    const onSubmit: SubmitHandler<ClientFormValues> = data => {
        const updatedClient = {
            name: data.name,
            contact: data.contact,
            address: data.address,
        };
        //console.log(updatedClient)
        Toast.hide();

        // Inserimos o novo cliente no banco de dados
        handleUpdate(updatedClient as unknown as ClientModel)

        setTimeout(() => {
            try {
                runOnUI(bottomSheetRef.current?.close())();
                runOnUI(lastBottomSheetRef.current?.expand())();
            } catch { }
        }, 100);

        reset();
    };

    const onError: SubmitErrorHandler<ClientFormValues> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors).map(error => error.message).join('\n'))
    }

    return (
        <BottomSheet
            height={"60%"}
            ref={bottomSheetRef}
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
                    Editar cliente
                </Title>
                <ScrollView className='flex flex-1 relative' showsVerticalScrollIndicator={false} contentContainerStyle={{
                    paddingBottom: 16,
                }}>
                    <View className='gap-y-5 w-full items-center justify-center'>
                        <View className='rounded-full w-24 h-24 flex items-center justify-center bg-gray-100 mr-4 mb-8'>
                            <MaterialIcons name="person" size={48} color={colors.text[100]} />
                        </View>
                        <ClientDataForm
                            control={control}
                            errors={errors}
                        />
                        <SubActionButton
                            label='Remover cliente'
                            icon='delete'
                            onPress={() => {
                                bottomSheetCloseHandler();
                                setDeleteModalVisible(true);
                            }}
                            borderColor={colors.primary.red}
                            preset="dashed"
                        />
                    </View>
                </ScrollView>
                <ActionButton
                    label='Editar cliente'
                    style={{ backgroundColor: colors.primary.blue }}
                    icon='edit'
                    onPress={handleSubmit(onSubmit, onError)}
                />
            </View>
            <ClientDeleteModal
                isVisible={isDeleteModalVisible}
                setVisible={setDeleteModalVisible}
                client={client}
            />
        </BottomSheet>
    )
}