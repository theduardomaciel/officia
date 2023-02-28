import { TouchableOpacity, View, Text } from "react-native";
import { Image } from 'expo-image';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from "expo-file-system";

// Visuals
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Types
import type { BusinessData } from "screens/Main/Business/@types";

interface Props {
    businessData: BusinessData | Partial<BusinessData> | undefined;
    onUpdate: (updatedData: Partial<BusinessData>) => void;
    showDeleteButton?: boolean;
}

export default function LogoPicker({ businessData, onUpdate, showDeleteButton }: Props) {
    const { colorScheme } = useColorScheme();

    async function getBusinessLogo() {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
        });

        if (result.type === 'success') {
            const { uri } = result;
            console.log("Nova imagem selecionada ", uri)
            onUpdate({ logo: uri })
        }
    }

    async function removeBusinessLogo() {
        if (businessData) {
            FileSystem.deleteAsync(businessData?.logo as string, { idempotent: true });
            onUpdate({ logo: undefined })
        }
    }

    return (
        <View className="flex-col items-start justify-center" style={{ rowGap: 10 }}>
            <TouchableOpacity
                activeOpacity={0.8}
                className='w-full flex-col items-center justify-center px-12 border'
                style={{
                    paddingTop: businessData && businessData.logo ? 5 : 50,
                    paddingBottom: businessData && businessData.logo ? 5 : 50,
                    borderRadius: 8,
                    borderColor: colors.primary.green,
                    borderWidth: 1,
                    borderStyle: "dashed",
                }}
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
                showDeleteButton && businessData && businessData.logo && (
                    <TouchableOpacity activeOpacity={0.7} onPress={removeBusinessLogo}>
                        <Text className='font-medium text-sm text-primary-red'>
                            Remover logotipo da empresa
                        </Text>
                    </TouchableOpacity>
                )
            }
        </View>
    )
}