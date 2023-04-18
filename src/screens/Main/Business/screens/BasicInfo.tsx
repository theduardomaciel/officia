import React from 'react';

// Components
import { BusinessScrollView } from 'components/Container';
import Toast from 'components/Toast';
import Input from 'components/Input';

import BusinessLayout, { ChangesObserver } from '../Layout';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { borderErrorStyle } from 'utils/errorBorderStyle';
import { updateData } from 'screens/Main/Business';

// Type
import { basicInfoScheme, BasicInfoSchemeType, BusinessData, FormProps } from 'screens/Main/Business/@types';
import { Checkbox } from 'components/Checkbox';

export function BasicInfo({ control, errors, setValue, getValues }: FormProps & { setValue: (name: any, value: any) => void, getValues: () => any }) {
    const [isFormalCheckboxChecked, setIsFormalCheckboxChecked] = React.useState(getValues().juridicalPerson === '');

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
            {
                !isFormalCheckboxChecked && (
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
                )
            }
            <Checkbox
                preset='dark'
                customKey='formality'
                title='Não possuo uma empresa formal'
                checked={isFormalCheckboxChecked}
                onPress={() => {
                    setIsFormalCheckboxChecked(!isFormalCheckboxChecked);
                    setValue && setValue('juridicalPerson', '');
                }}
            />
        </BusinessScrollView>
    )
}

export default function BasicInfoScreen({ route }: any) {
    const { businessData: data }: { businessData: BusinessData } = route.params;
    const [businessData, setBusinessData] = React.useState<BusinessData>(data);
    // este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar junto com a atualização dos dados

    const screenData = {
        fantasyName: businessData?.fantasyName ?? "",
        juridicalPerson: businessData?.juridicalPerson ?? "",
        socialReason: businessData?.socialReason ?? "",
    }

    const [hasDifferences, setHasDifferences] = React.useState(false);

    const { handleSubmit, control, formState: { errors }, getValues, watch, setValue } = useForm<BasicInfoSchemeType>({
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
        //console.log(errors)
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
            setBusinessData(result);
        }
    }, onError);

    return (
        <BusinessLayout
            headerProps={{
                title: 'Informações Básicas',
            }}
            hasDifferences={hasDifferences}
            submitData={submitData}
        >
            <ChangesObserver
                setHasDifferences={setHasDifferences}
                currentData={screenData}
                watch={watch}
            >
                <BasicInfo control={control} errors={errors} setValue={setValue} getValues={getValues} />
            </ChangesObserver>
        </BusinessLayout>
    )
}