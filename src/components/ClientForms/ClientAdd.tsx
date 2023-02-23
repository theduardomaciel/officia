import React, { useRef, useCallback } from 'react';
import { Text, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { runOnUI } from 'react-native-reanimated';

// Form
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import colors, { primary } from 'global/colors';

// Types
import type { ServiceModel } from 'database/models/serviceModel';
import type { ClientModel } from 'database/models/clientModel';

// Components
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import { ActionButton, SubActionButton } from 'components/ActionButton';
import Title from 'components/Title';
import Toast from 'components/Toast';
import ClientSelect from './ClientSelect';

import { database } from 'database/index.native';
import ClientDataForm, { ClientFormValues, clientSchema } from './ClientDataForm';

interface Props {
    bottomSheetRef: React.RefObject<BottomSheetActions>;
    service: ServiceModel;
    onSubmitForm?: (data: ClientModel) => void;
}

export default function ClientAdd({ bottomSheetRef, service, onSubmitForm }: Props) {
    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o cliente."
        })
    }

    // Bottom Sheets and Dropdowns
    const clientSelectBottomSheet = useRef<BottomSheetActions>(null);
    const clientSelectBottomSheetOpenHandler = useCallback(() => {
        clientSelectBottomSheet.current?.expand();
    }, [])

    const clientAddBottomSheetCloseHandler = useCallback(() => {
        bottomSheetRef.current?.close();
    }, [])

    async function handleCreate(client: ClientModel) {
        try {
            await database.write(async () => {
                const newClient = await database.get('clients').create((newClient: any) => {
                    newClient.name = client.name;
                    newClient.contact = client.contact;
                    newClient.address = client.address;
                })
                await service.update((service: any) => {
                    service.client.set(newClient)
                })
            });
        } catch (error) {
            console.log(error)
        }
    }

    // Form
    const { handleSubmit, control, reset, formState: { errors } } = useForm<ClientFormValues>({
        defaultValues: {
            name: '',
            contact: '',
            address: '',
        },
        resolver: zodResolver(clientSchema),
        mode: 'onBlur',
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    const onSubmit: SubmitHandler<ClientFormValues> = data => {
        const newClient = {
            name: data.name,
            contact: data.contact,
            address: data.address,
        };
        //console.log(newClient)
        Toast.hide();

        // Inserimos o novo cliente no banco de dados
        handleCreate(newClient as unknown as ClientModel)

        setTimeout(() => {
            try {
                runOnUI(bottomSheetRef.current?.close())();
            } catch { }
        }, 100);

        /* onSubmitForm && onSubmitForm(newClient as unknown as ClientModel); */
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
                    Adicionar dados do cliente
                </Title>
                <ScrollView className='flex flex-1 relative' showsVerticalScrollIndicator={false} contentContainerStyle={{
                    paddingBottom: 16,
                }}>
                    <View className='gap-y-5'>
                        <SubActionButton
                            label='Selecionar cliente existente'
                            onPress={() => {
                                clientSelectBottomSheetOpenHandler();
                                clientAddBottomSheetCloseHandler();
                            }}
                            borderColor={colors.primary.green}
                            preset="dashed"
                        />
                        <View className='w-full flex items-center justify-center mb-4'>
                            <Text className='text-black dark:text-white text-sm'>ou</Text>
                        </View>
                        <ClientDataForm control={control} errors={errors} />
                    </View>
                </ScrollView>
                <ActionButton
                    label='Adicionar cliente'
                    icon='add'
                    onPress={handleSubmit(onSubmit, onError)}
                />
            </View>
            <ClientSelect bottomSheetRef={clientSelectBottomSheet} service={service} lastBottomSheetRef={bottomSheetRef} />
        </BottomSheet>
    )
}