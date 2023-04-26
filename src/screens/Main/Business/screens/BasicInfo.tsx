import React, { SetStateAction } from "react";

// Components
import { BusinessScrollView } from "components/Container";
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
	FormHookProps,
} from "screens/Main/Business/@types";
import type { StateToWatch } from "hooks/useFormChangesObserver";

// MMKV
import { useMMKVObject } from "react-native-mmkv";
import Multiselect from "components/Multiselect";
import { Loading } from "components/StatusMessage";

interface FormProps {
	control: any;
	errors: any;
	setValue?: any;
}

export function BasicInfoForm({ control, errors, setValue }: FormProps) {
	const [isFormalCheckboxChecked, setIsFormalCheckboxChecked] =
		React.useState(false);

	const [segments, setSegments] = React.useState<string[]>([]);

	return (
		<>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						label="Nome da Empresa"
						value={value}
						onBlur={onBlur}
						onChangeText={(value) => onChange(value)}
						style={!!errors.name && borderErrorStyle}
					/>
				)}
				name="name"
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
							style={!!errors.juridicalPerson && borderErrorStyle}
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
			<Multiselect
				label="Segmentos"
				data={[
					{
						title: "Alimentação",
						data: [
							{ name: "Bares" },
							{ name: "Cafeterias" },
							{ name: "Confeitarias" },
							{ name: "Docerias" },
							{ name: "Lanchonetes" },
							{ name: "Padarias" },
							{ name: "Pizzarias" },
							{ name: "Restaurantes" },
							{ name: "Outros" },
						],
					},
					{
						title: "Beleza",
						data: [
							{ name: "Barbearias" },
							{ name: "Cabeleireiros" },
							{ name: "Clínicas de Estética" },
							{ name: "Cosméticos" },
							{ name: "Manicures e Pedicures" },
							{ name: "Maquiadores" },
							{ name: "Outros" },
						],
					},
					{
						title: "Educação",
						data: [
							{ name: "Aulas Particulares" },
							{ name: "Cursos" },
							{ name: "Escolas" },
							{ name: "Faculdades" },
							{ name: "Outros" },
						],
					},
				]}
				bottomSheetLabel="Selecione os segmentos da sua empresa"
				placeholder="Nenhum segmento selecionado"
				searchBarProps={{
					placeholder: "Pesquisar segmentos",
				}}
				selected={segments}
				setSelected={setSegments}
				pallette="dark"
			/>
		</>
	);
}

export function useBasicInfoForm({ defaultValues, onSubmit }: FormHookProps) {
	const {
		handleSubmit,
		control,
		formState: { errors },
		watch,
		setValue,
	} = useForm<Partial<BusinessData>>({
		mode: "onSubmit",
		defaultValues: {
			name: "",
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
			message: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const submitData = handleSubmit((data) => {
		onSubmit({ ...data });
	}, onError);

	return {
		control,
		errors,
		submitData,
		setValue,
	};
}

/* 

<Dropdown
				data={[
					{ label: "Opção 1", value: "1" },
					{ label: "Opção 2", value: "2" },
					{ label: "Opção 3", value: "3" },
				]}
				selected={opt}
				setSelected={setOpt}
			/>
*/

export default function BasicInfoScreen() {
	const [currentBusiness, setCurrentBusiness] = useMMKVObject(
		"currentBusiness"
	) as [BusinessData, React.Dispatch<React.SetStateAction<BusinessData>>];
	// este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar mesmo após a atualização dos dados

	if (!currentBusiness) {
		return <Loading />;
	}

	const memoizedCurrentBusiness = React.useMemo(() => currentBusiness, []);

	const onSubmit = async (data: BasicInfoSchemeType) => {
		setCurrentBusiness((prevData) => ({ ...prevData, ...data }));
		// TODO: enviar dados para o servidor
	};

	/* const { BasicInfoForm, submitData, watch, statesToWatch } =
		useBasicInfoForm({
			onSubmit,
			defaultValues: memoizedCurrentBusiness,
		}); */

	return null;
}

{
	/* <BusinessLayout
        headerProps={{
            title: "Informações Básicas",
        }}
        changesObserverProps={{
            currentData: currentBusiness,
            watch,
            statesToWatch,
        }}
        submitData={submitData}
    >
        <BasicInfoForm />
    </BusinessLayout> */
}
