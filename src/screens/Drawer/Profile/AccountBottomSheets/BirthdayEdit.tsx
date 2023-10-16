import { Keyboard, View } from "react-native";
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
import { isAdult } from "utils";
import { DatePickerModal } from "screens/Auth/Register/Sections/Section0";
import Input, { Trigger } from "components/Input";

export default function BirthdayEdit() {
	const id = userStorage.getString("id");
	const currentBirthday = userStorage.getString("birthday");

	const [birthday, setBirthday] = useState<string>(
		currentBirthday ?? new Date().toISOString()!
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [isDatePickerModalVisible, setDatePickerModalVisible] =
		useState(false);

	async function handleEdit() {
		setIsLoading(true);

		if (birthday === currentBirthday) {
			Toast.show({
				preset: "error",
				title: "Data de nascimento inválida",
				description:
					"A data de nascimento deve ser diferente da atual.",
			});
			return;
		}

		if (!isAdult(new Date(birthday))) {
			Toast.show({
				preset: "error",
				title: "Data de nascimento inválida",
				description:
					"Você deve ter 16 anos ou mais para usar o aplicativo.",
			});
			return;
		}

		try {
			await api.patch(`/accounts/${id}`, {
				birthday,
			});

			userStorage.set("birthday", birthday);

			Toast.show({
				preset: "success",
				title: "Data de nascimento alterada",
				description:
					"A data de nascimento em sua conta foi alterada com sucesso.",
			});
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao alterar data de nascimento",
				description:
					"Não foi possível alterar a data de nascimento em sua conta. Tente novamente mais tarde.",
			});
		} finally {
			setIsLoading(false);
			BottomSheet.close("birthdayEditBottomSheet");
		}
	}

	return (
		<AccountEditLayout
			id="birthdayEditBottomSheet"
			label="data de nascimento"
			currentData={currentBirthday}
			data={birthday}
			handleEdit={handleEdit}
			isLoading={isLoading}
		>
			<Trigger
				label="Data de Nascimento"
				value={new Date(birthday)?.toLocaleDateString("pt-BR") ?? ""}
				placeholder="DD/MM/AAAA"
				onPress={() => {
					setDatePickerModalVisible(true);
					Keyboard.dismiss();
				}}
				pallette="dark"
			/>
			<DatePickerModal
				isVisible={isDatePickerModalVisible}
				hasCancelButton
				toggleVisibility={() => setDatePickerModalVisible(false)}
				initialDate={new Date(birthday)}
				onDateChange={(date) => setBirthday(date?.toISOString()!)}
			/>
		</AccountEditLayout>
	);
}
