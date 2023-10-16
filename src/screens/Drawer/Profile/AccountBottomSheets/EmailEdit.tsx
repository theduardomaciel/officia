import { useCallback, useState } from "react";

// Components
import BottomSheet from "components/BottomSheet";
import Toast from "components/Toast";
import Modal, { MultisectionModalProps } from "components/Modal";
import Input, { borderErrorStyle } from "components/Input";

import AccountEditLayout from "./Layout";

// Data
import { api } from "lib/axios";
import { userStorage } from "context/AuthContext";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { censorEmail } from "utils";
import colors, { text } from "global/colors";
import { View } from "react-native";

export const scheme = z.object({
	email: z.string().email({
		message: "O email inserido é inválido.",
	}),
	"new-email": z.string().email({
		message: "O email inserido é inválido.",
	}),
});

type SchemeType = z.infer<typeof scheme>;

export default function EmailEdit() {
	const id = userStorage.getString("id");
	const currentEmail = userStorage.getString("email");

	const [email, setEmail] = useState<string>(currentEmail ?? "");
	const [
		currentVerificationModalSection,
		setCurrentVerificationModalSection,
	] = useState<number>(0);

	const {
		handleSubmit,
		control,
		formState: { errors: errors },
	} = useForm<SchemeType>({
		mode: "onSubmit",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(scheme),
	});

	const onError: SubmitErrorHandler<SchemeType> = (errors, e) => {
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			description: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	async function triggerModal({ email: currentEmailCheck }: SchemeType) {
		if (currentEmailCheck === currentEmail) {
			setCurrentVerificationModalSection(1);
		} else if (email === currentEmail) {
			Toast.show({
				preset: "error",
				title: "Email inválido",
				description: "O novo email deve ser diferente do atual.",
			});
		} else {
			Toast.show({
				preset: "error",
				title: "Email inválido",
				description:
					"O email inserido deve ser igual ao e-mail atual por motivos de segurança.",
			});
		}
	}

	return (
		<>
			<AccountEditLayout
				label="email"
				id="emailEditBottomSheet"
				currentData={currentEmail}
				data={email}
				handleEdit={handleSubmit(triggerModal, onError)}
				isLoading={false}
			>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input
							label="E-mail atual"
							placeholder={
								currentEmail
									? censorEmail(currentEmail)
									: "E-mail"
							}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							style={!!errors.email && borderErrorStyle}
							autoCapitalize="none"
							keyboardType="email-address"
							pallette="dark"
						/>
					)}
					name="email"
				/>

				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input
							label="Novo e-mail"
							onBlur={onBlur}
							onChangeText={(text) => {
								setEmail(text);
								onChange(text);
							}}
							value={value}
							style={!!errors.email && borderErrorStyle}
							autoCapitalize="none"
							keyboardType="email-address"
							pallette="dark"
						/>
					)}
					name="new-email"
				/>
			</AccountEditLayout>
			<VerifyPasswordModal
				currentSection={currentVerificationModalSection}
				setCurrentSection={setCurrentVerificationModalSection}
				email={email}
			/>
		</>
	);
}

function VerifyPasswordModal({
	currentSection,
	setCurrentSection,
	email,
}: {
	currentSection: number;
	setCurrentSection: MultisectionModalProps["setCurrentSection"];
	email: string;
}) {
	const id = userStorage.getString("id");
	const currentEmail = userStorage.getString("email");

	const [password, setPassword] = useState<string>("");
	const [checkingPassword, setCheckingPassword] = useState(false);

	async function handleEdit() {
		if (!password) {
			Toast.show({
				preset: "error",
				title: "Senha inválida",
				description: "Por favor, informe sua senha para continuar.",
			});
			return;
		}

		try {
			setCheckingPassword(true);
			const isPasswordValid = await api.post("/auth/verify/password", {
				password,
				email: currentEmail,
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
					title: "Erro ao alterar e-mail",
					description:
						"Não foi possível alterar seu e-mail. Por favor, tente novamente mais tarde.",
				});
				setCurrentSection(0);
				BottomSheet.close("emailEditBottomSheet");
			}
			return;
		} finally {
			setCheckingPassword(false);
		}

		try {
			setCurrentSection(2);

			/* await api.patch(`/accounts/${id}`, {
				email,
			});
			userStorage.set("email", email); */

			/* Toast.show({
				preset: "success",
				title: "Email alterado",
				description: "O email em sua conta foi alterado com sucesso.",
			}); */

			setTimeout(() => {
				setCurrentSection(3);
				BottomSheet.close("emailEditBottomSheet");
			}, 100);
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao alterar email",
				description:
					"Não foi possível alterar o email em sua conta. Tente novamente mais tarde.",
			});
		} finally {
			setPassword("");
		}
	}

	return (
		<Modal.Multisection
			currentSection={currentSection}
			setCurrentSection={setCurrentSection}
			sections={[
				{
					title: "Precisamos confirmar algumas informações",
					icon: "lock-outline",
					description: `Antes de alterar o e-mail vinculado à sua conta, precisamos que você insira sua senha atual.\n\nCaso não possua acesso a essa informação, entre em contato conosco por meio da Central de Ajuda.`,
					buttons: [
						{
							label: "Alterar e-mail",
							onPress: handleEdit,
							color: colors.primary,
						},
					],
					cancelButton: true,
					children: (
						<View className="my-4 w-full">
							<Input
								label="Senha"
								pallette="dark"
								secureTextEntry
								value={password}
								autoCapitalize="none"
								onChangeText={setPassword}
							/>
						</View>
					),
					isSoftLoading: checkingPassword,
				},
				{
					title: "O e-mail está sendo enviado...",
					icon: "outgoing-mail",
					description: `Estamos enviando um e-mail para ${email} com um link de verificação. Por favor, aguarde.`,
					isLoading: true,
				},
				{
					title: "Acabamos de lhe enviar um e-mail de verificação",
					icon: "mail-outline",
					description: `Após realizar a confirmação por meio do link enviado, seu e-mail será alterado.\nSeja paciente pois o e-mail pode demorar alguns minutos para aparecer (e lembre-se de checar o spam!)\n\nFique atento pois, ao mudar o e-mail de sua conta, todos os dispositivos conectados serão deslogados automaticamente, requerindo que o novo e-mail seja inserido.`,
					cancelButton: true,
				},
			]}
		/>
	);
}
