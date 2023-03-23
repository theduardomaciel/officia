import React, { useEffect, useState } from 'react';
import { View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

// Form
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';

// Utils
import { v4 as uuidv4 } from 'uuid';
import colors from 'global/colors';

// Components
import { ActionButton } from 'components/Button';
import BottomSheet from 'components/BottomSheet';
import Dropdown from 'components/Dropdown';
import Input from 'components/Input';
import Toast from 'components/Toast';

// Utils
import { borderErrorStyle } from 'utils/errorBorderStyle';
import { MaterialModel } from 'database/models/materialModel';
import ImagePicker from 'components/ImagePicker';

const schema = z.object({
    name: z.string({ required_error: 'É necessário inserir um nome para o material ser adicionado.' }),
    description: z.string(),
    price: z.string().default('0'),
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
    onSubmitForm?: (data: MaterialModel) => void;
    editableData?: MaterialModel;
}

export default function MaterialBottomSheet({ onSubmitForm, editableData = undefined }: Props) {
    const [availability, setAvailability] = useState(editableData?.availability ? "available" : "unavailable" ?? "unavailable");
    const [materialImage, setMaterialImage] = useState(editableData?.image_url ?? undefined);

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
            price: (data.price.length > 0 ? parseFloat(data.price) : 0),
            amount: data.amount ? parseFloat(data.amount) : 1,
            profitMargin: (data.profitMargin ? parseFloat(data.profitMargin) : 0),
            availability: availability === "unavailable" ? false : true,
            image_url: materialImage,
        };
        //console.log(newMaterial)
        Toast.hide();

        BottomSheet.close("materialBottomSheet");

        setMaterialImage(undefined);
        onSubmitForm && onSubmitForm(newMaterial as unknown as MaterialModel);
        reset();
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        //console.log(errors)
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
            setMaterialImage(editableData?.image_url ?? undefined);
            setAvailability(editableData?.availability ? "available" : "unavailable" ?? "unavailable");
        } else {
            reset({
                name: "",
                description: "",
                price: "",
                amount: "1",
                profitMargin: "",
            });
        }
    }, [editableData])

    return (
        <BottomSheet
            height={"78%"}
            id={"materialBottomSheet"}
        >
            <View
                className='flex flex-1 gap-y-5'
                style={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12
                }}
            >
                <BottomSheet.Title>
                    {editableData ? "Editar" : "Adicionar"} material
                </BottomSheet.Title>
                <ScrollView
                    className='flex flex-1 flex-col relative'
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 16,
                        rowGap: 20
                    }}
                >
                    <ImagePicker
                        imageUri={materialImage}
                        onUpdate={(imageUri) => setMaterialImage(imageUri)}
                        label='Adicionar imagem do produto'
                    />
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
                                bottomSheetLabel=''
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