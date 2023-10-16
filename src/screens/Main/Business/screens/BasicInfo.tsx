import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";

// Components
import Toast from "components/Toast";
import Input, { borderErrorStyle } from "components/Input";
import { Checkbox } from "components/Checkbox";
import { Loading } from "components/StatusMessage";
import MultiSelect, {
	MultiselectItem,
	MultiselectData,
} from "components/Multiselect";

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
	FormRef,
	ProjectObject,
	refineJuridicalPerson,
} from "screens/Main/Business/@types";

// Data

// MMKV
import { useMMKVObject } from "react-native-mmkv";
import { api } from "lib/axios";

// Utils
import { globalStorage } from "context/AuthContext";
import { safeJsonParse } from "utils";

export async function fetchSegments() {
	try {
		const response = await api.get(`/projects/segments`);
		if (!response.data) return null;

		const data = response.data as {
			name: string;
			segments: MultiselectItem[];
		}[];

		const organizedData = data.map((item) => ({
			title: item.name,
			data: item.segments.sort((a, b) => a.name.localeCompare(b.name)),
		}));

		const lastSegment = organizedData.pop();

		const withOutroAsLastData = organizedData
			.sort((a, b) => a.title.localeCompare(b.title))
			.concat(lastSegment ? [lastSegment] : []); // o segmento com o nome "Outros" deve ser o último

		let dataArray = [] as MultiselectData;

		withOutroAsLastData.forEach((item) => {
			dataArray && dataArray.push(item.title);
			item.data.forEach((segment) => {
				dataArray && dataArray.push(segment);
			});
		});

		console.log("Segmentos obtidos com sucesso.");
		return dataArray;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export const BasicInfoForm = forwardRef(
	(
		{
			onSubmit,
			onStateChange,
			initialValues,
			palette,
		}: FormProps & {
			initialValues?: { segments: string[] };
		},
		ref
	) => {
		const [isInformalCheckboxChecked, setIsInformalCheckboxChecked] =
			React.useState(false);

		const [segments, setSegments] = React.useState<string[]>(
			initialValues?.segments ?? []
		);

		// Gambiarra: ver se tem como fazer isso de forma mais performática, como por exemplo, fazer com que o hook seja condicionalmente chamado somente quando houver a propriedade 'onStateChange' no componente pai

		// Esse 'useEffect' diminui um pouco a performance ao atualizar os segmentos pelo 'Multiselect', mas é necessário para que o 'onStateChange' funcione corretamente
		useEffect(() => {
			if (onStateChange) {
				onStateChange(segments);
			}
		}, [segments]);

		const rawSegmentsData = globalStorage.getString("segmentsData");
		const segmentsData = useRef<MultiselectData>(
			safeJsonParse(rawSegmentsData)
		);

		/* ------------------------------------------------------------------------------ */

		const {
			handleSubmit,
			control,
			formState: { errors },
			watch,
			setValue,
		} = useForm<Partial<BusinessData>>({
			mode: "onSubmit",
			defaultValues: initialValues,
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

		const [customErrors, setCustomErrors] = React.useState(
			{} as Record<string, string | undefined>
		);

		const onFormSubmit = useCallback(
			(data: Partial<BusinessData>) => {
				// Caso o negócio seja formal, deve-se verificar se o usuário preencheu o componente 'JuridicalPerson' corretamente,
				// caso contrário, deve-se mostrar um erro
				if (
					isInformalCheckboxChecked === false &&
					(!data.juridicalPerson ||
						refineJuridicalPerson(data.juridicalPerson) === false ||
						data.juridicalPerson?.length === 0)
				) {
					Toast.show({
						preset: "error",
						title: "Opa! Algo está faltando.",
						description:
							"Caso seu negócio seja formal, preencha os dados de pessoa jurídica.",
					});
					setCustomErrors({
						juridicalPerson:
							"Preencha os dados de pessoa jurídica.",
					});
					return;
				}

				onSubmit({ ...data, segments });
			},
			[segments, isInformalCheckboxChecked]
		);

		useImperativeHandle(ref, () => ({
			submitForm: () => handleSubmit(onFormSubmit, onError)(),
			getFormWatch: () => watch,
		}));

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
							infoMessage={`termo registrado sob o qual sua empresa se individualiza das demais acerca de suas atividades\nExemplo: [SUA EMPRESA] Ltda.`}
							value={value}
							onBlur={onBlur}
							onChangeText={(value) => onChange(value)}
							style={!!errors.socialReason && borderErrorStyle}
						/>
					)}
					name="socialReason"
					rules={{ maxLength: 80 }}
				/>
				{!isInformalCheckboxChecked && (
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="CNPJ"
								value={value}
								onFocus={() =>
									setCustomErrors((prev) => ({
										...prev,
										juridicalPerson: undefined,
									}))
								}
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
									!!errors.juridicalPerson ||
									customErrors.juridicalPerson
										? borderErrorStyle
										: {}
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
					checked={isInformalCheckboxChecked}
					onPress={() => {
						setIsInformalCheckboxChecked((prev) => !prev);
						setValue && setValue("juridicalPerson", "");
					}}
				/>
				<MultiSelect
					type="sections"
					label="Segmentos"
					placeholder="Nenhum segmento selecionado"
					bottomSheetProps={{
						title: "Selecione os segmentos da sua empresa",
					}}
					searchBarProps={{
						placeholder: "Pesquisar segmentos",
					}}
					data={segmentsData}
					fetchData={fetchSegments}
					selected={segments}
					setSelected={setSegments}
					pallette={palette}
					fetchErrorProps={{
						defaultText: `Não foi possível carregar os segmentos. Tente novamente mais tarde.`,
						iconSize: 32,
					}}
				/>
			</>
		);
	}
);

export default function BasicInfoScreen() {
	const [currentBusiness, setCurrentBusiness] = useMMKVObject(
		"currentProject"
	) as ProjectObject;
	// este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar mesmo após a atualização dos dados

	if (!currentBusiness) {
		return <Loading />;
	}

	const onSubmit = async (data: Partial<BusinessData>) => {
		setCurrentBusiness((prevData) => ({ ...prevData, ...data }));
		// TODO: enviar dados para o servidor
	};

	const basicInfoRef = useRef<FormRef>(null);
	const [statesToWatch, setStatesToWatch] = React.useState<any[]>([]);

	return (
		<BusinessLayout
			headerProps={{
				title: "Informações Básicas",
			}}
			changesObserverProps={{
				watch:
					basicInfoRef.current?.getFormWatch &&
					basicInfoRef.current?.getFormWatch(),
				currentData: currentBusiness,
				statesToWatch,
			}}
			submitData={() => basicInfoRef.current?.submitForm()}
		>
			<BasicInfoForm
				initialValues={currentBusiness}
				onSubmit={onSubmit}
				onStateChange={setStatesToWatch}
			/>
		</BusinessLayout>
	);
}
