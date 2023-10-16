import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import { ProfileHeader } from ".";
import Container, { ContainerScrollView } from "components/Container";
import Header from "components/Header";
import Input from "components/Input";
import Toast from "components/Toast";
import BottomSheet, { BottomSheetProps } from "components/BottomSheet";
import NavigationButton from "components/NavigationButton";
import Modal, { MultisectionModalProps } from "components/Modal";

// Data
import { useAuth, userStorage } from "context/AuthContext";
import { useMMKVString } from "react-native-mmkv";

// Utils
import formatWithMask from "utils/maskHandler";
import { MASKS } from "utils/maskHandler";
import { censorEmail } from "utils";

// Bottom Sheets
import NameEdit from "./AccountBottomSheets/NameEdit";
import GenderEdit from "./AccountBottomSheets/GenderEdit";
import BirthdayEdit from "./AccountBottomSheets/BirthdayEdit";
import PhoneEdit from "./AccountBottomSheets/PhoneEdit";
import EmailEdit from "./AccountBottomSheets/EmailEdit";

// Utils
import { genderOptions } from "global/constants";
import { api } from "lib/axios";
import PasswordEdit from "./AccountBottomSheets/PasswordEdit";

export default function ManageAccount() {
	const insets = useSafeAreaInsets();

	const [name] = useMMKVString("name", userStorage);
	const [gender] = useMMKVString("gender", userStorage);
	const [email] = useMMKVString("email", userStorage);
	const [phone] = useMMKVString("phone", userStorage);
	const [birthday] = useMMKVString("birthday", userStorage);

	const genderString = genderOptions.find(
		(option) => option.value === gender
	)?.label;

	const [disableAccountModalSection, setDisableAccountModalSection] =
		useState(0);

	return (
		<Container
			style={{
				paddingBottom: insets.bottom + 5,
			}}
		>
			<Header
				title="Gerenciar Conta"
				navigationHistory={["Seu Perfil"]}
				returnButton
			/>
			<ContainerScrollView>
				<ProfileHeader />
				<NavigationButton
					title="Nome"
					description={name}
					onPress={() => BottomSheet.expand("nameEditBottomSheet")}
				/>
				<NavigationButton
					title="Gênero"
					description={genderString ?? "[não informado]"}
					onPress={() => BottomSheet.expand("genderEditBottomSheet")}
				/>
				<NavigationButton
					title="Data de Nascimento"
					description={
						birthday
							? new Date(birthday).toLocaleDateString()
							: "[não informado]"
					}
					onPress={() =>
						BottomSheet.expand("birthdayEditBottomSheet")
					}
				/>
				<NavigationButton
					title="Telefone"
					description={
						phone
							? formatWithMask({
									text: phone,
									mask: MASKS.BRL_PHONE,
							  }).masked
							: "[não informado]"
					}
					onPress={() => BottomSheet.expand("phoneEditBottomSheet")}
				/>
				<NavigationButton
					title="E-mail"
					description={email ? censorEmail(email) : "[erro]"}
					onPress={() => BottomSheet.expand("emailEditBottomSheet")}
				/>
				<NavigationButton
					title="Alterar senha"
					onPress={() =>
						BottomSheet.expand("passwordEditBottomSheet")
					}
				/>
				{/* <View className="items-center justify-start flex-1 bg-transparent">
			</View> */}
				<View className="w-1/2 h-0 bg-transparent border-b border-dashed border-b-gray-100 self-center mt-2" />
				<Text className="font-semibold text-sm text-black dark:text-text-100">
					Zona de Perigo
				</Text>
				<View className="w-full rounded-sm border border-red items-start justify-start p-3">
					<NavigationButton
						activeOpacity={1}
						title="Desativar conta"
						description="Desativar sua conta a tornará indisponível para acesso."
					>
						<TouchableOpacity
							className="p-2 bg-gray-400 border border-gray-100 rounded-lg"
							onPress={() => setDisableAccountModalSection(1)}
						>
							<Text className="text-white text-xs font-medium text-center">
								Desativar
							</Text>
						</TouchableOpacity>
					</NavigationButton>
				</View>
			</ContainerScrollView>
			<AccountEditBottomSheet id="nameEditBottomSheet">
				<NameEdit />
			</AccountEditBottomSheet>
			<AccountEditBottomSheet id="genderEditBottomSheet" height="32%">
				<GenderEdit />
			</AccountEditBottomSheet>
			<AccountEditBottomSheet id="birthdayEditBottomSheet" height="34%">
				<BirthdayEdit />
			</AccountEditBottomSheet>
			<AccountEditBottomSheet id="phoneEditBottomSheet" height="34%">
				<PhoneEdit />
			</AccountEditBottomSheet>
			<AccountEditBottomSheet id="emailEditBottomSheet" height="46%">
				<EmailEdit />
			</AccountEditBottomSheet>
			<AccountEditBottomSheet id="passwordEditBottomSheet" height="46%">
				<PasswordEdit />
			</AccountEditBottomSheet>

			<AccountDisableModal
				currentSection={disableAccountModalSection}
				setCurrentSection={setDisableAccountModalSection}
			/>
		</Container>
	);
}

function AccountEditBottomSheet({
	children,
	height = "35%",
	...rest
}: {
	children: React.ReactNode;
	id: BottomSheetProps["id"];
	height?: string;
}) {
	return (
		<BottomSheet
			{...rest}
			includeWrapper
			height={height}
			overDragAmount={25}
		>
			{children}
		</BottomSheet>
	);
}

function AccountDisableModal({
	currentSection,
	setCurrentSection,
}: {
	currentSection: number;
	setCurrentSection: MultisectionModalProps["setCurrentSection"];
}) {
	const id = userStorage.getString("id");
	const email = userStorage.getString("email");

	const [password, setPassword] = React.useState("");
	const { signOut } = useAuth();

	const showError = useCallback(() => {
		Toast.show({
			preset: "error",
			title: "Erro ao desativar conta",
			description:
				"Não foi possível desativar sua conta. Por favor, tente novamente mais tarde.",
		});
		setCurrentSection(0);
	}, []);

	const [checkingPassword, setCheckingPassword] = useState(false);

	async function disableAccount() {
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
				setCurrentSection(1);
			} else {
				showError();
			}
			return;
		} finally {
			setCheckingPassword(false);
		}

		try {
			setCurrentSection(2);

			const response = await api.delete(`/accounts/${id}`);

			if (response.data) {
				setCurrentSection(3);

				setTimeout(() => {
					signOut();
				}, 3000);
			} else {
				showError();
			}
		} catch (error) {
			console.log(error);
			showError();
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
					title: "Você tem certeza que deseja desativar sua conta?",
					icon: "disabled-by-default",
					description: `Desativar sua conta significa que você não poderá mais acessar os negócios atrelados a esta conta e todos os seus dados serão excluídos permanentemente.\nVocê perderá todas as informações sobre seus projetos, clientes, pagamentos, serviços e materiais.\n\nSe você mudar de ideia, poderá reativar sua conta a qualquer momento, desde que não tenham decorrido 6 meses desde a desativação, momento em que todos os seus dados serão completamente apagados.\nPara reativar sua conta, basta fazer login novamente com seu e-mail e senha.\n\nAssinaturas ativas no momento da desativação permanecerão funcionais até que os dados sejam completamente apagados.\n\nSe você tem certeza que deseja desativar sua conta, por favor confirme sua senha e clique no botão "Desativar conta" abaixo.`,
					buttons: [
						{
							label: "Desativar conta",
							onPress: disableAccount,
							color: colors.red,
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
					title: "Sua conta está sendo desativada...",
					icon: "pending",
					description: `Estamos desativando sua conta. Isso pode levar alguns segundos. Por favor, aguarde...`,
					isLoading: true,
				},
				{
					title: "Conta desativada com sucesso!",
					icon: "check-circle-outline",
					description: `Sua conta foi desativada com sucesso. Você será redirecionado para a tela de login em alguns segundos.`,
					isLoading: true,
				},
			]}
		/>
	);
}
