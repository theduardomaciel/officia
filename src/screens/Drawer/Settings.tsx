import React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container, { BusinessScrollView } from "components/Container";
import Header from "components/Header";

import { useAuth } from "context/AuthContext";
import Modal from "components/Modal";
import NavigationButton from "components/NavigationButton";

export default function Settings() {
	const { signOut } = useAuth();
	const [isDeleteModalVisible, setIsDeleteModalVisible] =
		React.useState(false);

	return (
		<Container>
			<Header title="Configurações" returnButton />
			<BusinessScrollView>
				<NavigationButton
					title="Tema"
					description="Escolha entre os modos de exibição claro e escuro"
					onPress={() => console.log("to-do")}
				/>
				<NavigationButton
					title="Idioma"
					onPress={() => console.log("to-do")}
				/>
			</BusinessScrollView>
			<Modal
				title="Excluir conta"
				isVisible={isDeleteModalVisible}
				icon="delete"
				toggleVisibility={() =>
					setIsDeleteModalVisible(!isDeleteModalVisible)
				}
				message="Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
				buttons={[
					{
						label: "Excluir",
						onPress: signOut,
						color: colors.red,
					},
				]}
				cancelButton
			/>
		</Container>
	);
}
