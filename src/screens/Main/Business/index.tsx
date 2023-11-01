import React from "react";

import { useColorScheme } from "nativewind";

// Components
import Container, { ContainerScrollView } from "components/Container";
import NavigationButton from "components/NavigationButton";
import Toast from "components/Toast";
import ImagePicker from "components/ImagePicker";
import { TabBarScreenHeader } from "components/Header";

// Data
import type { BusinessData } from "./@types";
import { loggedNavigation } from "utils/planHandler";

// MMKV

export async function updateData(
    dataToUpdate: Partial<BusinessData>,
    businessData: BusinessData | Partial<BusinessData>,
    suppressToast?: boolean
) {
    const updatedData = {
        ...businessData,
        ...dataToUpdate,
    } as BusinessData;

    try {
        //globalStorage.set("currentBusiness", JSON.stringify(updatedData));

        if (!suppressToast) {
            Toast.show({
                preset: "success",
                title: "Tudo certo!",
                description:
                    "Os dados do seu negócio foram atualizados com sucesso.",
            });
        }

        console.log("Dados do negócio atualizados com sucesso.");
        return updatedData;
    } catch (error) {
        console.log(error);
        Toast.show({
            preset: "error",
            title: "Algo deu errado :(",
            description: "Não foi possível atualizar os dados do seu negócio.",
        });
        return false;
    }
}

export default function Business({ navigation }: { navigation: any }) {
    return (
        <Container>
            <TabBarScreenHeader title="Meu Negócio" navigation={navigation} />
            <ContainerScrollView
                style={{ paddingBottom: 25, paddingTop: 4, rowGap: 25 }}
            >
                <ImagePicker
                    label="Adicionar marca da empresa"
                    onPress={() => loggedNavigation(navigation, "branding")}
                />
                <NavigationButton
                    title="Informações Básicas"
                    description="Nome da empresa, endereço, CNPJ"
                    onPress={() => loggedNavigation(navigation, "basicInfo")}
                />
                <NavigationButton
                    title="Dados Complementares"
                    description="Mensagens padrão, assinatura digital"
                    onPress={() =>
                        loggedNavigation(navigation, "additionalInfo")
                    }
                />
                <NavigationButton
                    title="Marketplace"
                    description="Agenda, zona de atendimento"
                    onPress={() => loggedNavigation(navigation, "marketplace")}
                />
                <NavigationButton
                    title="Contato"
                    description="Telefone, e-mail, redes sociais"
                    onPress={() => loggedNavigation(navigation, "contact")}
                />
                <NavigationButton
                    title="Pagamentos"
                    description="Métodos de pagamento, moeda"
                    onPress={() => loggedNavigation(navigation, "payments")}
                />
                <NavigationButton
                    title="Categorias"
                    description="Defina em que ramos o seu negócio se encaixa"
                    onPress={() => loggedNavigation(navigation, "categories")}
                />
            </ContainerScrollView>
        </Container>
    );
}
