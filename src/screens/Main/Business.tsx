import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from "expo-file-system";
import { Image } from 'expo-image';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';
import { useColorScheme } from 'nativewind';

// Components
import Header from 'components/Header';
import Input from 'components/Input';
import Toast from 'components/Toast';

// Form
import { borderErrorStyle } from 'components/ClientForms/ClientDataForm';
import { database } from 'database/index.native';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import formatWithMask, { MASKS } from 'utils/formatWithMask';

const NavigationButton = ({ title, onPress, colorScheme }: { title: string, onPress: () => void, colorScheme: "dark" | "light" }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPress}
            className='w-full flex-row items-center justify-between'
        >
            <Text className='font-semibold text-sm text-black dark:text-text-100'>
                {title}
            </Text>
            <MaterialIcons name='chevron-right' size={18} color={colorScheme === "dark" ? colors.text[100] : colors.black} />
        </TouchableOpacity>
    )
}

interface FormScheme {
    fantasyName: string;
    juridicalPerson: string;
    socialReason: string;
}

export interface PhoneAndAddressScheme {
    email: string;
    phone: string;
    phone2: string;
    postalCode: string;
    address: string;
}

export type BusinessData = FormScheme & PhoneAndAddressScheme & {
    logo?: string;
}

export default function Business() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const { navigate } = useNavigation();

    const [businessData, setBusinessData] = React.useState<BusinessData | undefined>(undefined);

    const showToast = (errorMessage?: string) => {
        Toast.show({
            preset: "error",
            title: "Eita! Algo deu errado.",
            message: errorMessage || "Não foi possível atualizar os dados do seu negócio."
        })
    }

    const { handleSubmit, control, reset, formState: { errors }, getValues } = useForm<FormScheme>({
        mode: 'onBlur',
        values: businessData ? {
            fantasyName: businessData?.fantasyName,
            juridicalPerson: businessData?.juridicalPerson,
            socialReason: businessData?.socialReason,
        } : undefined,
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        }
    });

    const onError: SubmitErrorHandler<FormScheme> = (errors, e) => {
        console.log(errors)
        showToast(Object.values(errors).map(error => error.type === "maxLength" ? "Você ultrapassou o limite de caracteres. Por favor, diminua o tamanho do texto inserido." : error.type).join('\n'))
    }

    const submitData = handleSubmit(async (data) => {
        const updatedData = { ...data, ...businessData }
        await database.localStorage.set('businessData', updatedData);
        console.log("Dados da empresa atualizados.")

        Toast.hide();
    }, onError);

    async function getBusinessData() {
        try {
            const data = await database.localStorage.get('businessData') as BusinessData;
            if (data /* && data !== "undefined" */) {
                console.log(data)
                setBusinessData(data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function getBusinessLogo() {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
        });

        if (result.type === 'success') {
            const { uri } = result;
            console.log("Nova imagem selecionada ", uri)
            const updatedBusinessData = { ...businessData, logo: uri } as BusinessData;
            setBusinessData(updatedBusinessData);
            await database.localStorage.set('businessData', updatedBusinessData);
        }
    }

    async function removeBusinessLogo() {
        FileSystem.deleteAsync(businessData?.logo as string);
        const updatedBusinessData = { ...businessData, logo: undefined } as BusinessData;
        setBusinessData(updatedBusinessData);
        await database.localStorage.set('businessData', updatedBusinessData);
    }

    useFocusEffect(
        useCallback(() => {
            getBusinessData()
        }, [])
    )

    return (
        <View className='flex-1 min-h-full px-6 pt-12' style={{ rowGap: 20 }}>
            <Header title='Meu Negócio'>
                {/* {
                            colorScheme === 'dark' ?
                                <Feather name='moon' size={24} color={colors.text[100]} onPress={toggleColorScheme} />
                                :
                                <Feather name='sun' size={24} color={colors.black} onPress={toggleColorScheme} />
                        } */}
            </Header>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 25, paddingTop: 4, rowGap: 20 }}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    className='w-full flex-col items-center justify-center px-12 gap-y-1 border rounded-lg border-dashed border-primary-green'
                    style={{ paddingTop: businessData && businessData.logo ? 5 : 50, paddingBottom: businessData && businessData.logo ? 5 : 50 }}
                    onPress={getBusinessLogo}
                >
                    {
                        businessData && businessData.logo ? (
                            <Image
                                source={{ uri: businessData?.logo }}
                                style={{ width: "100%", height: 200 }}
                                contentFit='contain'
                                transition={1000}
                            />
                        ) : (
                            <>
                                <MaterialIcons name='add-photo-alternate' size={32} color={colorScheme === "dark" ? colors.white : colors.black} />
                                <Text className='font-medium text-sm text-black dark:text-white'>
                                    Adicionar logotipo da empresa
                                </Text>
                            </>
                        )
                    }
                </TouchableOpacity>
                {
                    businessData && businessData.logo && (
                        <TouchableOpacity activeOpacity={0.7} onPress={removeBusinessLogo}>
                            <Text className='font-medium text-sm text-primary-red'>
                                Remover logotipo da empresa
                            </Text>
                        </TouchableOpacity>
                    )
                }
                <View>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Nome da Empresa'
                                value={value}
                                onBlur={() => {
                                    submitData()
                                    onBlur()
                                }}
                                onChangeText={value => onChange(value)}
                                style={!!errors.fantasyName && borderErrorStyle}
                            />
                        )}
                        name="fantasyName"
                        rules={{ maxLength: 30 }}
                    />
                </View>
                <View>
                    <NavigationButton title='Dados Bancários' onPress={() => navigate("bankAccount")} colorScheme={colorScheme} />
                </View>
                <View>
                    <NavigationButton title='Contato e Endereço' onPress={() => navigate("phoneAndAddress")} colorScheme={colorScheme} />
                </View>
                <View>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='CNPJ'
                                value={value}
                                onBlur={() => {
                                    submitData()
                                    onBlur()
                                }}
                                onChangeText={value => {
                                    const { masked } = formatWithMask({ text: value, mask: MASKS.BRL_CNPJ });
                                    onChange(masked)
                                }}
                                maxLength={17}
                                keyboardType='numeric'
                                style={!!errors.juridicalPerson && borderErrorStyle}
                            />
                        )}
                        name="juridicalPerson"
                    />
                </View>
                <View>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label='Razão Social'
                                value={value}
                                onBlur={() => {
                                    submitData()
                                    onBlur()
                                }}
                                onChangeText={value => onChange(value)}
                                style={!!errors.socialReason && borderErrorStyle}
                            />
                        )}
                        name="socialReason"
                        rules={{ maxLength: 80 }}
                    />
                </View>
                <View>
                    <NavigationButton title='Informações Adicionais' onPress={() => navigate("additionalInfo")} colorScheme={colorScheme} />
                </View>
                <View>
                    <NavigationButton title='Redes Sociais' onPress={() => navigate("socialMedia")} colorScheme={colorScheme} />
                </View>
            </ScrollView>
        </View>
    )
}