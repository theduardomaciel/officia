import { useState } from "react";

// Components
import BottomSheet from "components/BottomSheet";
import Toast from "components/Toast";
import ToggleGroup from "components/ToggleGroup";

import AccountEditLayout from "./Layout";

// Data
import { api } from "lib/axios";
import { userStorage } from "context/AuthContext";

// Utils
import { genderOptions } from "global/constants";

export default function GenderEdit() {
	const id = userStorage.getString("id");
	const currentGender = userStorage.getString("gender");

	const [gender, setGender] = useState<string>(currentGender ?? "");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleEdit() {
		setIsLoading(true);

		if (gender === currentGender) {
			Toast.show({
				preset: "error",
				title: "Gênero inválido",
				description: "O gênero deve ser diferente do atual.",
			});
			return;
		}

		try {
			await api.patch(`/accounts/${id}`, {
				gender,
			});

			userStorage.set("gender", gender);
			Toast.show({
				preset: "success",
				title: "Gênero alterado",
				description: "O gênero em sua conta foi alterado com sucesso.",
			});

			BottomSheet.close("genderEditBottomSheet");
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao alterar gênero",
				description:
					"Não foi possível alterar o gênero em sua conta. Tente novamente mais tarde.",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AccountEditLayout
			label="gênero"
			id="genderEditBottomSheet"
			currentData={currentGender}
			data={gender}
			handleEdit={handleEdit}
			isLoading={isLoading}
		>
			<ToggleGroup
				data={genderOptions}
				selected={gender}
				updateState={setGender}
			/>
		</AccountEditLayout>
	);
}
