import React from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location"

import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Container, { BusinessScrollView } from 'components/Container';
import Header from 'components/Header';
import Input from 'components/Input';
import Toast from 'components/Toast';
import { SubSectionWrapper } from 'components/ScheduleForm/SubSectionWrapper';
import SaveButton from 'components/Business/SaveButton';

// Form
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import formatWithMask, { MASKS } from 'utils/formatWithMask';
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { updateData } from 'screens/Main/Business';

// Types
import { BusinessData, contactAndAddressScheme, ContactAndAddressSchemeType, FormProps } from 'screens/Main/Business/@types';

interface ContactAndAddressProps {
    businessData: BusinessData | Partial<BusinessData>;
    onAddressFetch: (addressText: string | undefined) => void;
}

export function ContactAndAddress({ businessData, control, errors, onAddressFetch }: FormProps & ContactAndAddressProps) {
    const [isFetchingLocation, setFetchingLocation] = React.useState(false);

    async function getPostalCodeAddress() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    message: "É necessário que a permissão de localização seja concedida para que o endereço do CEP seja identificado automaticamente.",
                    title: "Permissão negada",
                    preset: "error",
                })
                return;
            }

            setFetchingLocation(true)

            const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const addressFetched = await Location.reverseGeocodeAsync(coords);
            const address = addressFetched[0];

            //console.log(address)
            /* 
                [0] = street
                [1] = name or streetNumber
                [2] = district (Bairro)
                [3] = city
                [4] = region (Estado)
                [5] = country
            */
            const addressText = address.street + ", " + (address.name ?? address.streetNumber ?? "") + ", " + address.district + ", " + (address.city ?? address.subregion) + ", " + address.region + ", " + address.country;

            onAddressFetch(addressText);
            setFetchingLocation(false);
        } catch (error) {
            console.log(error)
            Toast.show({
                title: "Ops! Algo deu errado.",
                message: "Não foi possível obter o endereço do seu negócio. Por favor, tente novamente.",
                preset: "error",
            })
        }
    }

    const decodedGeocodedAddress = businessData?.geocodedAddress ? businessData.geocodedAddress.split(", ").map(geo => geo) : undefined;

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
            //rules={{ maxLength: 50, pattern: { value: /\S+@\S+\.\S+/, message: "E-mail inválido" } }}
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
                            <Input
                                label='CEP'
                                value={value}
                                onBlur={onBlur}
                                onChangeText={value => {
                                    const { masked } = formatWithMask({ text: value, mask: MASKS.ZIP_CODE })
                                    onChange(masked)
                                }}
                                maxLength={9}
                                keyboardType='number-pad'
                                style={!!errors.postalCode && borderErrorStyle}
                                appendedChildren={
                                    <TouchableOpacity
                                        className='flex items-center justify-center p-3 px-4 rounded-lg ml-2'
                                        disabled={!value || value && value.length < 9 ? true : false || isFetchingLocation}
                                        activeOpacity={0.7}
                                        onPress={businessData?.geocodedAddress ? () => onAddressFetch(undefined) : getPostalCodeAddress}
                                        style={{
                                            backgroundColor: businessData?.geocodedAddress || !value || value && value.length < 9 ? colors.gray[200] : colors.primary.green,
                                        }}
                                    >
                                        {
                                            isFetchingLocation ? (
                                                <ActivityIndicator size={"small"} color={colors.white} />
                                            ) : (
                                                <MaterialCommunityIcons name={businessData?.geocodedAddress ? "close" : 'map'} size={18} color={businessData?.geocodedAddress || !value || value.length < 9 ? colors.text[200] : colors.white} />
                                            )
                                        }
                                    </TouchableOpacity>
                                }
                            />
                        )}
                        name="postalCode"
                    />
                </View>
                {
                    businessData?.geocodedAddress ? (
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
                                        label='Informações Adicionais'
                                        infoMessage={`informações que não podem ser obtidas automaticamente, como número, complemento, etc.`}
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
                                        onBlur={() => {
                                            getPostalCodeAddress()
                                            onBlur()
                                        }}
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
    const currentData = {
        email: data?.email ?? "",
        phone: data?.phone ?? "",
        phone2: data?.phone2 ?? "",
        postalCode: data?.postalCode ?? "",
        address: data?.address ?? "",
        geocodedAddress: data.geocodedAddress ?? ""
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
            phone2: businessData?.phone2,
            postalCode: businessData?.postalCode,
            address: businessData?.address,
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
            setHasDifferences(false)
        }
    }, onError);

    React.useEffect(() => {
        const subscription = watch((value) => {
            setHasDifferences(JSON.stringify(value) !== JSON.stringify(currentData))
        });
        return () => subscription.unsubscribe();
    }, [watch, businessData]);

    return (
        <Container>
            <Header title='Contato e Endereço' returnButton />
            <ContactAndAddress
                businessData={businessData}
                control={control}
                errors={errors}
                onAddressFetch={(addressText) => {
                    setValue("address", "")
                    setHasDifferences(true)
                    setBusinessData({ ...businessData, geocodedAddress: addressText })
                    /* updateData({ geocodedAddress: addressText }, businessData, setBusinessData); */
                }}
            />
            <SaveButton hasDifferences={hasDifferences} submitData={submitData} />
            <Toast
                toastPosition='top'
                toastOffset='14%'
            />
        </Container>
    )
}