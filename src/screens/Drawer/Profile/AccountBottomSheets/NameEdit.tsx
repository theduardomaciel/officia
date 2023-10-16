import { useState } from "react";

import colors from "global/colors";

// Components
import BottomSheet from "components/BottomSheet";
import Input from "components/Input";
import Toast from "components/Toast";

// Utils
import { api } from "lib/axios";
import { userStorage } from "context/AuthContext";
import AccountEditLayout from "./Layout";

export default function NameEdit() {
	const id = userStorage.getString("id");
	const currentName = userStorage.getString("name");

	const [name, setName] = useState<string>(currentName ?? "");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleNameEdit() {
		setIsLoading(true);

		if (name.length < 3) {
			Toast.show({
				preset: "error",
				title: "Nome inválido",
				description: "O nome deve conter pelo menos 3 caracteres.",
			});
			setIsLoading(false);
			return;
		}

		if (name === currentName) {
			Toast.show({
				preset: "error",
				title: "Nome inválido",
				description: "O nome deve ser diferente do atual.",
			});
			console.log("name === currentName");
			setIsLoading(false);
			return;
		}

		try {
			await api.patch(`/accounts/${id}`, {
				name: name,
			});

			userStorage.set("name", name);
			Toast.show({
				preset: "success",
				title: "Nome alterado",
				description: "Seu nome foi alterado com sucesso.",
			});

			BottomSheet.close("nameEditBottomSheet");
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao alterar nome",
				description:
					"Não foi possível alterar seu nome. Tente novamente mais tarde.",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AccountEditLayout
			data={name}
			id="nameEditBottomSheet"
			currentData={currentName}
			handleEdit={handleNameEdit}
			isLoading={isLoading}
			label="nome"
		>
			<Input
				label="Nome"
				value={name}
				onChangeText={setName}
				pallette="dark"
			/>
		</AccountEditLayout>
	);
}
