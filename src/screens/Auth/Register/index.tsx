import React, { useCallback } from "react";
import { BackHandler, Text } from "react-native";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import { SectionsNavigator } from "components/SectionsNavigator";
import Toast from "components/Toast";

import { AuthData, useAuth, userStorage } from "context/AuthContext";

// Hooks
import useUpdateHandler from "hooks/useUpdateHandler";
import useBackHandler from "hooks/useBackHandler";
import useLoadingModal from "hooks/useLoadingModal";

// Sections
import RegisterSection0, { PersonalDataSchemeType } from "./Sections/Section0";
import RegisterSection1, {
	LoginDataSchemeType,
	censorEmail,
} from "./Sections/Section1";
import RegisterSection2 from "./Sections/Section2";

import { StackActions } from "@react-navigation/native";

interface RegisterProps extends PersonalDataSchemeType, LoginDataSchemeType {}

const sections = [
	"registerSection0BottomSheet",
	"registerSection1BottomSheet",
	"registerSection2BottomSheet",
];

const HEADERS = [
	{
		title: "Estamos aqui para criar sua conta.",
		subtitle:
			"Insira seus dados pessoais para que sua conta possa ser criada.",
	},
	{
		title: "Agora só faltam os dados de entrada.",
		subtitle:
			"Insira seus dados de entrada na conta. Cuidado para não se esquecer dessas informações!",
	},
	{
		title: "Voilà! Sua conta já está pronta para ser usada!",
		subtitle: "Agora, chegou a hora de criar e adicionar um negócio a ela.",
	},
];

// The logic used behind the (!email) conditional is that if the user already created an account and reopened the app but didn't created a business yet, the app will redirect him to the register screen, but in the last section, so he can create a business.

export default function Register({ route, navigation }: any) {
	const email = route.params?.email;
	const { signIn, signOut } = useAuth();

	const [partialAccountData, setPartialAccountData] = React.useState<
		Partial<RegisterProps> | undefined
	>(undefined);

	const { updateHandler, selectedSectionId, Header, BackButton } =
		useUpdateHandler({
			sections,
			HEADERS,
			onLimitReached: () => {
				navigation.replace("login");
			},
			initialValue: email ? 0 : 2,
		});

	const { ConfirmExitModal } = useBackHandler({
		shouldTriggerModal: useCallback(() => {
			if (selectedSectionId.value === 0) {
				return true;
			} else {
				return false;
			}
		}, []),
		onExitConfirm: useCallback(() => {
			navigation.goBack();
		}, []),
		onBack: useCallback(() => {
			if (selectedSectionId.value !== 2) {
				navigation.goBack();
			} else if (selectedSectionId.value === 2) {
				BackHandler.exitApp();
			}
		}, []),
	});

	const [registerCompleted, setRegisterCompleted] = React.useState(
		email ? false : true
	);
	const { LoadingModal, setIsVisible: setLoadingModalVisible } =
		useLoadingModal();

	const handleRegister = async (data: LoginDataSchemeType) => {
		if (!data.email || !data.password) return;

		// Gambiarra: Alterar o status do modal anterior e deste ao mesmo tempo está fazendo com que o modal atual não anime a entrada
		setTimeout(() => {
			setLoadingModalVisible(true);
		}, 1);

		const accountData = {
			email: data.email,
			password: data.password,
			...partialAccountData,
		} as AuthData;

		try {
			await signIn(accountData);

			updateHandler(2);
			setLoadingModalVisible(false);
			setRegisterCompleted(true);
		} catch (error) {
			console.log(error);

			Toast.show({
				preset: "error",
				title: "Erro ao criar conta",
				message:
					"Não foi possível criar sua conta. Tente novamente mais tarde.",
			});

			navigation.goBack();
		}
	};

	const BOTTOM_SHEET_HEIGHT = "62%";
	const loggedUserEmail = userStorage.getString("user.email");

	return (
		<Container style={{ rowGap: 10 }}>
			<BackButton isEnabled={!!email && !registerCompleted} />
			<Header />

			{!email && (
				<Text className="text-sm text-text-100 text-center font-regular">
					Logado como{" "}
					{loggedUserEmail ? censorEmail(loggedUserEmail) : "..."}
					{"  "}
					<Text
						className="text-red font-medium underline"
						onPress={() => {
							signOut();

							// Gambiarra: por conta do delay da alteração do estado "authData" pelo signOut, o usuário não consegue é levado de volta para a tela de login após o primeiro toque. Por enquanto, será necessário tocar duas vezes para voltar para a tela de login.
							navigation.navigate("login");
						}}
					>
						Sair
					</Text>
				</Text>
			)}

			{email && (
				<>
					<SectionsNavigator
						selectedId={selectedSectionId}
						sections={[
							{
								id: 0,
								title: "Seus Dados",
								onPress: () =>
									selectedSectionId.value === 1 &&
									updateHandler(0),
							},
							{
								id: 1,
								title: "Dados de Login",
								onPress: () => updateHandler(1),
							},
						]}
					/>
					<SectionBottomSheet
						id={sections[0]}
						defaultValues={{
							expanded: true,
						}}
						height={BOTTOM_SHEET_HEIGHT}
						rowGap={20}
					>
						<RegisterSection0
							onSubmit={(data) => {
								setPartialAccountData(data);
								updateHandler(1);
							}}
						/>
					</SectionBottomSheet>

					<SectionBottomSheet
						id={sections[1]}
						height={BOTTOM_SHEET_HEIGHT}
						rowGap={20}
					>
						<RegisterSection1
							onSubmit={handleRegister}
							email={email}
						/>
					</SectionBottomSheet>

					<ConfirmExitModal
						title={"Voltar agora cancelará seu registro."}
						message="Após voltar, todas as informações terão que ser inseridas novamente."
					/>
				</>
			)}

			<SectionBottomSheet
				id={sections[2]}
				defaultValues={{
					expanded: !email,
				}}
				height={email ? "69%" : "67%"}
				rowGap={20}
			>
				<RegisterSection2 navigation={navigation} />
			</SectionBottomSheet>

			<LoadingModal message="Estamos apertando uns parafusos e pressionando alguns botões para que sua conta seja criada..." />
		</Container>
	);
}
