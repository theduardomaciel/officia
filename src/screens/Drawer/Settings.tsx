import React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container, { ContainerScrollView } from "components/Container";
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
			<ContainerScrollView>
				<NavigationButton
					title="Tema"
					description="Escolha entre os modos de exibição claro e escuro"
					onPress={() => console.log("to-do")}
				/>
				<NavigationButton
					title="Idioma"
					onPress={() => console.log("to-do")}
				/>
			</ContainerScrollView>
			<Modal
				title="Excluir conta"
				isVisible={isDeleteModalVisible}
				icon="delete"
				toggleVisibility={() =>
					setIsDeleteModalVisible(!isDeleteModalVisible)
				}
				description="Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita."
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
