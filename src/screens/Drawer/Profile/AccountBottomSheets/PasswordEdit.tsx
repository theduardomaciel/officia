import { Keyboard, View } from "react-native";
import { useState } from "react";

// Components
import BottomSheet from "components/BottomSheet";
import Toast from "components/Toast";
import Input from "components/Input";

import AccountEditLayout from "./Layout";

// Data
import { api } from "lib/axios";
import { userStorage } from "context/AuthContext";

// Utils

export default function PasswordEdit() {
	const id = userStorage.getString("id");
	const email = userStorage.getString("email");
	const currentPassword = userStorage.getString("password");

	const [currentPasswordInputValue, setCurrentPasswordInputValue] =
		useState<string>("");
	const [password, setPassword] = useState<string>("");

	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleEdit() {
		setIsLoading(true);

		if (password === currentPassword) {
			Toast.show({
				preset: "error",
				title: "Senha inválida",
				description: "A nova senha deve ser diferente da atual.",
			});
			return;
		}

		try {
			const isPasswordValid = await api.post("/auth/verify/password", {
				password: currentPasswordInputValue,
				email,
				id,
			});
		} catch (error: any) {
			if (error.response && error.response.data.statusCode === 400) {
				Toast.show({
					preset: "error",
					title: "Senha incorreta",
					description:
						"A senha informada está incorreta. Por favor, tente novamente.",
				});
			} else {
				Toast.show({
					preset: "error",
					title: "Erro ao verificar senha",
					description:
						"Não foi possível verificar a senha de sua conta. Tente novamente mais tarde.",
				});
			}
			setIsLoading(false);
			return;
		}

		try {
			await api.patch(`/accounts/${id}`, {
				password,
			});

			userStorage.set("password", password);

			Toast.show({
				preset: "success",
				title: "Senha alterada",
				description: "A senha de sua conta foi alterada com sucesso.",
			});
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao alterar senha",
				description:
					"Não foi possível alterar a senha de sua conta. Tente novamente mais tarde.",
			});
		} finally {
			setIsLoading(false);
			BottomSheet.close("passwordEditBottomSheet");
		}
	}

	return (
		<AccountEditLayout
			id="passwordEditBottomSheet"
			label="senha"
			currentData={currentPassword}
			data={password}
			handleEdit={handleEdit}
			isLoading={isLoading}
		>
			<Input
				label="Senha atual"
				pallette="dark"
				secureTextEntry
				autoCapitalize="none"
				value={currentPasswordInputValue}
				onChangeText={setCurrentPasswordInputValue}
			/>
			<Input
				label="Nova senha"
				pallette="dark"
				secureTextEntry
				value={password}
				autoCapitalize="none"
				onChangeText={setPassword}
			/>
		</AccountEditLayout>
	);
}
