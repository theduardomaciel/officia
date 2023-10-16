import React, { useState } from "react";
import { View, Text } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container, { ContainerScrollView } from "components/Container";
import Header from "components/Header";

import { useAuth } from "context/AuthContext";
import Modal from "components/Modal";
import NavigationButton from "components/NavigationButton";

export default function ManageData() {
	const { signOut } = useAuth();
	const [clearDataModalSection, setClearDataModalSection] = useState(0);

	return (
		<Container>
			<Header title="Gerenciar dados pessoais" returnButton />
			<ContainerScrollView>
				<NavigationButton
					title="Exportar dados"
					description="Receba um e-mail com um arquivo .csv contendo todos os dados do Seu Negócio atual"
					onPress={() => console.log("to-do")}
				/>
				<NavigationButton
					title="Excluir dados"
					description="Apague todos os dados em cache no aplicativo. Fazer isso requererá que você autentique-se novamente."
					onPress={() => setClearDataModalSection(1)}
				/>
			</ContainerScrollView>
			<Modal.Multisection
				currentSection={clearDataModalSection}
				setCurrentSection={setClearDataModalSection}
				closeOnBackdropPress
				sections={[
					{
						title: "Apagar dados",
						icon: "delete",
						description: `Tem certeza que deseja limpar todos os dados em cache do aplicativo?\nEssa ação não impactará os dados armazenados em sua conta, porém irá requerer que você entre novamente.`,
						buttons: [
							{
								label: "Excluir dados",
								onPress: signOut,
								color: colors.red,
							},
						],
						cancelButton: true,
					},
				]}
			/>
		</Container>
	);
}
