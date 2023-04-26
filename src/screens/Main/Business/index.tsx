import React from "react";

import { useColorScheme } from "nativewind";

// Components
import Container, { BusinessScrollView } from "components/Container";
import NavigationButton from "components/NavigationButton";
import Toast from "components/Toast";
import { TabBarScreenHeader } from "components/Header";

// Data
import type { BusinessData } from "./@types";

// MMKV
import { globalStorage } from "context/AuthContext";

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
		globalStorage.set("currentBusiness", JSON.stringify(updatedData));

		if (!suppressToast) {
			Toast.show({
				preset: "success",
				title: "Tudo certo!",
				message:
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
			message: "Não foi possível atualizar os dados do seu negócio.",
		});
		return false;
	}
}

export default function Business({ navigation }: { navigation: any }) {
	return (
		<Container>
			<TabBarScreenHeader title="Meu Negócio" navigation={navigation} />
			<BusinessScrollView
				style={{ paddingBottom: 25, paddingTop: 4, rowGap: 20 }}
			>
				{/* <ImagePicker
					imageUri={businessData?.logo}
					onUpdate={async (dataToUpdate) => {
						if (!businessData) return;
						const updatedData = await updateData(
							{ logo: dataToUpdate },
							businessData
						);
						if (updatedData) {
							setBusinessData(updatedData);
						}
					}}
					label="Adicionar logotipo da empresa"
					showDeleteButton
				/> */}
				<NavigationButton
					title="Informações Básicas"
					description="Nome, CNPJ e Razão Social"
					onPress={() => navigation.navigate("basicInfo")}
				/>
				<NavigationButton
					title="Dados Complementares"
					description="Mensagens padrão e assinatura digital"
					onPress={() => navigation.navigate("additionalInfo")}
				/>
				<NavigationButton
					title="Dados Bancários"
					description="Conta bancária e chave PIX"
					onPress={() => navigation.navigate("bankAccount")}
				/>
				<NavigationButton
					title="Contato e Endereço"
					description="E-mail, telefone e endereço"
					onPress={() => navigation.navigate("contactAndAddress")}
				/>
				<NavigationButton
					title="Redes Sociais"
					description="Facebook, Instagram e etc."
					onPress={() => navigation.navigate("socialMedia")}
				/>
				<NavigationButton
					title="Categorias"
					description="Defina em que ramos o seu negócio se encaixa"
					onPress={() => navigation.navigate("categories")}
				/>
				<NavigationButton
					title="Configurações"
					description="Gerencie sua conta e personalize suas preferências"
					onPress={() => navigation.navigate("settings")}
				/>
			</BusinessScrollView>
		</Container>
	);
}
