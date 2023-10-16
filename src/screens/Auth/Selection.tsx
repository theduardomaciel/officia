import React from "react";
import { Text } from "react-native";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/Form/SectionBottomSheet";

import { useAuth, userStorage } from "context/AuthContext";

import RegisterSection2 from "./Register/Sections/Section2";
import useUpdateHandler from "hooks/useUpdateHandler";

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

	const { Header, BackButton } = useUpdateHandler({
		sections: sections,
		HEADERS,
	});

	const loggedUserEmail = userStorage.getString("email");

	return (
		<Container style={{ rowGap: 10 }}>
			<BackButton
				customConfig={{
					label: "Sua Conta",
					disabled: true,
					suppressIcon: true,
				}}
			/>

			<Header />

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

			<SectionBottomSheet
				id={sections[2]}
				defaultValues={{
					expanded: true,
				}}
				height={"65%"}
				rowGap={20}
			>
				<RegisterSection2 navigation={navigation} />
			</SectionBottomSheet>
		</Container>
	);
}
