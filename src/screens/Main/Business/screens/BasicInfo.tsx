import React from 'react';
import { BackHandler, ScrollView, View } from "react-native";

// Components
import Container, { BusinessScrollView } from 'components/Container';
import Header from 'components/Header';
import Toast from 'components/Toast';
import Input from 'components/Input';

import SaveButton from 'components/Business/SaveButton';
import ConfirmExitModal from 'components/Business/ConfirmExitModal';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { updateData } from 'screens/Main/Business';

// Type
import { basicInfoScheme, BasicInfoSchemeType, BusinessData, FormProps } from 'screens/Main/Business/@types';

export function BasicInfo({ control, errors }: FormProps) {
    return (
        <BusinessScrollView>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                        label='Nome Fantasia'
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
                        label='Razão Social'
                        infoMessage={`termo registrado sob o qual uma pessoa jurídica (PJ) se individualiza e exerce suas atividades\nExemplo: Coca Cola Indústrias Ltda.`}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={value => onChange(value)}
                        style={!!errors.socialReason && borderErrorStyle}
                    />
                )}
                name="socialReason"
                rules={{ maxLength: 80 }}
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
        </BusinessScrollView>
    )
}

export default function BasicInfoScreen({ route, navigation }: any) {
    const { businessData: data }: { businessData: BusinessData } = route.params;
    const [businessData, setBusinessData] = React.useState<BusinessData>(data); // é necessário em todas as telas pois o parâmetro de comparação tem que mudar após a atualização dos dados
    const screenData = {
        fantasyName: businessData?.fantasyName ?? "",
        juridicalPerson: businessData?.juridicalPerson ?? "",
        socialReason: businessData?.socialReason ?? "",
    }

    const [hasDifferences, setHasDifferences] = React.useState(false);

    const { handleSubmit, control, formState: { errors }, getValues, watch, setFocus } = useForm<BasicInfoSchemeType>({
        mode: 'onSubmit',
        defaultValues: {
            fantasyName: "",
            juridicalPerson: "",
            socialReason: "",
        },
        values: businessData ? screenData : undefined,
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
        const result = await updateData(getValues(), businessData);
        if (result) {
            setHasDifferences(false)
            console.log(hasDifferences)
            setBusinessData(result);
        }
    }, onError);

    const [isConfirmExitModalVisible, setConfirmExitModalVisible] = React.useState(false);

    React.useEffect(() => {
        const subscription = watch((value) => {
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
        <Container>
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
        </Container>
    )
}