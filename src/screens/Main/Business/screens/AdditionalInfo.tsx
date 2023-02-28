import React, { useCallback } from 'react';
import { View, Text, ScrollView, BackHandler, TouchableOpacity } from "react-native";
import { Image } from 'expo-image';

import { useColorScheme } from 'nativewind';
import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container, { BusinessScrollView } from 'components/Container';
import Header from 'components/Header';
import Toast from 'components/Toast';
import Input from 'components/Input';
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';

import SaveButton from 'components/Business/SaveButton';
import ConfirmExitModal from 'components/Business/ConfirmExitModal';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { updateData } from 'screens/Main/Business';

// Types
import { BusinessData, additionalInfoScheme, AdditionalInfoSchemeType } from '../@types';

export default function AdditionalInfoScreen({ route, navigation }: any) {
    const { businessData: data }: { businessData: BusinessData, update: boolean } = route.params;
    const [businessData, setBusinessData] = React.useState<BusinessData>(data); // é necessário em todas as telas pois o parâmetro de comparação tem que mudar após a atualização dos dados
    const screenData = {
        defaultMessage: businessData.defaultMessage ?? "",
        defaultWarrantyDetails: businessData.defaultWarrantyDetails ?? "",
    } as AdditionalInfoSchemeType;

    const [hasDifferences, setHasDifferences] = React.useState(false);

    const { colorScheme } = useColorScheme();

    const { handleSubmit, control, formState: { errors }, getValues, watch } = useForm<AdditionalInfoSchemeType>({
        mode: 'onSubmit',
        defaultValues: {
            defaultMessage: "",
            defaultWarrantyDetails: "",
        },
        values: businessData ? screenData : undefined,
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
        resolver: zodResolver(additionalInfoScheme)
    });

    const onError: SubmitErrorHandler<AdditionalInfoSchemeType> = (errors, e) => {
        console.log(errors)
        //setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
        Toast.show({
            preset: "error",
            title: "Algo está errado com os dados inseridos.",
            message: Object.values(errors).map(error => error.message).join('\n')
        })
    }

    const submitData = handleSubmit(async (data) => {
        const result = await updateData(getValues(), businessData);
        if (result) {
            setBusinessData(result);
            setHasDifferences(false)
        }
    }, onError);

    const [isConfirmExitModalVisible, setConfirmExitModalVisible] = React.useState(false);

    React.useEffect(() => {
        const subscription = watch((value) => {
            // Os valores dos inputs precisam estar vazios tanto no "screenData" como no "initialValues" para que o botão de salvar fique desabilitado.
            console.log(screenData, "data")
            console.log(value, "value")
            if (value) {
                setHasDifferences(JSON.stringify(screenData) !== JSON.stringify(value))
            }
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
        <Container>
            <Header title='Dados Complementares' returnButton />
            <BusinessScrollView>
                <SubSectionWrapper
                    header={{
                        title: "Mensagens Padrão",
                        description: "Estas mensagens serão inseridas caso seus respectivos campos durante a criação do serviço não tenham sido especificados."
                    }}
                >
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Informações Adicionais'
                                placeholder='[não especificado]'
                                value={value}
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                multiline
                                style={!!errors.defaultMessage && borderErrorStyle}
                            />
                        )}
                        name="defaultMessage"
                        rules={{ maxLength: 50 }}
                    />
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Condições da Garantia'
                                placeholder='[não especificado]'
                                value={value}
                                onBlur={onBlur}
                                onChangeText={value => onChange(value)}
                                multiline
                                style={!!errors.defaultWarrantyDetails && borderErrorStyle}
                            />
                        )}
                        name="defaultWarrantyDetails"
                        rules={{ maxLength: 50 }}
                    />
                </SubSectionWrapper>
                <SubSectionWrapper header={{ title: "Assinatura Digital", icon: "brush" }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className='w-full flex-col items-center justify-center px-12 gap-y-1 border rounded-lg border-dashed border-primary-green'
                        style={{
                            paddingTop: businessData && businessData.digitalSignatureUri ? 0 : 50,
                            paddingBottom: businessData && businessData.digitalSignatureUri ? 0 : 50,
                            paddingLeft: businessData && businessData.digitalSignatureUri ? 5 : 50,
                            paddingRight: businessData && businessData.digitalSignatureUri ? 5 : 50,
                        }}
                        onPress={() => navigation.navigate('digitalSignature', { businessData })}
                    >
                        {
                            businessData && businessData.digitalSignatureUri ? (
                                <Image
                                    source={{ uri: businessData?.digitalSignatureUri }}
                                    style={{ width: "100%", height: 175 }}
                                    contentFit='cover'
                                    transition={1000}
                                />
                            ) : (
                                <>
                                    <MaterialIcons
                                        name='brush'
                                        size={32}
                                        color={colorScheme === "dark" ? colors.white : colors.black}
                                    />
                                    <Text className='font-medium text-sm text-black dark:text-white'>
                                        Adicionar assinatura digital
                                    </Text>
                                </>
                            )
                        }
                    </TouchableOpacity>
                </SubSectionWrapper>
            </BusinessScrollView>
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
        </Container>
    )
}