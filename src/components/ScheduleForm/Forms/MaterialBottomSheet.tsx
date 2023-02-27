import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

// Form
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';

// Utils
import { v4 as uuidv4 } from 'uuid';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import { useColorScheme } from 'nativewind';

// Components
import { ActionButton } from 'components/ActionButton';
import BottomSheet from 'components/BottomSheet';
import Dropdown from 'components/Dropdown';
import Input from 'components/Input';
import Title from 'components/Title';
import Toast from 'components/Toast';

// Utils
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { MaterialModel } from 'database/models/materialModel';
import { runOnUI } from 'react-native-reanimated';

const schema = z.object({
    name: z.string().max(40, { message: 'O nome do material deve ter no máximo 40 caracteres.' }).min(3, { message: 'O nome do material deve ter no mínimo 3 caracteres.' }),
    description: z.string(),
    price: z.string().min(1, { message: 'É necessário inserir um preço válido para o material.' }),
    amount: z.string(),
    profitMargin: z.string(),
});

interface FormValues {
    name: string;
    description: string;
    price: string;
    amount: string;
    profitMargin: string;
};

interface Props {
    bottomSheetRef: React.MutableRefObject<any>;
    onSubmitForm?: (data: MaterialModel) => void;
    editableData?: MaterialModel;
}

export default function MaterialBottomSheet({ bottomSheetRef, onSubmitForm, editableData = undefined }: Props) {
    const { colorScheme } = useColorScheme();

    const [availability, setAvailability] = useState(editableData?.availability ? "available" : "unavailable" ?? "unavailable");

    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o serviço."
        })
    }

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: editableData?.name ?? "",
            description: editableData?.description ?? "",
            price: editableData?.price.toString() ?? "",
            amount: editableData?.amount.toString() ?? "1",
            profitMargin: editableData?.profitMargin?.toString() ?? "",
        },
        resolver: zodResolver(schema),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        mode: "onBlur"
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const newMaterial = {
            id: editableData ? editableData.id : uuidv4(),
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            amount: (data.amount ? parseFloat(data.amount) : 1) ?? 1,
            profitMargin: (data.profitMargin ? parseFloat(data.profitMargin) : 0),
            availability: availability === "unavailable" ? false : true,
        };
        console.log(newMaterial)
        Toast.hide();

        setTimeout(() => {
            try {
                runOnUI(bottomSheetRef.current.close())();
            } catch { }
        }, 100);

        onSubmitForm && onSubmitForm(newMaterial as unknown as MaterialModel);
        reset();
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors).map(error => error.message).join('\n'))
    }

    useEffect(() => {
        if (editableData) {
            reset({
                name: editableData.name,
                description: editableData.description,
                price: editableData.price.toString(),
                amount: editableData.amount.toString(),
                profitMargin: editableData.profitMargin?.toString() ?? "",
            });
        }
    }, [editableData])

    return (
        <BottomSheet
            height={"78%"}
            ref={bottomSheetRef}
            onDismissed={() => {
                if (editableData) {
                    reset({
                        name: "",
                        description: "",
                        price: "",
                        profitMargin: "",
                        amount: "1",
                    });
                }
            }}
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
                    {editableData ? "Editar" : "Adicionar"} material
                </Title>
                <ScrollView
                    className='flex flex-1 flex-col relative'
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 16,
                        rowGap: 20
                    }}
                >
                    <View>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className='w-full flex-col items-center justify-center px-12 py-14 border rounded-lg border-dashed border-primary-green'
                            style={{ marginBottom: 20 }}
                        >
                            <MaterialIcons name='add-photo-alternate' size={32} color={colorScheme === "dark" ? colors.white : colors.black} />
                            <Text className='font-medium text-sm text-black dark:text-white mt-1'>
                                Adicionar imagem do produto
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Material'
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                value={value}
                                style={[!!errors.name && borderErrorStyle]}
                                placeholder='Painel LED de sobreposição, etc...'
                                pallette='dark'
                                required
                            />
                        )}
                        name="name"
                        rules={{ required: true }}
                    />
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Descrição'
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                value={value}
                                style={[!!errors.description && borderErrorStyle]}
                                placeholder='Marca Tigre, 12mm, etc...'
                                pallette='dark'
                            />
                        )}
                        name="description"
                        rules={{ required: false }}
                    />
                    <View className='flex-row w-full items-center justify-between'>
                        <View className='flex-1 mr-3'>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Preço Unitário'
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        style={!!errors.price && borderErrorStyle}
                                        placeholder='R$'
                                        keyboardType='number-pad'
                                        pallette='dark'
                                        required
                                    />
                                )}
                                name="price"
                                rules={{ required: true }}
                            />
                        </View>
                        <View className='flex-1'>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Quantidade'
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        style={!!errors.amount && borderErrorStyle}
                                        placeholder='1 item'
                                        keyboardType='number-pad'
                                        pallette='dark'
                                        required
                                    />
                                )}
                                name="amount"
                                rules={{ required: true }}
                            />
                        </View>
                    </View>
                    <View className='flex-row w-full items-center justify-between'>
                        <View className='flex-1 mr-3'>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Margem de Lucro'
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        style={!!errors.profitMargin && borderErrorStyle}
                                        placeholder='0%'
                                        keyboardType='number-pad'
                                        pallette='dark'
                                    />
                                )}
                                name="profitMargin"
                                rules={{ required: false }}
                            />
                        </View>
                        <View className='flex-1'>
                            <Dropdown
                                label='Disponibilidade'
                                bottomSheetHeight={"20%"}
                                setSelected={setAvailability}
                                selected={availability}
                                pallette='dark'
                                data={[
                                    { label: "Disponível", value: "available" },
                                    { label: "Indisponível", value: "unavailable" }
                                ]} />
                        </View>
                    </View>
                </ScrollView>
                <ActionButton
                    label={`${editableData ? "Editar" : "Adicionar"} material`}
                    icon={editableData ? "edit" : "add"}
                    style={{
                        backgroundColor: editableData ? colors.primary.blue : colors.primary.green
                    }}
                    onPress={handleSubmit(onSubmit, onError)}
                />
            </View>
        </BottomSheet>
    )
}