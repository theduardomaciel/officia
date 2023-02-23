import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from "react-native";
/* import * as Location from "expo-location" */

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Header from 'components/Header';
import Input from 'components/Input';
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import Toast from 'components/Toast';

// Form
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { database } from 'database/index.native';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { BusinessData, PhoneAndAddressScheme } from './Main/Business';

export default function PhoneAndAddress() {
    const insets = useSafeAreaInsets();
    const [businessData, setBusinessData] = React.useState<BusinessData | undefined>(undefined);

    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Eita! Algo deu errado.",
            message: errorMessage || "Não foi possível atualizar os dados do seu negócio."
        })
    }

    const { handleSubmit, control, formState: { errors }, watch } = useForm<PhoneAndAddressScheme>({
        mode: 'onSubmit',
        values: businessData ? {
            email: businessData?.email,
            phone: businessData?.phone,
            phone2: businessData?.phone2,
            postalCode: businessData?.postalCode,
            address: businessData?.address,
        } : undefined,
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    const onError: SubmitErrorHandler<PhoneAndAddressScheme> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors).map(error => error.type === "maxLength" ? "Você ultrapassou o limite de caracteres. Por favor, diminua o tamanho do texto inserido." : error.type === "pattern" ? "O e-mail inserido é inválido." : error.type).join('\n'))
    }

    const submitData = handleSubmit(async (data) => {
        try {
            const updatedData = { ...data, ...businessData } as BusinessData;
            await database.localStorage.set('businessData', updatedData);
            setBusinessData(updatedData);

            Toast.show({
                preset: "success",
                title: "Sucesso!",
                message: "Os dados do seu negócio foram atualizados com sucesso."
            })

            setHasDifferences(false)
        } catch (error) {
            showToast();
        }
    }, onError);

    async function getBusinessData() {
        try {
            const data = await database.localStorage.get('businessData') as BusinessData;
            if (data) {
                //console.log(data)
                setBusinessData(data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getBusinessData()
        }, [])
    )

    /* async function getAddressFromPostalCode() {} */

    const [hasDifferences, setHasDifferences] = React.useState(false);

    React.useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            setHasDifferences(businessData?.phone !== value.phone || businessData?.phone2 !== value.phone2 || businessData?.postalCode !== value.postalCode || businessData?.address !== value.address || businessData?.email !== value.email)
        });
        return () => subscription.unsubscribe();
    }, [watch, businessData]);

    async function saveChanges() {
        if (hasDifferences) {
            Toast.show({
                preset: "success",
                title: "Salvando alterações...",
                message: "Aguarde enquanto atualizamos os dados do seu negócio."
            })
            await submitData();
        }
    }

    return (
        <View className='flex-1 min-h-full px-6 pt-12 gap-y-5'>
            <View>
                <Header title='Telefone e Endereço' returnButton />
            </View>
            <ScrollView contentContainerStyle={{ height: "100%", rowGap: 20 }}>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label='E-mail'
                            icon={{ name: 'mail', family: "MaterialIcons" }}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            keyboardType='email-address'
                            maxLength={50}
                            style={!!errors.email && borderErrorStyle}
                        />
                    )}
                    name="email"
                    rules={{ maxLength: 50, pattern: { value: /\S+@\S+\.\S+/, message: "E-mail inválido" } }}
                />
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label='Telefone'
                            icon={{ name: 'phone', family: "MaterialIcons" }}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={value => {
                                const { masked } = formatWithMask({ text: value, mask: MASKS.BRL_PHONE })
                                onChange(masked)
                            }}
                            keyboardType='phone-pad'
                            maxLength={15}
                            style={!!errors.phone && borderErrorStyle}
                        />
                    )}
                    name="phone"
                    rules={{ maxLength: 15 }}
                />
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            label='WhatsApp'
                            icon={{ name: 'whatsapp', family: "MaterialCommunityIcons" }}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={value => {
                                const { masked } = formatWithMask({ text: value, mask: MASKS.BRL_PHONE })
                                onChange(masked)
                            }}
                            keyboardType='phone-pad'
                            maxLength={15}
                            style={!!errors.phone2 && borderErrorStyle}
                        />
                    )}
                    name="phone2"
                    rules={{ maxLength: 15 }}
                />
                <SubSectionWrapper header={{ title: "Endereço", icon: "location-on" }}>
                    <View className='w-full'>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label='CEP'
                                    value={value}
                                    onBlur={() => {
                                        onBlur()
                                    }}
                                    onChangeText={value => {
                                        const { masked } = formatWithMask({ text: value, mask: MASKS.ZIP_CODE })
                                        onChange(masked)
                                    }}
                                    maxLength={9}
                                    keyboardType='number-pad'
                                    style={!!errors.postalCode && borderErrorStyle}
                                />
                            )}
                            name="postalCode"
                            rules={{ maxLength: 9 }}
                        />
                    </View>
                    <View className='w-full'>
                        <Controller
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label='Endereço'
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={value => onChange(value)}
                                    style={!!errors.address && borderErrorStyle}
                                />
                            )}
                            name="address"
                            rules={{ maxLength: 50 }}
                        />
                    </View>
                </SubSectionWrapper>
            </ScrollView>
            <KeyboardAvoidingView behavior="position" enabled>
                <TouchableOpacity
                    className='absolute w-14 h-14 rounded-full right-1 items-center justify-center'
                    activeOpacity={hasDifferences ? 0.7 : 1}
                    disabled={!hasDifferences}
                    onPress={saveChanges}
                    style={{
                        bottom: insets.bottom + 15,
                        backgroundColor: hasDifferences ? colors.primary.green : colors.text[200],
                        opacity: hasDifferences ? 1 : 0.5
                    }}
                >
                    <MaterialIcons name="save" size={28} color={colors.white} />
                </TouchableOpacity>
            </KeyboardAvoidingView>
            <Toast
                toastPosition='top'
                toastOffset='12.5%'
            />
        </View>
    )
}