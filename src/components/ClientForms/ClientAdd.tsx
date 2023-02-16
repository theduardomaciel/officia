import React, { useRef, useCallback } from 'react';
import { Text, View, ViewStyle } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

// Form
import { useForm, Controller, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import colors, { primary } from 'global/colors';

// Types
import type { Tag } from 'components/TagsSelector';
import type { ClientModel } from 'database/models/clientModel';

// Components
import BottomSheet, { BottomSheetActions } from 'components/BottomSheet';
import Input from 'components/Input';
import { ActionButton, SubActionButton } from 'components/ActionButton';
import Title from 'components/Title';
import Toast from 'components/Toast';
import { runOnUI } from 'react-native-reanimated';
import ClientSelect from './ClientSelect';
import { database } from 'database/index.native';

const borderErrorStyle = {
    borderColor: colors.primary.red,
    borderWidth: 1,
    borderTopColor: colors.primary.red,
    borderBottomColor: colors.primary.red,
} as ViewStyle;

interface FormValues {
    name: string;
    contact: string;
    address: string;
};

const schema = z.object({
    name: z.string().min(2, { message: 'Insira um nome com pelo menos 2 caracteres.' }).max(40, { message: 'O nome do cliente possui um limite de 40 caracteres.' }),
    contact: z.string().min(1, { message: 'É necessário inserir um número de contato para o cliente.' }),
    address: z.string().max(100, { message: 'O endereço do cliente possui um limite de 100 caracteres.' }),
});

interface Props {
    bottomSheetRef: React.RefObject<BottomSheetActions>;
    onSubmitForm?: (data: ClientModel) => void;
}

export default function ClientAdd({ bottomSheetRef, onSubmitForm }: Props) {
    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o serviço."
        })
    }

    const selectedTags = useRef<Tag[] | null>(null);

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
                await database.get('clients').create((newClient: any) => {
                    newClient.name = client.name;
                    newClient.contact = client.contact;
                    newClient.address = client.address;
                })
            });
        } catch (error) {
            console.log(error)
        }
    }

    // Form
    const { register, setValue, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const tags = selectedTags.current?.map(tag => tag.value) ?? [];
        console.log(tags)

        const newClient = {
            name: data.name,
            phone: data.contact,
            address: data.address,
        };
        console.log(newClient)
        Toast.hide();

        // Inserimos o novo cliente no banco de dados
        handleCreate(newClient as unknown as ClientModel)

        try {
            runOnUI(bottomSheetRef.current?.close())('teste');
        } catch { }

        onSubmitForm && onSubmitForm(newClient as unknown as ClientModel);
        reset();
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
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
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label='Nome'
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    style={!!errors.name && borderErrorStyle}
                                    placeholder='Fulano da Silva'
                                    pallette='dark'
                                    required
                                />
                            )}
                            name="name"
                            rules={{ required: true }}
                        />
                        <View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Contato'
                                        style={!!errors.contact && borderErrorStyle}
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        pallette='dark'
                                        placeholder='(XX) X XXXX-XXXX'
                                        required
                                    />
                                )}
                                name="contact"
                                rules={{ required: true }}
                            />
                        </View>
                        <View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Endereço'
                                        style={!!errors.address && borderErrorStyle}
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        pallette='dark'
                                        placeholder=''
                                    />
                                )}
                                name="address"
                                rules={{ required: false }}
                            />
                        </View>
                    </View>
                </ScrollView>
                <ActionButton
                    label='Adicionar cliente'
                    icon='add'
                    onPress={handleSubmit(onSubmit, onError)}
                />
            </View>
            <ClientSelect bottomSheetRef={clientSelectBottomSheet} lastBottomSheetRef={bottomSheetRef} />
        </BottomSheet>
    )
}