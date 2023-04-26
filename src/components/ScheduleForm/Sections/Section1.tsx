import React, {
	forwardRef,
	useImperativeHandle,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import { View, Text } from "react-native";
import { z } from "zod";

import { useColorScheme } from "nativewind";
import colors from "global/colors";

// Icons
import CurrencyExchangeIcon from "src/assets/icons/currency_exchange.svg";
import WarrantyIcon from "src/assets/icons/warranty.svg";

// Components
import SectionBottomSheet from "../../Form/SectionBottomSheet";
import ToggleGroup, {
	ToggleGroupWithManualValue,
	ToggleGroupWithManualValueRef,
} from "components/ToggleGroup";
import { Section, SubSectionWrapper } from "../../Form/SubSectionWrapper";
import { ActionButton } from "components/Button";
import { CheckboxesGroup, checkboxesGroupReducer } from "components/Checkbox";

// Forms
import Input from "components/Input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	PaymentCondition,
	RemainingValue,
	SplitMethod,
	WarrantyPeriod,
} from "../@types";

const schema = z.object({
	splitInitialValue: z.string().max(10),
	splitValue: z.string().max(10),
	installmentsAmount: z.string().regex(/^[0-9]+x$/),
});

interface FormData {
	splitValue: string;
	splitRemaining: string;
	warrantyDetails: string;
	warrantyPeriod_days: string;
	warrantyPeriod_months: string;
	warrantyPeriod_years: string;
}

const paymentMethods = [
	"Boleto",
	"Dinheiro",
	"Transferência Bancária",
	"Cartão de Crédito",
	"Cartão de Débito",
	"Pix",
];

const Section1 = forwardRef(({ updateHandler, initialValue }: Section, ref) => {
	// Payment Condition - full, card or agreement
	const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>(
		(initialValue?.order?.paymentCondition as PaymentCondition) ?? "full"
	);

	const [checkedPaymentMethods, dispatch] = useReducer(
		checkboxesGroupReducer,
		initialValue?.order?.paymentMethods ?? []
	);

	// Split Method (for agreement)
	// pode ser:
	// 1. parcelas: do cartão quando NÃO há valor restante do acordo (splitRemaining)
	// 2. valor inicial do acordo em dinheiro: quando NÃO HÁ símbolos no valor (ex: número inteiro ['462'], '1/3' ou '1/2')
	// 3. valor inicial do acordo em porcentagem: quando há o símbolo de (%) no valor

	const [splitMethod, setSplitMethod] = useState<SplitMethod | null>(
		initialValue?.order?.splitValue?.includes("%") ? "percentage" : "money"
	);

	// Agreement Initial Value - money (ex: número inteiro ['462'], '1/3' ou '1/2')
	const splitInitialPercentageRef =
		useRef<ToggleGroupWithManualValueRef | null>(null);

	// Agreement Initial Value - percentage (ex: 25%, 65%)
	const splitInitialValueRef = useRef<ToggleGroupWithManualValueRef | null>(
		null
	);

	// Remaining Value - pode ser 'parcelas' (ex: 2x, 3x) ou 'valor restante do acordo' ('remaining')
	const [remainingValue, setRemainingValue] = useState<RemainingValue>(
		(initialValue?.order.splitRemaining === "remaining"
			? "afterCompletion"
			: "withInstallments") as RemainingValue
	);

	// Installments
	const installmentsAmountRef = useRef<ToggleGroupWithManualValueRef | null>(
		null
	);

	// Warranty
	const [warrantyPeriodType, setWarrantyPeriodType] =
		useState<WarrantyPeriod>("days");

	const warrantyPeriodRef = useRef<ToggleGroupWithManualValueRef | null>(
		null
	);

	const {
		control,
		getValues,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			splitValue: initialValue?.order?.splitValue ?? "",
			splitRemaining: initialValue?.order?.splitRemaining ?? "",
			warrantyDetails: initialValue?.order?.warrantyDetails ?? "",
			warrantyPeriod_days:
				initialValue?.order?.warrantyPeriod?.toString() ?? "",
			warrantyPeriod_months: initialValue?.order?.warrantyPeriod
				? (initialValue?.order?.warrantyPeriod / 30).toString()
				: "",
			warrantyPeriod_years: initialValue?.order?.warrantyPeriod
				? (initialValue?.order?.warrantyPeriod / 365).toString()
				: "",
		},
		resolver: zodResolver(schema),
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
	});

	const hasInstallments =
		paymentCondition === "card" ||
		(paymentCondition === "agreement" &&
			remainingValue === "withInstallments");

	useImperativeHandle(ref, () => ({
		getData: () => {
			const splitInitialValueFromInput =
				splitInitialValueRef.current?.getSelected();

			const splitInitialPercentageFromInput =
				splitInitialPercentageRef.current?.getSelected();

			const splitValue =
				paymentCondition === "card"
					? installmentsAmountRef.current?.getSelected()
					: paymentCondition === "agreement" &&
					  splitMethod === "money"
					? splitInitialValueFromInput
					: splitInitialPercentageFromInput;

			const splitRemaining = hasInstallments
				? installmentsAmountRef.current?.getSelected()
				: "remaining";

			const warrantyPeriod = warrantyPeriodRef.current?.getSelected();

			const formDays = warrantyPeriod
				? parseInt(warrantyPeriod) ||
				  (parseInt(
						getValues(`warrantyPeriod_${warrantyPeriodType}`)
				  ) ??
						90)
				: 90;

			const warrantyDays =
				warrantyPeriodType === "days"
					? formDays
					: warrantyPeriodType === "months"
					? formDays * 30
					: formDays * 360;

			const warrantyDetails = getValues("warrantyDetails");

			return {
				paymentCondition,
				checkedPaymentMethods,
				splitValue,
				splitRemaining,
				warrantyDays,
				warrantyDetails,
			};
		},
	}));

	return (
		<>
			<SubSectionWrapper
				header={{
					title: "Condições de Pagamento",
					icon: "credit-card",
				}}
			>
				<View className="flex flex-1" style={{ rowGap: 20 }}>
					<View className="flex-col w-full" style={{ rowGap: 10 }}>
						<ToggleGroup
							data={[
								{
									label: "à vista",
									value: "cash",
								},
								{
									label: "parcelado",
									value: "installments",
								},
								{
									label: "acordo",
									value: "agreement",
								},
							]}
							selected={paymentCondition}
							updateState={setPaymentCondition}
						/>
						{paymentCondition === "agreement" && (
							<ToggleGroup
								data={[
									{
										label: "%",
										value: "percentage",
									},
									{
										label: "R$",
										value: "money",
									},
								]}
								selected={splitMethod}
								updateState={setSplitMethod}
							/>
						)}
					</View>
					{paymentCondition === "agreement" &&
						(splitMethod === "percentage" ? (
							<SubSectionWrapper
								header={{
									title: `Qual o percentual do acordo?`,
								}}
								preset="subSection"
							>
								<ToggleGroupWithManualValue
									key={"agreementInitialPercentage"}
									data={[
										{
											label: "30%",
											value: "30%",
										},
										{
											label: "50%",
											value: "50%",
										},
									]}
									ref={splitInitialPercentageRef}
									defaultValue={
										initialValue?.order?.discount
											? `${initialValue?.order?.discount}%`
											: "50%"
									}
									manualValue={{
										inputProps: {
											placeholder: "Outro (%)",
											keyboardType: "number-pad",
										},
										maxValue: 100,
										unit: {
											label: "%",
											position: "end",
										},
									}}
									control={control}
									name="agreementInitialPercentage"
								/>
							</SubSectionWrapper>
						) : (
							<SubSectionWrapper
								header={{
									title: `Qual o valor inicial a ser pago com o acordo?`,
								}}
								preset="subSection"
							>
								<ToggleGroupWithManualValue
									key={"agreementInitialValue"}
									data={[
										{
											label: "um terço",
											value: "1/3",
										},
										{
											label: "metade",
											value: "1/2",
										},
									]}
									ref={splitInitialValueRef}
									defaultValue={
										(initialValue?.order
											?.splitValue as SplitMethod) ??
										"1/2"
									}
									manualValue={{
										inputProps: {
											placeholder: "Outro (R$)",
											keyboardType: "number-pad",
										},
										unit: {
											label: "R$ ",
											position: "start",
										},
									}}
									control={control}
									name="agreementInitialValue"
								/>
							</SubSectionWrapper>
						))}
					{paymentCondition === "agreement" && (
						<SubSectionWrapper
							header={{
								title: "Como o valor restante será pago?",
							}}
							preset="subSection"
						>
							<ToggleGroup
								data={[
									{
										label: "após a conclusão",
										value: "afterCompletion",
									},
									{
										label: "em parcelas",
										value: "withInstallments",
									},
								]}
								selected={remainingValue}
								updateState={setRemainingValue}
							/>
						</SubSectionWrapper>
					)}
					{hasInstallments && (
						<SubSectionWrapper
							header={{
								title: "Em quantas parcelas o valor será dividido?",
							}}
							preset="subSection"
						>
							<ToggleGroupWithManualValue
								key={"installmentsAmount"}
								data={[
									{
										label: "2x",
										value: "2x",
									},
									{
										label: "3x",
										value: "3x",
									},
								]}
								ref={installmentsAmountRef}
								defaultValue={
									initialValue?.order?.splitValue
										? `${initialValue?.order?.splitValue}x`
										: "2x"
								}
								manualValue={{
									inputProps: {
										placeholder: "Outro (parcelas)",
										keyboardType: "number-pad",
									},
									unit: {
										label: "x",
										position: "end",
									},
								}}
								control={control}
								name="installmentsAmount"
							/>
						</SubSectionWrapper>
					)}
				</View>
			</SubSectionWrapper>

			<SubSectionWrapper
				header={{
					title: "Métodos de Pagamento",
					customIcon: CurrencyExchangeIcon as any,
				}}
			>
				<CheckboxesGroup
					data={paymentMethods}
					checked={checkedPaymentMethods}
					dispatch={dispatch}
				/>
			</SubSectionWrapper>

			<SubSectionWrapper
				header={{
					title: "Garantia",
					customIcon: WarrantyIcon as any,
				}}
			>
				<View className="flex-col w-full" style={{ rowGap: 10 }}>
					<View>
						<ToggleGroup
							data={[
								{
									label: "dias",
									value: "days",
								},
								{
									label: "meses",
									value: "months",
								},
								{
									label: "anos",
									value: "years",
								},
							]}
							selected={warrantyPeriodType}
							updateState={(value) =>
								setWarrantyPeriodType(value as WarrantyPeriod)
							}
						/>
					</View>
					{warrantyPeriodType === "days" && (
						<ToggleGroupWithManualValue
							data={[
								{
									label: "30 dias",
									value: "30",
								},
								{
									label: "90 dias",
									value: "90",
								},
							]}
							ref={warrantyPeriodRef}
							defaultValue={
								initialValue?.order?.warrantyPeriod
									? initialValue.order.warrantyPeriod.toString()
									: "90"
							}
							manualValue={{
								inputProps: {
									placeholder: "Outro (dias)",
									keyboardType: "number-pad",
								},
								unit: {
									label: " dias",
									position: "end",
								},
							}}
							control={control}
							name="warrantyPeriod_days"
						/>
					)}
					{warrantyPeriodType === "months" && (
						<ToggleGroupWithManualValue
							data={[
								{
									label: "1 mês",
									value: "1",
								},
								{
									label: "2 meses",
									value: "2",
								},
							]}
							ref={warrantyPeriodRef}
							defaultValue={"2"}
							manualValue={{
								inputProps: {
									placeholder: "Outro (meses)",
									keyboardType: "number-pad",
								},
								unit: {
									label: " meses",
									position: "end",
								},
							}}
							control={control}
							name="warrantyPeriod_months"
						/>
					)}
					{warrantyPeriodType === "years" && (
						<ToggleGroupWithManualValue
							data={[
								{
									label: "1 ano",
									value: "1",
								},
								{
									label: "2 anos",
									value: "2",
								},
							]}
							ref={warrantyPeriodRef}
							defaultValue={"1"}
							manualValue={{
								inputProps: {
									placeholder: "Outro (anos)",
									keyboardType: "number-pad",
								},
								unit: {
									label: " anos",
									position: "end",
								},
							}}
							control={control}
							name="warrantyPeriod_years"
						/>
					)}
				</View>
				<Text className="text-center text-gray-100 text-sm w-full mb-4">
					O prazo de garantia legal para serviços e produtos duráveis
					estabelecido por lei é de{" "}
					<Text className="font-bold">90 dias</Text>.
				</Text>

				<View className="w-full">
					<SubSectionWrapper
						header={{ title: "Condições da Garantia" }}
						preset="subSection"
					>
						<View className="w-full">
							<Controller
								control={control}
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<Input
										onBlur={onBlur}
										onChangeText={(value) =>
											onChange(value)
										}
										value={value}
										placeholder="Ex: A garantia não acoberta problemas que envolvam o desgaste dos materiais"
										style={{ width: "100%" }}
										multiline
									/>
								)}
								name="warrantyDetails"
								rules={{ required: true }}
							/>
						</View>
					</SubSectionWrapper>
				</View>
			</SubSectionWrapper>

			<ActionButton
				label="Próximo"
				onPress={() => updateHandler && updateHandler(2)}
				preset="next"
			/>
		</>
	);
});

export default Section1;
