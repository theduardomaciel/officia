import React, { useCallback, useEffect } from "react";
import colors from "global/colors";

// Components
import Container from "components/Container";
import SectionBottomSheet from "components/Form/SectionBottomSheet";
import { SectionsNavigator } from "components/SectionsNavigator";

import {
	BasicInfoForm,
	fetchSegments,
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

import {
	Geolocation,
	ServiceForm,
	fetchCountries,
} from "screens/Main/Business/screens/Service";

const sections = [
	"registerSection0BottomSheet",
	"registerSection1BottomSheet",
	"registerSection2BottomSheet",
];

import { globalStorage } from "context/AuthContext";

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

	useEffect(() => {
		const getSegmentsData = async () => {
			globalStorage.set("segmentsData", "pending");
			try {
				const response = await fetchSegments();
				if (response) {
					globalStorage.set("segmentsData", JSON.stringify(response));
				} else {
					globalStorage.delete("segmentsData");
				}
			} catch (error) {
				globalStorage.delete("segmentsData");
				console.log(error);
			}
		};

		const getCountriesData = async () => {
			globalStorage.set("countriesData", "pending");
			try {
				const response = await fetchCountries();
				if (response) {
					globalStorage.set(
						"countriesData",
						JSON.stringify(response)
					);
				} else {
					globalStorage.delete("countriesData");
				}
			} catch (error) {
				globalStorage.delete("countriesData");
				console.log(error);
			}
		};

		getSegmentsData();
		getCountriesData();
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
				ignoreBottomRequirementToFixContentHeight
			>
				<BasicInfoForm {...hookProps} />
				<ActionButton
					onPress={submitSection0Data}
					preset="next"
					label="Próximo"
				/>
			</SectionBottomSheet>

			<SectionBottomSheet id={sections[1]} height={BOTTOM_SHEET_HEIGHT}>
				<ServiceForm />
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
