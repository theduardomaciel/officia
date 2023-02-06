import React, { useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { TouchableOpacity, View, ViewStyle, Text } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

// Form
import { useForm, Controller, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Utils
import { v4 as uuidv4 } from 'uuid';
import { tags } from 'global/tags';

import colors from 'global/colors';
import { MaterialIcons } from "@expo/vector-icons";

// Types
import type { Tag } from 'components/TagsSelector';

// Components
import BottomSheet from 'components/BottomSheet';
import Input from 'components/Input';
import Label from 'components/Label';
import { ActionButton, SubActionButton } from 'components/ActionButton';
import Title from 'components/Title';
import { TagsSelector } from 'components/TagsSelector';
import Toast from 'components/Toast';
import AddMaterial from './AddMaterial';
import { MaterialPreview } from 'components/ServicePreview';
import { MARGIN, SubSectionWrapper } from '../SubSectionWrapper';
import { SubServiceModel } from 'database/models/subServiceModel';
import { MaterialModel } from 'database/models/materialModel';

const borderErrorStyle = {
    borderColor: colors.primary.red,
    borderWidth: 1,
} as ViewStyle;

interface FormValues {
    description: string;
    details: string;
    price: string;
    amount: string;
};

const schema = z.object({
    description: z.string().min(10, { message: 'A descrição do serviço deve ter pelo menos 10 caracteres.' }).max(40, { message: 'A descrição do serviço deve ter no máximo 40 caracteres.' }),
    details: z.string(),
    price: z.string().min(1, { message: 'É necessário inserir um valor para o serviço.' }),
    amount: z.string(),
});

interface Props {
    serviceBottomSheetRef: React.MutableRefObject<any>;
    setSubServices: Dispatch<SetStateAction<SubServiceModel[]>>;
    materials: MaterialModel[];
    setMaterials: Dispatch<SetStateAction<MaterialModel[]>>;
}

export default function AddSubService({ setSubServices, serviceBottomSheetRef, materials, setMaterials }: Props) {
    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Por favor, preencha os campos corretamente.",
            message: errorMessage || "Não foi possível adicionar o serviço."
        })
    }

    const selectedTags = useRef<Tag[] | null>(null);

    const serviceBottomSheetCloseHandler = useCallback(() => {
        serviceBottomSheetRef.current.close();
        console.log("Fecou")
    }, [])

    const materialsBottomSheetRef = useRef<any>(null);
    const materialBottomSheetOpenHandler = useCallback(() => {
        materialsBottomSheetRef.current.expand();
    }, [])

    const { register, setValue, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            description: '',
            details: '',
            price: '',
            amount: '1',
        },
        resolver: zodResolver(schema),
    });

    const onSubmit: SubmitHandler<FormValues> = data => {
        const newSubService = {
            description: data.description,
            details: data.details,
            price: parseFloat(data.price),
            amount: parseInt(data.amount),
            types: selectedTags.current as any
        };
        console.log(newSubService)

        setSubServices((previousValue: SubServiceModel[]) => [...previousValue, newSubService as unknown as SubServiceModel]);

        setTimeout(() => {
            serviceBottomSheetCloseHandler();
        }, 100)

        Toast.hide();
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

    return (
        <BottomSheet
            height={"65%"}
            ref={serviceBottomSheetRef}
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
                    Adicionar serviço
                </Title>
                <ScrollView className='flex flex-1 gap-y-5 relative' showsVerticalScrollIndicator={false} contentContainerStyle={{
                    paddingBottom: 16
                }}>
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
                    <View>
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
                    </View>
                    <View className='flex-row w-full items-center justify-between' style={{ marginBottom: MARGIN }}>
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
                    <SubSectionWrapper
                        header={{
                            title: "Materiais",
                            children: materials && materials?.length > 0 && <Text className='font-medium text-primary-red text-xs opacity-80'>
                                Arraste para excluir
                            </Text>
                        }}
                    >
                        <View className='w-full'>
                            {
                                materials && materials?.length === 0 && (
                                    <Text className='text-sm text-center text-black dark:text-white mb-6'>
                                        Nenhum material adicionado.
                                    </Text>
                                )
                            }
                            {
                                materials.map((material, index) => (
                                    <View className='mb-4' key={index.toString()}>
                                        <MaterialPreview material={material} setMaterials={setMaterials} />
                                    </View>
                                ))
                            }
                        </View>
                        <SubActionButton
                            onPress={materialBottomSheetOpenHandler}
                            label='Adicionar material'
                        />
                    </SubSectionWrapper>
                    <View className='flex-col align-top justify-start'>
                        <Label>
                            Categorias
                        </Label>
                        <View className='mt-2'>
                            <TagsSelector
                                tags={tags}
                                onSelectTags={(newTags) => {
                                    selectedTags.current = newTags
                                }}
                                pallette="dark"
                            />
                        </View>
                    </View>
                </ScrollView>
                <ActionButton
                    label='Adicionar serviço'
                    icon='add'
                    onPress={handleSubmit(onSubmit, onError)}
                />
            </View>
            <AddMaterial materialsBottomSheetRef={materialsBottomSheetRef} setMaterials={setMaterials} />
        </BottomSheet>
    )
}