import React from "react";
import { Text, View } from "react-native";

import colors from "global/colors";
import BusinessIcon from "assets/icons/business.svg";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/Form/SectionBottomSheet";

import { useAuth, userStorage } from "context/AuthContext";

import RegisterSection2 from "./Register/Sections/Section2";
import useUpdateHandler from "hooks/useUpdateHandler";
import { FlatList } from "react-native-gesture-handler";

const HEADERS = [
    {
        title: "Voilà! Sua conta já está pronta para ser usada!",
        subtitle: "Agora, chegou a hora de criar e adicionar um negócio a ela.",
    },
];

const sections = ["projectSelection"];

// The logic used behind the (!email) conditional is that if the user already created an account and reopened the app but didn't created a business yet, the app will redirect him to the register screen, but in the last section, so he can create a business.

export default function ProjectSelection({ navigation }: any) {
    const { signOut } = useAuth();

    const { BackButton } = useUpdateHandler({
        sections: sections,
        HEADERS,
    });

    const loggedUserEmail = userStorage.getString("email");

    const teste = false;

    return (
        <Container
            style={{
                rowGap: 10,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <BackButton
                customConfig={{
                    label: "Seu Negócio",
                    disabled: true,
                    suppressIcon: true,
                }}
            />

            <View className="bg-gray-500">
                {teste ? (
                    <>
                        <View
                            className="flex-col items-center justify-center"
                            style={{ rowGap: 10 }}
                        >
                            <BusinessIcon color={colors.white} />
                            <Text className="text-white text-2xl font-logoRegular text-center max-w-[80%] leading-[95%]">
                                Selecione um negócio para administrar
                            </Text>
                            <FlatList
                                data={[]}
                                renderItem={({ item }) => <Text>{item}</Text>}
                            />
                        </View>
                    </>
                ) : (
                    <RegisterSection2 navigation={navigation} />
                )}
            </View>

            <Text className="text-sm text-text-100 text-center font-regular py-1">
                Logado como {loggedUserEmail ?? "..."}
                {"  "}
                <Text
                    className="text-red font-medium underline"
                    onPress={() => {
                        signOut();
                    }}
                >
                    Sair
                </Text>
            </Text>
        </Container>
    );
}
