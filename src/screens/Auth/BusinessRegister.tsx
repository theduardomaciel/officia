import React, { useCallback, useEffect } from "react";
import { TouchableOpacity, View, Text } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Toast from "components/Toast";
import ImagePicker from "components/ImagePicker";
import SectionBottomSheet from "components/ScheduleForm/SectionBottomSheet";
import { SectionsNavigator } from "components/SectionsNavigator";

import { BasicInfo } from "screens/Main/Business/screens/BasicInfo";
import { ContactAndAddress } from "screens/Main/Business/screens/ContactAndAddress";
import { ActionButton } from "components/Button";

// Form
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	basicInfoScheme,
	BasicInfoSchemeType,
	BusinessData,
	contactAndAddressScheme,
	ContactAndAddressSchemeType,
} from "screens/Main/Business/@types";

import { updateData } from "screens/Main/Business";

// Hooks
import useBackHandler from "hooks/useBackHandler";
import useUpdateHandler from "hooks/useUpdateHandler";

export default function BusinessRegister({ navigation }: any) {
	const sections = [
		"registerSection0BottomSheet",
		"registerSection1BottomSheet",
		"registerSection2BottomSheet",
	];

	const [newBusinessData, setNewBusinessData] = React.useState<
		Partial<BusinessData>
	>({});

	const HEADERS = [
		{
			title: "Vamos começar com o básico.",
			subtitle:
				"Insira os dados básicos que caracterizam o seu negócio como ele é.",
		},
		{
			title: "Seus clientes precisam de dados.",
			subtitle:
				"Insira as informações que serão exibidas para elevar a confiabilidade de sua empresa.",
		},
		/* {
			title: "Quanto mais clareza, melhor.",
			subtitle:
				"Insira alguns dos seus dados de pagamento para que seus clientes esteja informados.",
		}, */
	];

	const {
		updateHandler,
		selectedSection,
		selectedSectionId,
		Header,
		BackButton,
	} = useUpdateHandler(sections, HEADERS, () => navigation.goBack());

	const { ConfirmExitModal } = useBackHandler(
		() => {
			if (selectedSection !== 0) {
				return true;
			} else {
				return false;
			}
		},
		() => {
			navigation.goBack();
		}
	);

	const {
		handleSubmit: section0HandleSubmit,
		control: section0Control,
		formState: { errors: section0Errors },
	} = useForm<BasicInfoSchemeType>({
		mode: "onSubmit",
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(basicInfoScheme),
	});

	const {
		handleSubmit: section1HandleSubmit,
		control: section1Control,
		formState: { errors: section1Errors },
		setValue,
		getValues,
	} = useForm<ContactAndAddressSchemeType>({
		mode: "onSubmit",
		defaultValues: {
			email: undefined,
		},
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(contactAndAddressScheme),
	});

	const onError: SubmitErrorHandler<
		BasicInfoSchemeType & ContactAndAddressSchemeType
	> = (errors, e) => {
		//console.log(errors)
		//setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			message: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const submitSection0Data = section0HandleSubmit(async (data) => {
		setNewBusinessData((prevState) => ({ ...prevState, ...data }));
		updateHandler(1);
	}, onError);

	const submitSection1Data = section1HandleSubmit(async (data) => {
		const fullData = { ...newBusinessData, ...data };
		const result = await updateData(fullData, {}, true);
		if (result) {
			/*  */
		} else {
			Toast.show({
				preset: "error",
				title: "Algo deu errado.",
				message:
					"Não foi possível criar sua empresa. Tente novamente mais tarde.",
			});
		}
	}, onError);

	const BOTTOM_SHEET_HEIGHT = "67%";

	return (
		<Container style={{ rowGap: 10 }}>
			<BackButton isEnabled={selectedSectionId.value >= 0} />
			<Header />

			<SectionsNavigator
				selectedId={selectedSectionId}
				sections={[
					{
						id: 0,
						title: "Sua Empresa",
						onPress: () =>
							selectedSectionId.value === 1 && updateHandler(0),
					},
					{
						id: 1,
						title: "Dados Adicionais",
					},
				]}
			/>

			<SectionBottomSheet
				bottomSheet={sections[0]}
				expanded={true}
				bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
			>
				<BasicInfo
					control={section0Control}
					errors={section0Errors}
					setValue={setValue}
					getValues={getValues}
				/>
				<ActionButton
					onPress={submitSection0Data}
					preset="next"
					label="Próximo"
				/>
			</SectionBottomSheet>

			<SectionBottomSheet
				bottomSheet={sections[1]}
				expanded={false}
				bottomSheetHeight={BOTTOM_SHEET_HEIGHT}
			>
				<ContactAndAddress
					control={section1Control}
					errors={section1Errors}
					businessData={newBusinessData!}
					onAddressFetch={(addressText) => {
						setValue("address", "");
						setNewBusinessData({
							...newBusinessData,
							geocodedAddress: addressText,
						});
					}}
				/>
				<ActionButton
					onPress={submitSection1Data}
					preset="next"
					style={{ backgroundColor: colors.primary }}
					label="Concluir"
				/>
			</SectionBottomSheet>

			<ConfirmExitModal
				title="Você tem certeza que deseja voltar?"
				message="Será necessário inserir os dados de Seu Negócio novamente para concluir o cadastro."
			/>
		</Container>
	);
}
