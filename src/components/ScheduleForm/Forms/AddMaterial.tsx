import React, { useRef, useCallback, Dispatch, SetStateAction, useState } from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

// Form
import { useForm, Controller, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Utils
import { v4 as uuidv4 } from 'uuid';

import { useColorScheme } from 'nativewind';
import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import BottomSheet from 'components/BottomSheet';
import Input from 'components/Input';
import Dropdown from 'components/Dropdown';
import { ActionButton } from 'components/ActionButton';
import Title from 'components/Title';
import Toast from 'components/Toast';

// Utils
import { MARGIN } from '../SubSectionWrapper';
import { MaterialModel } from 'database/models/materialModel';

const borderErrorStyle = {
    borderColor: colors.primary.red,
    borderWidth: 1,
} as ViewStyle;

const schema = z.object({
    name: z.string().max(40, { message: 'O nome do material deve ter no máximo 40 caracteres.' }),
    description: z.string(),
    price: z.string(),
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
    materialsBottomSheetRef: React.MutableRefObject<any>;
    setMaterials: Dispatch<SetStateAction<MaterialModel[]>>;
}

export default function AddMaterial({ materialsBottomSheetRef, setMaterials }: Props) {
    const { colorScheme } = useColorScheme();
    const [availability, setAvailability] = useState("unavailable");

    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o serviço."
        })
    }

    const bottomSheetCloseHandler = useCallback(() => {
        if (materialsBottomSheetRef.current) {
            materialsBottomSheetRef.current.close();
        } else {
            console.log('BottomSheet ref is null');
        }
    }, [])

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            description: '',
            price: "",
            amount: "1",
            profitMargin: "",
        },
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const newMaterial = {
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            amount: parseFloat(data.amount),
            profitMargin: parseFloat(data.profitMargin),
            availability: availability === "unavailable" ? false : true,
        };
        console.log(newMaterial)

        setMaterials((previousValue: MaterialModel[]) => [...previousValue, newMaterial as unknown as MaterialModel]);

        setTimeout(() => {
            bottomSheetCloseHandler();
        }, 100);

        Toast.hide();
        /* reset(); */
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors).map(error => error.message).join('\n'))
    }

    return (
        <BottomSheet height={"65%"} ref={materialsBottomSheetRef}>
            <View
                className='flex flex-1 gap-y-5'
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12
                }}
            >
                <Title>
                    Adicionar material
                </Title>
                <ScrollView className='flex flex-1 flex-col relative' showsVerticalScrollIndicator={false} contentContainerStyle={{
                    paddingBottom: 16,
                }}>
                    <View>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className='w-full flex-col items-center justify-center px-12 py-14 border rounded-lg border-dashed border-primary-green'
                            style={{ marginBottom: MARGIN }}
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
                                style={[!!errors.description && borderErrorStyle, { marginBottom: MARGIN }]}
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
                                style={[!!errors.description && borderErrorStyle, { marginBottom: MARGIN }]}
                                placeholder='Marca Tigre, 12mm, etc...'
                                pallette='dark'
                            />
                        )}
                        name="description"
                        rules={{ required: false }}
                    />
                    <View className='flex-row w-full items-center justify-between' style={{ marginBottom: MARGIN }}>
                        <View className='flex-1 mr-3'>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Preço Unitário'
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        value={value}
                                        style={!!errors.description && borderErrorStyle}
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
                                        style={!!errors.description && borderErrorStyle}
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
                                        style={!!errors.description && borderErrorStyle}
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
                    label='Adicionar material'
                    icon='add'
                    onPress={handleSubmit(onSubmit, onError)}
                />
            </View>
        </BottomSheet>
    )
}