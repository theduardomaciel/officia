import React from "react";
import { View } from "react-native";

// Components
import Input from 'components/Input';
import Toast from 'components/Toast';
import AddressFetch from "components/AddressFetch";
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import { BusinessScrollView } from 'components/Container';

import BusinessLayout, { ChangesObserver } from "../Layout";
import { updateData } from 'screens/Main/Business';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { borderErrorStyle } from 'utils/errorBorderStyle';

// Types
import { BusinessData, contactAndAddressScheme, ContactAndAddressSchemeType, FormProps } from 'screens/Main/Business/@types';

interface ContactAndAddressProps {
    businessData: BusinessData | Partial<BusinessData>;
    onAddressFetch: (addressText: string | undefined) => void;
}

export function ContactAndAddress({ businessData, control, errors, onAddressFetch }: FormProps & ContactAndAddressProps) {
    const decodedGeocodedAddress = businessData.geocodedAddress ? businessData.geocodedAddress.split(", ").map(geo => geo) : undefined;

    return (
        <BusinessScrollView>
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
                        autoCapitalize='none'
                        style={!!errors.email && borderErrorStyle}
                    />
                )}
                name="email"
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
            />
            <SubSectionWrapper header={{ title: "Endereço", icon: "location-on" }}>
                <View className='w-full'>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AddressFetch
                                value={value}
                                onBlur={onBlur}
                                label='CEP'
                                style={!!errors.postalCode && borderErrorStyle}
                                onChangeText={value => {
                                    const { masked } = formatWithMask({ text: value, mask: MASKS.ZIP_CODE })
                                    onChange(masked)
                                }}
                                geocodedAddress={businessData.geocodedAddress}
                                onAddressFetch={onAddressFetch}
                            />
                        )}
                        name="postalCode"
                    />
                </View>
                {
                    businessData.geocodedAddress ? (
                        <View className='flex-col w-full' style={{ rowGap: 15 }}>
                            <Input
                                label='Logradouro'
                                value={decodedGeocodedAddress && decodedGeocodedAddress[0]}
                                pallette="disabled"
                            />
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Endereço Adicional'
                                        infoMessage={`Tudo aquilo que não pode ser obtido automaticamente como: número da casa/apartamento, complemento, etc.`}
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={value => onChange(value)}
                                        style={!!errors.address && borderErrorStyle}
                                        maxLength={50}
                                    />
                                )}
                                name="address"
                            />
                            <Input
                                label='Bairro'
                                value={decodedGeocodedAddress && decodedGeocodedAddress[2]}
                                pallette="disabled"
                            />
                            <Input
                                label='Cidade'
                                value={decodedGeocodedAddress && decodedGeocodedAddress[3]}
                                pallette="disabled"
                            />
                            <Input
                                label='Estado'
                                value={decodedGeocodedAddress && decodedGeocodedAddress[4]}
                                pallette="disabled"
                            />
                            <Input
                                label='País'
                                value={decodedGeocodedAddress && decodedGeocodedAddress[5]}
                                pallette="disabled"
                            />
                        </View>
                    ) : (
                        <View className='w-full'>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label='Endereço'
                                        value={value}
                                        onBlur={onBlur}
                                        maxLength={100}
                                        onChangeText={value => onChange(value)}
                                        style={!!errors.address && borderErrorStyle}
                                    />
                                )}
                                name="address"
                            />
                        </View>
                    )
                }
            </SubSectionWrapper>
        </BusinessScrollView>
    )
}

export default function ContactAndAddressScreen({ route }: any) {
    const { businessData: data }: { businessData: BusinessData } = route.params;
    const [businessData, setBusinessData] = React.useState<BusinessData>(data);
    const screenData = {
        email: businessData?.email ?? "",
        phone: businessData?.phone ?? "",
        phone2: businessData.phone2 ?? "",
        postalCode: businessData?.postalCode ?? "",
        address: businessData?.address ?? "",
    } as ContactAndAddressSchemeType;

    const [hasDifferences, setHasDifferences] = React.useState(false);

    const { handleSubmit, control, formState: { errors }, watch, setValue, getValues } = useForm<ContactAndAddressSchemeType>({
        mode: 'onSubmit',
        defaultValues: {
            email: "",
            phone: "",
            phone2: "",
            postalCode: "",
            address: "",
        },
        values: businessData ? {
            email: businessData?.email,
            phone: businessData?.phone,
            phone2: businessData?.phone2 ?? "",
            postalCode: businessData?.postalCode,
            address: businessData?.address ?? "",
        } : undefined,
        resolver: zodResolver(contactAndAddressScheme),
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    const onError: SubmitErrorHandler<ContactAndAddressSchemeType> = (errors, e) => {
        //console.log(errors)
        Toast.show({
            preset: "error",
            title: "Algo está errado com os dados inseridos.",
            message: Object.values(errors).map(error => error.message).join('\n')
        })
    }

    const submitData = handleSubmit(async (data) => {
        // Por algum motivo (talvez por conta da renderização condicional dos inputs de "address"?), o valor do campo "address" não é enviado junto com os outros dados do formulário no (data), portanto, teremos que usar o método "getValues".
        const result = await updateData(getValues(), businessData);
        if (result) {
            setBusinessData(result);
        }
        setHasDifferences(false)
    }, onError);

    return (
        <BusinessLayout
            headerProps={{
                title: "Contato e Endereço",
            }}
            hasDifferences={hasDifferences}
            submitData={submitData}
        >
            <ChangesObserver
                setHasDifferences={setHasDifferences}
                currentData={screenData}
                watch={watch}
            >
                <ContactAndAddress
                    businessData={businessData}
                    control={control}
                    errors={errors}
                    onAddressFetch={(addressText) => {
                        setValue("address", "")
                        setHasDifferences(true)
                        setBusinessData({ ...businessData, geocodedAddress: addressText })
                    }}
                />
            </ChangesObserver>
        </BusinessLayout>
    )
}