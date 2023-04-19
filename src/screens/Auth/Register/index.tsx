import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View, Text } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/ScheduleForm/SectionBottomSheet";
import { SectionsNavigator } from "components/SectionsNavigator";
import { ActionButton } from "components/Button";

import { useAuth } from "context/AuthContext";

// Hooks
import useUpdateHandler from "hooks/useUpdateHandler";
import useBackHandler from "hooks/useBackHandler";

// Sections
import RegisterSection0, { PersonalDataSchemeType } from "./Sections/Section0";
import RegisterSection1, { LoginDataSchemeType } from "./Sections/Section1";
import RegisterSection2 from "./Sections/Section2";

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

export default function Register({ route, navigation }: any) {
	const { email } = route.params;
	const { signIn } = useAuth();

	const [partialAccountData, setPartialAccountData] = React.useState<
		Partial<RegisterProps> | undefined
	>(undefined);

	const { updateHandler, selectedSectionId, Header, BackButton } =
		useUpdateHandler(
			sections,
			HEADERS,
			useCallback(() => navigation.goBack(), []),
			useMemo(() => (email ? 0 : 2), [])
		);

	const { ConfirmExitModal } = useBackHandler(
		useCallback(() => {
			if (selectedSectionId.value === 0) {
				return true;
			} else if (!email) {
				return undefined;
			} else {
				return false;
			}
		}, []),
		useCallback(() => {
			updateHandler(selectedSectionId.value - 1);
		}, []),
		useCallback(() => {
			navigation.goBack();
		}, [])
	);

	const handleRegister = async (data: RegisterProps) => {
		/* const { email, password, ...personalData } = data;

		if (!email || !password) return;

		const accountData = {
			...personalData,
			email,
			password,
		}; */

		updateHandler(2);
		/* try {
			await signIn(accountData);
		} catch (error) {
			console.log(error);
		} */
	};

	const BOTTOM_SHEET_HEIGHT = "62%";

	return (
		<Container style={{ rowGap: 10 }}>
			<BackButton isEnabled={!!email} />
			<Header />

			{email ? (
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
						bottomSheet={sections[0]}
						expanded={true}
						bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
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
						bottomSheet={sections[1]}
						expanded={false}
						bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
						rowGap={20}
					>
						<RegisterSection1
							onSubmit={(data) => {
								setPartialAccountData((prev) => ({
									...prev,
									...data,
								}));
								handleRegister(
									partialAccountData as RegisterProps
								);
							}}
							email={email}
						/>
					</SectionBottomSheet>

					<ConfirmExitModal
						title={"Voltar agora cancelará seu registro."}
						message="Após voltar, todas as informações terão que ser inseridas novamente."
					/>
				</>
			) : (
				<SectionBottomSheet
					bottomSheet={sections[2]}
					expanded={!email}
					bottomSheetHeight={"69%"}
					rowGap={20}
				>
					<RegisterSection2 navigation={navigation} />
				</SectionBottomSheet>
			)}
		</Container>
	);
}
