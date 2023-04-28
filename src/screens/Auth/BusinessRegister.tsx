import React, { useCallback, useEffect } from "react";
import { GEO_API_KEY } from "@env";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import { SectionsNavigator } from "components/SectionsNavigator";

import {
	BasicInfoForm,
	useBasicInfoForm,
} from "screens/Main/Business/screens/BasicInfo";
import { ActionButton } from "components/Button";

import { BusinessData } from "screens/Main/Business/@types";

// Hooks
import useBackHandler from "hooks/useBackHandler";
import useUpdateHandler from "hooks/useUpdateHandler";
import { useAuth } from "context/AuthContext";
import { api } from "lib/axios";
import Toast from "components/Toast";
import Dropdown from "components/Dropdown";
import {
	Geolocation,
	ServiceForm,
} from "screens/Main/Business/screens/Service";
import axios from "axios";

const sections = [
	"registerSection0BottomSheet",
	"registerSection1BottomSheet",
	"registerSection2BottomSheet",
];

export default function BusinessRegister({ navigation }: any) {
	const { updateSelectedProject } = useAuth();

	const [newBusinessData, setNewBusinessData] = React.useState<
		Partial<BusinessData>
	>({});

	const HEADERS = [
		{
			title: "Vamos começar com o básico.",
			subtitle:
				"Insira os dados básicos que caracterizam o seu empreendimento como ele é.",
		},
		{
			title: "Seus clientes precisam de dados.",
			subtitle:
				"Insira as informações que serão exibidas para elevar a confiabilidade de sua empresa.",
		},
	];

	const { updateHandler, selectedSectionId, Header, BackButton } =
		useUpdateHandler({
			sections,
			HEADERS,
			onLimitReached: () => {
				navigation.goBack();
			},
		});

	const { ConfirmExitModal } = useBackHandler({
		onBack: () => {
			updateHandler(selectedSectionId.value - 1);
		},
		shouldTriggerModal: () => {
			return selectedSectionId.value === 0;
		},
		onExitConfirm: () => {
			navigation.goBack();
		},
	});

	const { submitData: submitSection0Data, ...hookProps } = useBasicInfoForm({
		onSubmit: (data) => {
			setNewBusinessData((prevState) => ({ ...prevState, ...data }));
			updateHandler(1);
		},
	});

	const submitSection1Data = useCallback(async () => {
		try {
			const response = await api.post(`/projects`, newBusinessData);

			if (response.data) {
				updateSelectedProject(response.data.id);
			} else {
				Toast.show({
					preset: "error",
					title: "Erro ao criar projeto",
					message: "Tente novamente mais tarde",
				});
			}
		} catch (error) {
			console.log(error);
			Toast.show({
				preset: "error",
				title: "Erro ao criar projeto",
				message: "Tente novamente mais tarde",
			});
		}
	}, [newBusinessData]);

	const BOTTOM_SHEET_HEIGHT = "65%";

	const [geoData, setGeoData] = React.useState<
		Geolocation[] | undefined | null
	>(undefined);

	useEffect(() => {
		async function getGeoData() {
			console.log(GEO_API_KEY);
			try {
				const response = await axios.get(
					`https://api.countrystatecity.in/v1/countries`,
					{
						headers: {
							"X-CSCAPI-KEY": GEO_API_KEY.replaceAll("'", ""),
						},
					}
				);

				if (response.data) {
					setGeoData(response.data);
				}
			} catch (error) {
				console.log(error);
				setGeoData(null);
			}
		}

		getGeoData();
	}, []);

	return (
		<Container style={{ rowGap: 0 }}>
			<BackButton isEnabled={true} />
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
						title: "Atendimento",
						onPress: () =>
							selectedSectionId.value === 0 && updateHandler(1),
					},
				]}
			/>

			<SectionBottomSheet
				id={sections[0]}
				defaultValues={{
					expanded: true,
				}}
				height={BOTTOM_SHEET_HEIGHT}
			>
				<BasicInfoForm {...hookProps} />
				<ActionButton
					onPress={submitSection0Data}
					preset="next"
					label="Próximo"
				/>
			</SectionBottomSheet>

			<SectionBottomSheet id={sections[1]} height={BOTTOM_SHEET_HEIGHT}>
				<ServiceForm geoData={geoData} />
				<ActionButton
					onPress={submitSection1Data}
					preset="next"
					style={{ backgroundColor: colors.primary }}
					label="Concluir"
				/>
			</SectionBottomSheet>

			<ConfirmExitModal
				title="Você tem certeza que deseja voltar?"
				message="Será necessário inserir os dados do Seu Negócio novamente para concluir o cadastro."
			/>
		</Container>
	);
}
