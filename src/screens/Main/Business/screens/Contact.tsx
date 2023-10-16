import React from "react";

// Components
import { ContainerScrollView } from "components/Container";
import Toast from "components/Toast";
import Input, { borderErrorStyle } from "components/Input";
import Dropdown from "components/Dropdown";
import { Checkbox } from "components/Checkbox";

import BusinessLayout from "../Layout";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import formatWithMask, { MASKS } from "utils/maskHandler";

// Types
import {
	basicInfoScheme,
	BasicInfoSchemeType,
	BusinessData,
	FormProps,
} from "screens/Main/Business/@types";
import type { StateToWatch } from "hooks/useFormChangesObserver";

// MMKV
import { useMMKVObject } from "react-native-mmkv";

export function useContactForm({ defaultValues, onSubmit }: FormProps) {
	const {
		handleSubmit,
		control,
		formState: { errors },
		watch,
		getValues,
		setValue,
	} = useForm<BasicInfoSchemeType>({
		mode: "onSubmit",
		defaultValues: {
			fantasyName: "",
			juridicalPerson: "",
			socialReason: "",
		},
		values: defaultValues ? defaultValues : undefined,
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(basicInfoScheme),
	});

	const onError: SubmitErrorHandler<BasicInfoSchemeType> = (errors) => {
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			description: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const submitData = handleSubmit((data) => {
		onSubmit(data);
	}, onError);

	const [isFormalCheckboxChecked, setIsFormalCheckboxChecked] =
		React.useState(getValues().juridicalPerson === "");

	const [selectedBusinessType, setSelectedBusinessType] =
		React.useState("generalOrders");
	const [selectedProductType, setSelectedProductType] =
		React.useState("products");

	function BasicInfoForm() {
		return (
			<ContainerScrollView>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input
							label="Nome Fantasia"
							value={value}
							onBlur={onBlur}
							onChangeText={(value) => onChange(value)}
							style={!!errors.fantasyName && borderErrorStyle}
						/>
					)}
					name="fantasyName"
					rules={{ maxLength: 50 }}
				/>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input
							label="Razão Social"
							infoMessage={`termo registrado sob o qual uma pessoa jurídica (PJ) se individualiza e exerce suas atividades\nExemplo: Coca Cola Indústrias Ltda.`}
							value={value}
							onBlur={onBlur}
							onChangeText={(value) => onChange(value)}
							style={!!errors.socialReason && borderErrorStyle}
						/>
					)}
					name="socialReason"
					rules={{ maxLength: 80 }}
				/>
				{!isFormalCheckboxChecked && (
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="CNPJ"
								value={value}
								onBlur={onBlur}
								onChangeText={(value) => {
									const { masked } = formatWithMask({
										text: value,
										mask: MASKS.BRL_CNPJ,
									});
									onChange(masked);
								}}
								maxLength={18}
								keyboardType="numeric"
								style={
									!!errors.juridicalPerson && borderErrorStyle
								}
							/>
						)}
						name="juridicalPerson"
					/>
				)}
				<Checkbox
					preset="dark"
					customKey="formality"
					title="Não possuo uma empresa formal"
					checked={isFormalCheckboxChecked}
					onPress={() => {
						setIsFormalCheckboxChecked(!isFormalCheckboxChecked);
						setValue && setValue("juridicalPerson", "");
					}}
				/>
				<Dropdown
					label="Tipo de empreendimento"
					bottomSheetLabel="Selecione o tipo de empreendimento"
					selected={selectedBusinessType}
					setSelected={setSelectedBusinessType}
					bottomSheetHeight="45%"
					data={[
						{
							label: "Serviços gerais",
							value: "generalOrders",
						},
						{
							label: "Comércio",
							value: "store",
						},
						{
							label: "Prestação de serviços",
							value: "serviceProvider",
						},
						{
							label: "Outro",
							value: "other",
						},
					]}
				/>
				<Dropdown
					label="Tipo de Produto"
					description="Qual palavra descreve melhor o que você vende, fornece ou usa em seu negócio?"
					bottomSheetLabel="Selecione o tipo de produto"
					selected={selectedProductType}
					setSelected={setSelectedProductType}
					bottomSheetHeight="30%"
					data={[
						{
							label: "Produtos",
							value: "products",
						},
						{
							label: "Serviços",
							value: "orders",
						},
						{
							label: "Peças",
							value: "parts",
						},
					]}
				/>
			</ContainerScrollView>
		);
	}

	const statesToWatch = [
		{
			name: "businessType",
			state: selectedBusinessType,
		},
		{
			name: "productType",
			state: selectedProductType,
		},
	] as StateToWatch[];

	return { BasicInfoForm, submitData, watch, statesToWatch };
}

export default function BasicInfoScreen() {
	const [currentBusiness, setCurrentBusiness] = useMMKVObject(
		"currentBusiness"
	) as [BusinessData, React.Dispatch<React.SetStateAction<BusinessData>>];
	// este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar mesmo após a atualização dos dados

	const memoizedCurrentBusiness = React.useMemo(() => currentBusiness, []);

	const onSubmit = async (data: BasicInfoSchemeType) => {
		setCurrentBusiness((prevData) => ({ ...prevData, ...data }));
		// TODO: enviar dados para o servidor
	};

	const { BasicInfoForm, submitData, watch, statesToWatch } = useContactForm({
		onSubmit,
		defaultValues: memoizedCurrentBusiness,
	});

	return (
		<BusinessLayout
			headerProps={{
				title: "Contato",
			}}
			changesObserverProps={{
				currentData: currentBusiness,
				watch,
				statesToWatch,
			}}
			submitData={submitData}
		>
			<BasicInfoForm />
		</BusinessLayout>
	);
}
