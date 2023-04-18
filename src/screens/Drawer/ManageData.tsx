import React from "react";
import { View, Text } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container, { BusinessScrollView } from "components/Container";
import Header from "components/Header";

import { useAuth } from "context/AuthContext";
import Modal from "components/Modal";
import NavigationButton from "components/NavigationButton";

export default function ManageData() {
	const { signOut } = useAuth();
	const [isClearModalVisible, setClearModalVisible] = React.useState(false);

	return (
		<Container>
			<Header title="Gerenciar dados pessoais" returnButton />
			<BusinessScrollView>
				<NavigationButton
					title="Exportar dados"
					description="Receba um e-mail com um arquivo .csv contendo todos os dados do Seu Negócio atual"
					onPress={() => console.log("to-do")}
				/>
				<NavigationButton
					title="Excluir dados"
					description="Apague todos os dados em cache no aplicativo. Fazer isso requererá que você autentique-se novamente."
					onPress={() => setClearModalVisible(true)}
				/>
			</BusinessScrollView>
			<Modal
				title="Apagar dados"
				isVisible={isClearModalVisible}
				icon="delete"
				toggleVisibility={() =>
					setClearModalVisible(!isClearModalVisible)
				}
				message={`Tem certeza que deseja limpar todos os dados em cache do aplicativo?\nEssa ação não impactará os dados armazenados em sua conta, porém irá requerer que você entre novamente.`}
				buttons={[
					{
						label: "Excluir dados",
						onPress: signOut,
						color: colors.red,
					},
				]}
				cancelButton
			/>
		</Container>
	);
}
