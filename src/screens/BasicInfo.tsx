import React, { useCallback } from 'react';
import { BackHandler, ScrollView, View } from "react-native";

// Components
import Header from 'components/Header';
import Toast, { ToastProps } from 'components/Toast';
import Input from 'components/Input';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { database } from 'database/index.native';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';

// Type
import { basicInfoScheme, BasicInfoSchemeType, BusinessData, updateData } from './Main/Business';
import { FormProps } from 'components/BusinessForms/@types';
import SaveButton from 'components/BusinessForms/SaveButton';
import ConfirmExitModal from 'components/BusinessForms/ConfirmExitModal';

export function BasicInfo({ control, errors }: FormProps) {
    return (
        <ScrollView className='flex-1' contentContainerStyle={{ rowGap: 15 }}>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Nome da Empresa'
                        value={value}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        style={!!errors.fantasyName && borderErrorStyle}
                    />
                )}
                name="fantasyName"
                rules={{ maxLength: 50 }}
            />
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='CNPJ'
                        value={value}
                        onBlur={onBlur}
                        onChangeText={value => {
                            const { masked } = formatWithMask({ text: value, mask: MASKS.BRL_CNPJ });
                            onChange(masked)
                        }}
                        maxLength={18}
                        keyboardType='numeric'
                        style={!!errors.juridicalPerson && borderErrorStyle}
                    />
                )}
                name="juridicalPerson"
            />
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Razão Social'
                        value={value}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        style={!!errors.socialReason && borderErrorStyle}
                    />
                )}
                name="socialReason"
                rules={{ maxLength: 80 }}
            />
        </ScrollView>
    )
}

export default function BasicInfoScreen({ route, navigation }: any) {
    const { businessData: data }: { businessData: BusinessData } = route.params;
    const [businessData, setBusinessData] = React.useState<BusinessData>(data); // é necessário em todas as telas pois o parâmetro de comparação tem que mudar após a atualização dos dados
    const [hasDifferences, setHasDifferences] = React.useState(false);

    const { handleSubmit, control, formState: { errors }, getValues, watch, setFocus } = useForm<BasicInfoSchemeType>({
        mode: 'onSubmit',
        defaultValues: {
            fantasyName: "",
            juridicalPerson: "",
            socialReason: "",
        },
        values: businessData ? { ...businessData } : undefined,
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        resolver: zodResolver(basicInfoScheme)
    });

    const onError: SubmitErrorHandler<BasicInfoSchemeType> = (errors, e) => {
        console.log(errors)
        //setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
        Toast.show({
            preset: "error",
            title: "Algo está errado com os dados inseridos.",
            message: Object.values(errors).map(error => error.message).join('\n')
        })
    }

    const submitData = handleSubmit(async (data) => {
        const result = await updateData(getValues(), businessData, setBusinessData);
        if (result) {
            setHasDifferences(false)
        }
    }, onError);

    const [isConfirmExitModalVisible, setConfirmExitModalVisible] = React.useState(false);

    React.useEffect(() => {
        const subscription = watch((value) => {
            const screenData = {
                fantasyName: businessData?.fantasyName ?? "",
                juridicalPerson: businessData?.juridicalPerson ?? "",
                socialReason: businessData?.socialReason ?? "",
            }
            // Os valores dos inputs precisam estar vazios tanto no "screenData" como no "initialValues" para que o botão de salvar fique desabilitado.
            console.log(screenData, value)
            setHasDifferences(JSON.stringify(screenData) !== JSON.stringify(value))
        });

        const backAction = () => {
            if (hasDifferences) {
                setConfirmExitModalVisible(true);
                return true;
            } else {
                return false;
            }
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => {
            subscription.unsubscribe();
            backHandler.remove();
        };
    }, [watch, businessData]);

    return (
        <View className='flex-1 min-h-full px-6 pt-12' style={{ rowGap: 20 }}>
            <Header title='Informações Básicas' returnButton />
            <BasicInfo control={control} errors={errors} />
            <SaveButton hasDifferences={hasDifferences} submitData={submitData} />
            <Toast
                toastPosition='top'
                toastOffset='14%'
            />
            <ConfirmExitModal
                isVisible={isConfirmExitModalVisible}
                toggleVisibility={() => setConfirmExitModalVisible(false)}
                onExitConfirmation={() => {
                    navigation.goBack();
                }}
            />
        </View>
    )
}