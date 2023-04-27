import React, { SetStateAction, useCallback, useEffect } from "react";

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
import {
	MultiselectCategory,
	MultiselectData,
	SectionsMultiselect,
} from "components/Multiselect";
import { Loading } from "components/StatusMessage";
import { api } from "lib/axios";

interface FormProps {
	control: any;
	errors: any;
	setValue?: any;
	onStateChange?: (states: any[]) => void;
}

export function BasicInfoForm({
	control,
	errors,
	setValue,
	onStateChange,
	dbSegments,
}: FormProps & { dbSegments?: MultiselectCategory[] | null }) {
	const [isFormalCheckboxChecked, setIsFormalCheckboxChecked] =
		React.useState(false);

	const [segments, setSegments] = React.useState<string[]>([]);

	// Gambiarra: ver se tem como fazer isso de forma mais performática, como por exemplo, fazer com que o hook seja condicionalmente chamado somente quando houver a propriedade 'onStateChange' no componente pai

	// Esse 'useEffect' diminui um pouco a performance ao atualizar os segmentos pelo 'Multiselect', mas é necessário para que o 'onStateChange' funcione corretamente
	useEffect(() => {
		if (onStateChange) {
			onStateChange(segments);
		}
	}, [segments]);

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
			<SectionsMultiselect
				label="Segmentos"
				data={dbSegments}
				placeholder="Nenhum segmento selecionado"
				bottomSheetProps={{
					title: "Selecione os segmentos da sua empresa",
				}}
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

	const [dbSegments, setDbSegments] = React.useState<
		MultiselectCategory[] | undefined | null
	>(undefined);

	useEffect(() => {
		const getSegments = async () => {
			try {
				const response = await api.get(`/projects/segments`);
				if (!response.data) return setDbSegments(null);

				/* const data = response.data as {
					name: string;
					segments: MultiselectData[];
				}[];

				setDbSegments(
					data
						.map((item) => ({
							title: item.name,
							data: item.segments.sort((a, b) =>
								a.name.localeCompare(b.name)
							),
						}))
						.sort((a, b) => a.title.localeCompare(b.title))
				); */

				let data = response.data as {
					name: string;
					segments: MultiselectData[];
				}[];

				const organizedData = data.map((item) => ({
					title: item.name,
					data: item.segments.sort((a, b) =>
						a.name.localeCompare(b.name)
					),
				}));

				const lastSegment = organizedData.pop();

				setDbSegments(
					organizedData
						.sort((a, b) => a.title.localeCompare(b.title))
						.concat(lastSegment ? [lastSegment] : []) // o segmento com o nome "Outros" deve ser o último
				);
				console.log("Segmentos obtidos com sucesso.");
			} catch (error) {
				console.log(error);
				setDbSegments(null);
			}
		};

		getSegments();
	}, []);

	return {
		control,
		dbSegments,
		errors,
		submitData,
		setValue,
		watch,
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
