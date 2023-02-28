import React, { useEffect, useRef } from 'react';
import { View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { runOnUI } from 'react-native-reanimated';

import colors from 'global/colors';

// Form
import { zodResolver } from '@hookform/resolvers/zod';
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';

// Utils
import { tags } from 'global/tags';
import { v4 as uuidv4 } from 'uuid';

// Components
import { ActionButton } from 'components/Button';
import BottomSheet, { Title } from 'components/BottomSheet';
import Input from 'components/Input';
import Label from 'components/Label';
import { TagsSelector } from 'components/TagsSelector';
import Toast from 'components/Toast';

// Types
import { MaterialModel } from 'database/models/materialModel';
import { SubServiceModel } from 'database/models/subServiceModel';

interface FormValues {
    description: string;
    details: string;
    price: string;
    amount: string;
};

const schema = z.object({
    description: z.string().min(5, { message: 'Insira uma descrição mais detalhada com no mínimo 5 caracteres.' }).max(50, { message: 'A descrição do serviço deve ter no máximo 40 caracteres.' }),
    details: z.string(),
    price: z.string().min(1, { message: 'É necessário inserir um valor para o serviço.' }),
    amount: z.string(),
});

interface Props {
    bottomSheetRef: React.MutableRefObject<any>;
    onSubmitForm?: (data: MaterialModel) => void;
    editableData?: SubServiceModel;
}

export default function SubServiceBottomSheet({ bottomSheetRef, onSubmitForm, editableData }: Props) {
    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o serviço."
        })
    }

    const selectedTags = useRef<string[]>([]);

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            description: "",
            details: "",
            price: "",
            amount: "1",
        },
        resolver: zodResolver(schema),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        mode: "onBlur"
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const tags = selectedTags.current;

        const newSubService = {
            id: editableData ? editableData.id : uuidv4(),
            description: data.description,
            details: data.details,
            price: parseFloat(data.price),
            amount: parseInt(data.amount),
            types: tags,
        };
        //console.log(newSubService)
        Toast.hide();

        setTimeout(() => {
            try {
                runOnUI(bottomSheetRef.current.close())();
            } catch { }
        }, 100);

        onSubmitForm && onSubmitForm(newSubService as unknown as MaterialModel);
        reset();
    };

    const onChange = (arg: any) => {
        return {
            value: arg.nativeEvent.text,
        };
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors).map(error => error.message).join('\n'))
    }

    useEffect(() => {
        if (editableData) {
            //console.log("Dados de edição inseridos.")
            selectedTags.current = editableData.types;
            reset({
                description: editableData.description,
                details: editableData.details ?? "",
                price: editableData.price.toString(),
                amount: editableData.amount.toString(),
            })
        }
    }, [editableData])

    return (
        <BottomSheet
            height={"65%"}
            ref={bottomSheetRef}
            onDismissed={() => {
                if (editableData) {
                    //console.log("Dados de edição removidos.")
                    reset({
                        description: "",
                        details: "",
                        price: "",
                        amount: "1",
                    });
                }
                selectedTags.current = [];
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
                    {editableData ? 'Editar Serviço' : 'Adicionar Serviço'}
                </Title>
                <ScrollView
                    className='flex flex-1 relative'
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 16,
                        rowGap: 20
                    }}
                >
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Descrição do Serviço'
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                value={value}
                                style={!!errors.description && borderErrorStyle}
                                placeholder='Ex: Aplicação de silicone em box de banheiro'
                                pallette='dark'
                                required
                            />
                        )}
                        name="description"
                        rules={{ required: true }}
                    />
                    <View className='flex-col w-full' style={{ rowGap: 20 }}>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label='Detalhes do Serviço'
                                    style={[{ minHeight: 100, paddingTop: 15 }, !!errors.details && borderErrorStyle]}
                                    multiline
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    value={value}
                                    pallette='dark'
                                    textAlignVertical={"top"}
                                    placeholder='Ex: O box precisa estar totalmente seco e limpo para a execução do serviço'
                                />
                            )}
                            name="details"
                            rules={{ required: false }}
                        />
                        <View className='flex-row w-full items-center justify-between'>
                            <View className='flex-1 mr-3'>
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <Input
                                            onBlur={onBlur}
                                            onChangeText={value => onChange(value)}
                                            value={value}
                                            style={!!errors.price && borderErrorStyle}
                                            label='Preço Unitário'
                                            placeholder='R$'
                                            pallette='dark'
                                            keyboardType={"number-pad"}
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
                                            onBlur={onBlur}
                                            onChangeText={value => onChange(value)}
                                            style={!!errors.amount && borderErrorStyle}
                                            value={value}
                                            label='Quantidade'
                                            pallette='dark'
                                            keyboardType={"number-pad"}
                                        />
                                    )}
                                    name="amount"
                                    rules={{ required: true }}
                                />
                            </View>
                        </View>
                    </View>
                    <View className='flex-col align-top justify-start'>
                        <Label>
                            Categorias
                        </Label>
                        <View className='mt-2'>
                            <TagsSelector
                                tags={tags.map(tag => ({ ...tag, checked: selectedTags.current.includes(tag.value) }))}
                                onSelectTags={(newTags) => {
                                    selectedTags.current = newTags.map(tag => tag.value)
                                }}
                                pallette="dark"
                            />
                        </View>
                    </View>
                </ScrollView>
                <ActionButton
                    label={editableData ? "Editar serviço" : "Adicionar serviço"}
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