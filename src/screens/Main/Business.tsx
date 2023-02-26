import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';

import { useColorScheme } from 'nativewind';
import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Header from 'components/Header';

// Data
import { database } from 'database/index.native';
import LogoPicker from 'components/LogoPicker';
import Toast from 'components/Toast';

interface NavigationButtonProps {
    title: string;
    description?: string;
    onPress: () => void;
    colorScheme?: "dark" | "light";
}

const NavigationButton = ({ title, description, onPress, colorScheme = "dark" }: NavigationButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={onPress}
            className='w-full flex-row items-center justify-between'
        >
            <View className='flex-col items-start justify-center'>
                <Text className='font-semibold text-sm text-black dark:text-text-100'>
                    {title}
                </Text>
                {
                    description && (
                        <Text className='font-normal text-xs text-black dark:text-text-200'>
                            {description}
                        </Text>
                    )
                }
            </View>
            <MaterialIcons name='chevron-right' size={18} color={colorScheme === "dark" ? colors.text[100] : colors.black} />
        </TouchableOpacity>
    )
}

export async function updateData(
    dataToUpdate: Partial<BusinessData>,
    businessData: BusinessData,
    setBusinessData: React.Dispatch<React.SetStateAction<BusinessData>>) {
    try {
        const updatedData = { ...businessData, ...dataToUpdate } as BusinessData;

        await database.localStorage.set('businessData', updatedData);
        setBusinessData(updatedData);

        Toast.show({
            preset: "success",
            title: "Tudo certo!",
            message: "Os dados do seu negócio foram atualizados com sucesso."
        })

        //console.log("Dados do negócio atualizados com sucesso.")
        return true;
    } catch (error) {
        console.log(error)
        Toast.show({
            preset: "error",
            title: "Algo deu errado :(",
            message: "Não foi possível atualizar os dados do seu negócio."
        })
        return false;
    }
}

/* export interface BasicInfoScheme {
    fantasyName: string;
    juridicalPerson: string;
    socialReason: string;
}

export interface ContactAndAddressScheme {
    email: string;
    phone: string;
    phone2?: string;
    postalCode: string;
    address?: string;
} */

// Form validation
import { z } from 'zod';

export const basicInfoScheme = z.object({
    fantasyName: z.string().min(1, "O nome da empresa não pode ser vazio.").max(50, "O nome da empresa deve ter no máximo 50 caracteres."),
    juridicalPerson: z.string().min(18, "O CNPJ deve ter 14 dígitos.").min(1, "O CNPJ não pode estar vazio."),
    socialReason: z.string().min(1, "A razão social da empresa não pode ser vazia.").max(80, "A razão social deve ter no máximo 80 caracteres."),
});

export type BasicInfoSchemeType = z.infer<typeof basicInfoScheme>;

export const contactAndAddressScheme = z.object({
    email: z.string().email({ message: "O e-mail inserido não é válido." }),
    phone: z.string({ required_error: "O telefone não pode estar vazio." }).min(15, { message: "O telefone inserido não é válido." }),
    phone2: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.string({ required_error: "O CEP não pode estar vazio." }).min(9, { message: "O CEP inserido não é válido." }),
});

export type ContactAndAddressSchemeType = z.infer<typeof contactAndAddressScheme>;

export type BusinessData = BasicInfoSchemeType & ContactAndAddressSchemeType & {
    logo?: string;
    geocodedAddress?: string;
}

export default function Business() {
    const { colorScheme } = useColorScheme();
    const { navigate } = useNavigation();

    const [businessData, setBusinessData] = React.useState<BusinessData | undefined>(undefined);

    async function getBusinessData() {
        try {
            const data = await database.localStorage.get('businessData') as BusinessData;
            if (data) {
                console.log(data)
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

    return (
        <View className='flex-1 min-h-full px-6 pt-12' style={{ rowGap: 20 }}>
            <Header title='Meu Negócio' />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 25, paddingTop: 4, rowGap: 20 }}
            >
                <LogoPicker
                    businessData={businessData}
                    setBusinessData={setBusinessData}
                    onUpdate={async (updatedBusinessData) => {
                        await database.localStorage.set('businessData', updatedBusinessData);
                    }}
                    showDeleteButton
                />
                <NavigationButton
                    title='Informações Básicas'
                    description='Nome, CNPJ e Razão Social'
                    onPress={() => navigate("basicInfo", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Informações Adicionais'
                    description='Descrição, horário de funcionamento e etc.'
                    onPress={() => navigate("additionalInfo", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Contato e Endereço'
                    description='E-mail, telefone e endereço'
                    onPress={() => navigate("contactAndAddress", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Dados Bancários'
                    description='Conta bancária e PIX'
                    onPress={() => navigate("bankAccount", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Redes Sociais'
                    description='Facebook, Instagram e etc.'
                    onPress={() => navigate("socialMedia", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Categorias'
                    description='Defina em que ramos o seu negócio se encaixa'
                    onPress={() => navigate("categories", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
            </ScrollView>
        </View>
    )
}