import { useState } from "react";

// Components
import BottomSheet from "components/BottomSheet";
import Toast from "components/Toast";

import AccountEditLayout from "./Layout";

// Data
import { api } from "lib/axios";
import { userStorage } from "context/AuthContext";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import formatWithMask, { MASKS } from "utils/maskHandler";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input, { borderErrorStyle } from "components/Input";

export const phoneScheme = z.object({
	phone: z
		.string({
			required_error:
				"É necessário inserir um número de telefone válido.",
		})
		.min(15, "É necessário inserir um número de telefone válido.")
		.max(15, "É necessário inserir um número de telefone válido."),
});

type PhoneSchemeType = z.infer<typeof phoneScheme>;

export default function PhoneEdit() {
	const id = userStorage.getString("id");
	const currentPhone = userStorage.getString("phone");

	const [phone, setPhone] = useState<string>(currentPhone ?? "");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleEdit() {
		setIsLoading(true);

		if (phone === currentPhone) {
			Toast.show({
				preset: "error",
				title: "Telefone inválido",
				description: "O telefone deve ser diferente do atual.",
			});
			return;
		}

		try {
			await api.patch(`/accounts/${id}`, {
				phone,
			});

			userStorage.set("phone", phone);
			Toast.show({
				preset: "success",
				title: "Telefone alterado",
				description:
					"O telefone em sua conta foi alterado com sucesso.",
			});

			BottomSheet.close("phoneEditBottomSheet");
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao alterar telefone",
				description:
					"Não foi possível alterar o telefone em sua conta. Tente novamente mais tarde.",
			});
		} finally {
			setIsLoading(false);
		}
	}

	const {
		handleSubmit,
		control,
		formState: { errors: errors },
	} = useForm<PhoneSchemeType>({
		mode: "onSubmit",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(phoneScheme),
	});

	const onError: SubmitErrorHandler<PhoneSchemeType> = (errors, e) => {
		//console.log(errors)
		//setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			description: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	return (
		<AccountEditLayout
			label="telefone"
			id="phoneEditBottomSheet"
			currentData={currentPhone}
			data={phone}
			handleEdit={handleSubmit(handleEdit, onError)}
			isLoading={isLoading}
		>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						label="Celular"
						placeholder="(XX) XXXXX-XXXX"
						onBlur={onBlur}
						onChangeText={(value) => {
							const { masked } = formatWithMask({
								text: value,
								mask: MASKS.BRL_PHONE,
							});
							onChange(masked);
							setPhone(masked);
						}}
						value={value}
						style={!!errors.phone && borderErrorStyle}
						keyboardType="phone-pad"
						maxLength={15}
						pallette="dark"
					/>
				)}
				name="phone"
			/>
		</AccountEditLayout>
	);
}
