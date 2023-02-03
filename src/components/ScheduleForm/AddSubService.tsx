import React, { useRef, useCallback, Dispatch, SetStateAction, useEffect } from 'react';
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

// Form
import { useForm, Controller, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Utils
import { v4 as uuidv4 } from 'uuid';
import { tags } from 'global/tags';
import colors from 'global/colors';

// Types
import type { SubService } from 'types/service';
import type { Tag } from 'components/TagsSelector';

// Components
import BottomSheet from 'components/BottomSheet';
import Input from 'components/Input';
import Label from 'components/Label';
import ActionButton from 'components/ActionButton';
import Title from 'components/Title';
import { TagsSelector } from 'components/TagsSelector';
import { Toast } from 'components/Toast';

const borderErrorStyle = {
    borderColor: colors.primary.red,
    borderWidth: 1,
} as ViewStyle;

type FormValues = {
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

export default function AddSubService({ setSubServices, serviceBottomSheetRef }: { serviceBottomSheetRef: React.MutableRefObject<any>, setSubServices: Dispatch<SetStateAction<SubService[]>> }) {
    const showToast = (errorMessage?: string) => {
        Toast.show({
            toastOffset: "30%",
            toastProps: {
                preset: "error",
                title: "Por favor, preencha os campos corretamente.",
                message: errorMessage || "Não foi possível adicionar o serviço."
            },
        })
    }

    const selectedTags = useRef<Tag[] | null>(null);

    const serviceBottomSheetCloseHandler = useCallback(() => {
        serviceBottomSheetRef.current.close();
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
            id: uuidv4(),
            description: data.description,
            details: data.details,
            price: parseFloat(data.price),
            amount: parseInt(data.amount),
            types: selectedTags.current as any
        } as SubService;
        console.log(newSubService)

        setSubServices((previousValue: SubService[]) => [...previousValue, newSubService]);
        serviceBottomSheetCloseHandler();
    };

    const onChange = (arg: any) => {
        return {
            value: arg.nativeEvent.text,
        };
    };

    const onError: SubmitErrorHandler<FormValues> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors)[0].message as string)
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
                    <View className='flex-col align-top justify-start gap-y-2'>
                        <Label>
                            Categorias
                        </Label>
                        <View>
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
            {/* <Toast
                ref={toastRef}
                toastProps={toastProps}
                toastPosition="top"
                toastOffset={"80%"}
            /> */}
        </BottomSheet>
    )
}