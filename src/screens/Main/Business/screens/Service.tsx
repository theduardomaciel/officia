import React, { useEffect, useReducer, useRef } from "react";
import { GEO_API_KEY } from "@env";

// Components
import { BusinessScrollView } from "components/Container";
import Toast from "components/Toast";
import Input, { borderErrorStyle } from "components/Input";
import Dropdown from "components/Dropdown";
import { Checkbox, CheckboxesGroup } from "components/Checkbox";
import Collapsible from "components/Collapsible";
import Multiselect, {
	MultiselectItem,
	MultiselectProps,
} from "components/Multiselect";

import BusinessLayout from "../Layout";

// Types
import {
	serviceScheme,
	ServiceSchemeType,
	BusinessData,
	FormProps,
} from "screens/Main/Business/@types";
import type { StateToWatch } from "hooks/useFormChangesObserver";

// MMKV
import { useMMKVObject } from "react-native-mmkv";
import ToggleGroup, {
	ToggleGroupWithManualValue,
} from "components/ToggleGroup";
import SectionWrapper, {
	SubSectionWrapper,
} from "components/Form/SectionWrapper";
import { checkboxesGroupReducer } from "components/Checkbox";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

import countries_pt from "assets/countries_pt.json";
import { globalStorage } from "context/AuthContext";
import { MultiselectData } from "components/Multiselect";
import { safeJsonParse } from "utils";

type BusinessModel = "in_person" | "delivery" | "online";

const schema = z.object({
	manualBusyAmount: z.string().optional(),
	manualUnavailableAmount: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export interface Geolocation {
	name: string;
	id: number;
	iso2?: string;
}

export async function fetchCountries() {
	try {
		const response = await axios.get(
			`https://api.countrystatecity.in/v1/countries`,
			{
				headers: {
					"X-CSCAPI-KEY": GEO_API_KEY.replaceAll("'", ""),
				},
			}
		);

		const data = response.data as Geolocation[];
		if (data) {
			console.log("Dados de geolocalização obtidos com sucesso.");

			const parsedData = data.map((geo) => ({
				id: geo.id.toString(),
				name:
					countries_pt.find(
						(translationCountry) =>
							translationCountry.id == geo.id.toString()
					)?.name ?? geo.name,
				iso2: geo.iso2,
			}));

			return parsedData;
		} else {
			console.log("Erro ao obter dados de geolocalização.");
			return null;
		}
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function fetchStates({ ciso }: { ciso: string }) {
	try {
		const response = await axios.get(
			`https://api.countrystatecity.in/v1/countries/${ciso}/states`,
			{
				headers: {
					"X-CSCAPI-KEY": GEO_API_KEY.replaceAll("'", ""),
				},
			}
		);
		return response.data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function fetchCities({ ciso, siso }: { ciso: string; siso: string }) {
	try {
		const response = await axios.get(
			`https://api.countrystatecity.in/v1/countries/${ciso}/states/${siso}/cities`,
			{
				headers: {
					"X-CSCAPI-KEY": GEO_API_KEY.replaceAll("'", ""),
				},
			}
		);

		return response.data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

type AdaptedGeolocation = MultiselectItem & { id: string; iso2: string }[];

export function ServiceForm({
	initialValues,
}: {
	initialValues?: Partial<BusinessData>;
}) {
	const {
		handleSubmit,
		control,
		formState: { errors },
		watch,
		setValue,
	} = useForm<FormData>({
		mode: "onSubmit",
		values: initialValues
			? {
					manualBusyAmount:
						initialValues.busyAmount?.toString() ?? "",
					manualUnavailableAmount:
						initialValues.unavailableAmount?.toString() ?? "",
			  }
			: undefined,
		resetOptions: {
			keepDirtyValues: true,
			keepErrors: true,
		},
		resolver: zodResolver(schema),
	});

	const onError: SubmitErrorHandler<FormData> = (errors) => {
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			message: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const submitData = handleSubmit((data) => {
		/* onSubmit({ ...data }); */
	}, onError);

	/* Basic */

	const [businessModel, setBusinessModel] = React.useState<BusinessModel[]>(
		(initialValues?.businessModels as BusinessModel[]) ?? []
	);
	const [agendaPreset, setAgendaPreset] = React.useState<
		"everyday" | "working_days" | "custom"
	>("everyday");

	const [customAgenda, dispatch] = useReducer(
		checkboxesGroupReducer,
		initialValues?.agenda ?? []
	);

	/* Advanced */
	const [autoHoliday, setAutoHoliday] = React.useState<boolean>(
		initialValues?.autoHolidayUnavailability ?? false
	);

	/* Service Zone */

	const rawCountriesData = globalStorage.getString("countriesData");
	const countriesData = useRef<MultiselectData | undefined | null>(
		rawCountriesData
			? rawCountriesData === "undefined"
				? undefined
				: safeJsonParse(rawCountriesData)
			: null
	);

	const [selectedCountriesIds, setSelectedCountriesIds] = React.useState<
		string[]
	>(initialValues?.serviceZoneCountries ?? []);

	const statesData = useRef<MultiselectData | undefined | null>(undefined);
	const [selectedStatesIds, setSelectedStatesIds] = React.useState<string[]>(
		initialValues?.serviceZoneStates ?? []
	);

	const citiesData = useRef<MultiselectData | undefined | null>(undefined);
	const [selectedCitiesIds, setSelectedCitiesIds] = React.useState<string[]>(
		initialValues?.serviceZoneCities ?? []
	);

	useEffect(() => {
		async function checkCountry() {
			if (selectedCountriesIds.length === 1) {
				const typedCountriesData =
					countriesData.current as unknown as MultiselectItem &
						{ id: string; iso2: string }[];

				const states = (await fetchStates({
					ciso: typedCountriesData?.find(
						(country) => country.id === selectedCountriesIds[0]
					)?.iso2 as string,
				})) as Geolocation[];

				if (states) {
					statesData.current = states
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((state) => ({
							id: state.id.toString(),
							name: state.name,
							iso2: state.iso2,
						})) as unknown as MultiselectData;
				} else {
					statesData.current = null;
				}
			}
		}

		checkCountry();
	}, [selectedCountriesIds]);

	useEffect(() => {
		async function checkStates() {
			if (selectedStatesIds.length === 1) {
				const typedCountriesData =
					countriesData.current as unknown as AdaptedGeolocation;
				const typedStatesData =
					statesData.current as unknown as AdaptedGeolocation;

				const cities = (await fetchCities({
					ciso: typedCountriesData?.find(
						(country) => country.id === selectedCountriesIds[0]
					)?.iso2 as string,
					siso: typedStatesData?.find(
						(state) => state.id === selectedStatesIds[0]
					)?.iso2 as string,
				})) as Geolocation[];

				if (cities) {
					citiesData.current = cities
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((city) => ({
							id: city.id.toString(),
							name: city.name,
							iso2: city.iso2,
						}));
				} else {
					citiesData.current = null;
				}
			}
		}

		checkStates();
	}, [selectedStatesIds]);

	return (
		<BusinessScrollView>
			<SubSectionWrapper
				headerProps={{
					title: `Qual o seu modelo de negócio?`,
				}}
			>
				<ToggleGroup
					selected={businessModel}
					updateState={(item: BusinessModel) => {
						setBusinessModel((prev) =>
							prev.includes(item)
								? prev.filter(
										(i) => i !== (item as BusinessModel)
								  )
								: [...prev, item as BusinessModel]
						);
					}}
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

			<SectionWrapper
				headerProps={{
					title: "Agenda",
					icon: "calendar-today",
				}}
			>
				<SubSectionWrapper
					headerProps={{
						title: "Quais dias da semana você está disponível em condições normais?",
					}}
				>
					<ToggleGroup
						selected={agendaPreset}
						updateState={setAgendaPreset}
						data={[
							{
								label: "todos os dias",
								value: "everyday",
							},
							{
								label: "dias úteis",
								value: "working_days",
							},
							{
								label: "personalizado",
								value: "custom",
							},
						]}
					/>
				</SubSectionWrapper>
				{agendaPreset === "custom" && (
					<CheckboxesGroup
						checked={customAgenda}
						dispatch={dispatch}
						data={[
							"Domingo",
							"Segunda",
							"Terça",
							"Quarta",
							"Quinta",
							"Sexta",
							"Sábado",
						]}
					/>
				)}
				<Collapsible
					label="Configurações Avançadas"
					contentViewStyle={{ rowGap: 20 }}
					additionalSize={5}
				>
					<Checkbox
						title="Tornar feriados indisponíveis automaticamente"
						checked={autoHoliday}
						onPress={() => setAutoHoliday((prev) => !prev)}
						customKey="holidayCheckbox"
					/>
					<SubSectionWrapper
						headerProps={{
							title: "Com quantos pedidos um dia deve tornar-se ocupado?",
						}}
					>
						<ToggleGroupWithManualValue
							data={[
								{
									label: "1",
									value: "1",
								},
								{
									label: "2",
									value: "2",
								},
							]}
							control={control}
							name="manualBusyAmount"
							manualValue={{
								inputProps: {
									placeholder: "Outro (pedidos)",
									keyboardType: "numeric",
								},
								maxValue: 100000,
								unit: {
									label: "pedidos",
									position: "end",
								},
							}}
							defaultValue={
								initialValues?.busyAmount?.toString() ?? "1"
							}
						/>
					</SubSectionWrapper>
					<SubSectionWrapper
						headerProps={{
							title: "Com quantos pedidos um dia deve tornar-se indisponível?",
						}}
					>
						<ToggleGroupWithManualValue
							data={[
								{
									label: "3",
									value: "3",
								},
								{
									label: "5",
									value: "5",
								},
							]}
							control={control}
							name="manualUnavailableAmount"
							manualValue={{
								inputProps: {
									placeholder: "Outro (pedidos)",
									keyboardType: "numeric",
								},
								maxValue: 100000,
								unit: {
									label: "pedidos",
									position: "end",
								},
							}}
							defaultValue={
								initialValues?.unavailableAmount?.toString() ??
								"3"
							}
						/>
					</SubSectionWrapper>
				</Collapsible>
			</SectionWrapper>

			<SectionWrapper
				headerProps={{
					title: "Zona de Atendimento",
					icon: "explore",
					description: `Deixe seus clientes cientes de quais locais você é capaz de atender.\nSelecione abaixo a área que mais abrange sua capacidade.`,
				}}
			>
				<Multiselect
					label="Países"
					bottomSheetProps={{
						title: "Selecione os países que você atende",
					}}
					data={countriesData as MultiselectProps["data"]}
					searchBarProps={{
						placeholder: "Pesquisar países",
					}}
					placeholder="Todos os países"
					allSelectedPlaceholder="Todos os países"
					selected={selectedCountriesIds}
					setSelected={setSelectedCountriesIds}
					pallette="dark"
				/>
				{selectedCountriesIds.length === 1 && (
					<Multiselect
						bottomSheetProps={{
							title: "Selecione os estados que você atende",
						}}
						label="Estados"
						data={statesData}
						searchBarProps={{
							placeholder: "Pesquisar estados",
						}}
						placeholder="Todos os estados"
						allSelectedPlaceholder="Todos os estados"
						selected={selectedStatesIds}
						setSelected={setSelectedStatesIds}
						pallette="dark"
					/>
				)}
				{selectedStatesIds.length === 1 && (
					<Multiselect
						bottomSheetProps={{
							title: "Selecione as cidades que você atende",
						}}
						label="Cidades"
						data={citiesData}
						searchBarProps={{
							placeholder: "Pesquisar cidades",
						}}
						allSelectedPlaceholder="Todas as cidades"
						placeholder="Todas as cidades"
						selected={selectedCitiesIds}
						setSelected={setSelectedCitiesIds}
						pallette="dark"
					/>
				)}
			</SectionWrapper>
		</BusinessScrollView>
	);
}

export default function ServiceScreen() {
	const [currentBusiness, setCurrentBusiness] = useMMKVObject(
		"currentBusiness"
	) as [BusinessData, React.Dispatch<React.SetStateAction<BusinessData>>];
	// este estado é necessário em todas as telas pois o parâmetro de comparação tem que atualizar mesmo após a atualização dos dados

	const memoizedCurrentBusiness = React.useMemo(() => currentBusiness, []);

	const onSubmit = async (data: ServiceSchemeType) => {
		setCurrentBusiness((prevData) => ({ ...prevData, ...data }));
		// TODO: enviar dados para o servidor
	};

	/* const { OrderForm, submitData, statesToWatch } = useServiceForm({
		onSubmit,
		defaultValues: memoizedCurrentBusiness,
	}); */

	return <></>;
}

/* 

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
*/
