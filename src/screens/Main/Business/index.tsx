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
import ImagePicker from 'components/ImagePicker';
import Toast from 'components/Toast';

import type { BusinessData } from './@types';
import Container, { BusinessScrollView } from 'components/Container';

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

export async function updateData(dataToUpdate: Partial<BusinessData>, businessData: BusinessData | Partial<BusinessData>, suppressToast?: boolean) {
    try {
        const updatedData = { ...businessData, ...dataToUpdate } as BusinessData;

        await database.localStorage.set('businessData', updatedData);

        if (!suppressToast) {
            Toast.show({
                preset: "success",
                title: "Tudo certo!",
                message: "Os dados do seu neg??cio foram atualizados com sucesso."
            })
        }

        //console.log("Dados do neg??cio atualizados com sucesso.")
        return updatedData;
    } catch (error) {
        console.log(error)
        Toast.show({
            preset: "error",
            title: "Algo deu errado :(",
            message: "N??o foi poss??vel atualizar os dados do seu neg??cio."
        })
        return false;
    }
}

export default function Business() {
    const { colorScheme } = useColorScheme();
    const { navigate } = useNavigation();

    const [businessData, setBusinessData] = React.useState<BusinessData | undefined>(undefined);

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

    return (
        <Container>
            <Header title='Meu Neg??cio' />
            <BusinessScrollView style={{ paddingBottom: 25, paddingTop: 4, rowGap: 20 }}>
                <ImagePicker
                    imageUri={businessData?.logo}
                    onUpdate={async (dataToUpdate) => {
                        if (!businessData) return;
                        const updatedData = await updateData({ logo: dataToUpdate }, businessData);
                        if (updatedData) {
                            setBusinessData(updatedData);
                        }
                    }}
                    label="Adicionar logotipo da empresa"
                    showDeleteButton
                />
                <NavigationButton
                    title='Informa????es B??sicas'
                    description='Nome, CNPJ e Raz??o Social'
                    onPress={() => navigate("basicInfo", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Dados Complementares'
                    description='Mensagens padr??o e assinatura digital'
                    onPress={() => navigate("additionalInfo", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Dados Banc??rios'
                    description='Conta banc??ria e chave PIX'
                    onPress={() => navigate("bankAccount", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Contato e Endere??o'
                    description='E-mail, telefone e endere??o'
                    onPress={() => navigate("contactAndAddress", { businessData: businessData })}
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
                    description='Defina em que ramos o seu neg??cio se encaixa'
                    onPress={() => navigate("categories", { businessData: businessData })}
                    colorScheme={colorScheme}
                />
                <NavigationButton
                    title='Configura????es'
                    description='Gerencie sua conta e personalize suas prefer??ncias'
                    onPress={() => navigate("settings", { businessData: businessData })}
                />
            </BusinessScrollView>
        </Container>
    )
}