import React from "react";

// Components
import { BusinessScrollView } from "components/Container";
import Toast from "components/Toast";
import Input, { borderErrorStyle } from "components/Input";
import Dropdown from "components/Dropdown";
import { Checkbox } from "components/Checkbox";

import BusinessLayout from "../Layout";

// Types
import {
	serviceScheme,
	OrderSchemeType,
	BusinessData,
	FormProps,
} from "screens/Main/Business/@types";
import type { StateToWatch } from "hooks/useFormChangesObserver";

// MMKV
import { useMMKVObject } from "react-native-mmkv";
import ToggleGroup from "components/ToggleGroup";
import { SubSectionWrapper } from "components/Form/SubSectionWrapper";

export function useOrderForm({ defaultValues, onSubmit }: FormProps) {
	const onError = (errors: string[]) => {
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			message: Object.values(errors)
				.map((error) => error)
				.join("\n"),
		});
	};

	const [businessType, setBusinessModel] = React.useState<
		"in_person" | "delivery" | "online"
	>(defaultValues?.businessModel ?? "online");
	const [agenda, setAgenda] = React.useState<DAYS[]>([
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	]);

	const submitData = () => {
		onSubmit({});
	};

	function OrderForm() {
		return (
			<BusinessScrollView>
				<SubSectionWrapper
					header={{
						title: `Qual o seu modelo de negócio?`,
					}}
					preset="subSection"
				>
					<ToggleGroup
						selected={businessModel}
						updateState={setBusinessModel}
						data={[
							{
								label: "presencial",
								value: "in_person",
							},
							{
								label: "online",
								value: "online",
							},
							{
								label: "por entrega",
								value: "delivery",
							},
						]}
					/>
				</SubSectionWrapper>

				<SubSectionWrapper
					header={{
						title: "Agenda",
						icon: "calendar_month",
					}}
				>
					<ToggleGroup
						selected={businessModel}
						updateState={setBusinessModel}
						data={[
							{
								label: "presencial",
								value: "in_person",
							},
							{
								label: "online",
								value: "online",
							},
							{
								label: "por entrega",
								value: "delivery",
							},
						]}
					/>
				</SubSectionWrapper>
			</BusinessScrollView>
		);
	}

	const statesToWatch = [] as StateToWatch[];

	return { OrderForm, submitData, statesToWatch };
}

export default function BasicInfoScreen() {
	const [currentBusiness, setCurrentBusiness] = useMMKVObject(
		"currentBusiness"
	) as [BusinessData, React.Dispatch<React.SetStateAction<BusinessData>>];
	// este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar mesmo após a atualização dos dados

	const memoizedCurrentBusiness = React.useMemo(() => currentBusiness, []);

	const onSubmit = async (data: OrderSchemeType) => {
		setCurrentBusiness((prevData) => ({ ...prevData, ...data }));
		// TODO: enviar dados para o servidor
	};

	const { OrderForm, submitData, statesToWatch } = useOrderForm({
		onSubmit,
		defaultValues: memoizedCurrentBusiness,
	});

	return (
		<BusinessLayout
			headerProps={{
				title: "Atendimento",
			}}
			changesObserverProps={{
				currentData: currentBusiness,
				statesToWatch,
			}}
			submitData={submitData}
		>
			<OrderForm />
		</BusinessLayout>
	);
}
