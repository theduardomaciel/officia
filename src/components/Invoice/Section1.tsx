import { Text, View } from "react-native";
import clsx from "clsx";

// Components
import { Checkbox } from "components/Checkbox";
import { PreviewStatic } from "components/Preview";
import {
	PaymentMethodsReview,
	ReviewSection,
	WarrantyReview,
} from "components/ScheduleForm/Sections/Section2";
import { SubSectionWrapper } from "components/ScheduleForm/SubSectionWrapper";
import { ActionButton } from "components/Button";

// Utils
import { getPaymentCondition } from "utils/getInvoicePDFString";
import { InvoiceSectionProps } from "./@types";
import colors from "global/colors";

export default function Section1({
	onSubmit,
	isLoading,
	service,
	subServices,
	materials,
}: InvoiceSectionProps) {
	// Data
	const subServicesTotal = subServices
		? subServices.reduce(
				(acc, subService) => acc + subService.price * subService.amount,
				0
		  )
		: 0;
	const materialsTotal = materials
		? materials.reduce(
				(acc, material) => acc + material.price * material.amount,
				0
		  )
		: 0;
	const materialsProfitMargin = materials
		? materials.reduce(
				(acc, material) =>
					acc +
					(material?.profitMargin
						? material.price *
						  (material.profitMargin / 100) *
						  material.amount
						: 0),
				0
		  )
		: 0;

	const materialsWithProfitMargin =
		materials &&
		materials.filter(
			(material) => material.profitMargin && material.profitMargin > 0
		);

	const subTotal = subServicesTotal + materialsTotal + materialsProfitMargin;
	const profit = subServicesTotal + materialsProfitMargin;

	return (
		<>
			<SubSectionWrapper
				header={{
					title: "Serviços",
				}}
			>
				<View className="w-full">
					{subServices && subServices?.length === 0 && (
						<Text className="text-sm text-center text-black dark:text-white mb-6">
							Nenhum serviço adicionado.
						</Text>
					)}
					{subServices &&
						subServices.map((subService, index) => (
							<View className="mb-4" key={index.toString()}>
								<PreviewStatic
									subService={subService}
									hasBorder
								/>
							</View>
						))}
				</View>
			</SubSectionWrapper>

			<SubSectionWrapper
				header={{
					title: "Materiais",
				}}
			>
				<View className="w-full">
					{materials && materials?.length === 0 && (
						<Text className="text-sm text-center text-black dark:text-white mb-6">
							Nenhum material adicionado.
						</Text>
					)}
					{materials &&
						materials.map((material, index) => (
							<View className="mb-4" key={index.toString()}>
								<PreviewStatic material={material} hasBorder />
							</View>
						))}
				</View>
			</SubSectionWrapper>

			<SubSectionWrapper
				header={{
					title: "Total",
				}}
			>
				<View className="w-full p-[12.5px] bg-gray-300 border border-gray-500 rounded-lg">
					{subServices && subServices.length > 0 && (
						<View className="flex flex-col mb-2">
							<Text className="font-normal text-sm text-gray-100 mb-2">
								Serviços
							</Text>
							<View className="flex flex-col w-full gap-y-1">
								{subServices.map((subService, index) => (
									<View key={index.toString()}>
										<Value
											value={subService.price}
											multiplier={subService.amount}
											type="earning"
										/>
									</View>
								))}
							</View>
						</View>
					)}

					{materialsWithProfitMargin &&
						materialsWithProfitMargin?.length > 0 && (
							<View className="flex flex-col mb-2">
								<Text className="font-normal text-sm text-gray-100 mb-2">
									Materials
								</Text>
								<View className="flex flex-col w-full gap-y-1">
									{materialsWithProfitMargin?.map(
										(material, index) => (
											<View key={index.toString()}>
												<Value
													value={material.price}
													multiplier={material.amount}
													profitMargin={
														material.profitMargin ??
														undefined
													}
													type="earning"
												/>
											</View>
										)
									)}
								</View>
							</View>
						)}

					{materials && materials.length > 0 && (
						<View className="flex flex-col mb-2">
							<Text className="font-normal text-sm text-gray-100 mb-2">
								Gastos do Cliente
							</Text>
							<View className="flex flex-col w-full gap-y-1">
								{materials.map((subService, index) => (
									<View key={index.toString()}>
										<Value
											value={subService.price}
											multiplier={subService.amount}
										/>
									</View>
								))}
							</View>
						</View>
					)}

					{service.discount && service.discount > 0 && (
						<View className="flex flex-col mb-2">
							<Text className="font-normal text-sm text-gray-100 mb-2">
								Desconto
							</Text>
							<View className="flex flex-col w-full gap-y-1">
								<View className="w-full items-center flex flex-row justify-between">
									<Text className="text-sm text-white">
										{service.discount}% de desconto
									</Text>
									<Text className={"text-sm text-red"}>
										-R$
										{(subServicesTotal + materialsTotal) *
											(service.discount / 100)}
									</Text>
								</View>
							</View>
						</View>
					)}

					<View className="w-full flex items-end justify-center my-2">
						<View className="w-1/4 h-[0px] border-dashed border-t border-gray-100" />
					</View>

					<View className="flex flex-row items-center justify-between mb-2">
						<Text className="font-normal text-sm text-gray-100">
							Subtotal
						</Text>
						<Text className="font-normal text-sm text-text-100">
							R${subTotal}
						</Text>
					</View>

					<View className="flex flex-row items-center justify-between">
						<Text className="font-normal text-sm text-gray-100">
							Lucro
						</Text>
						<Text className="text-sm text-primary-green">
							+R${profit}
						</Text>
					</View>
				</View>
			</SubSectionWrapper>

			<ActionButton
				preset="next"
				style={{ backgroundColor: colors.primary }}
				label={"Gerar documento"}
				isLoading={isLoading}
				onPress={onSubmit}
			/>
		</>
	);
}

interface ValueProps {
	value: number;
	multiplier?: number;
	profitMargin?: number;
	type?: "earning" | "neutral" | "expense";
	currency?: string;
}

const Value = ({
	value,
	multiplier,
	profitMargin,
	type = "neutral",
	currency = "R$",
}: ValueProps) => (
	<View className="w-full items-center flex flex-row justify-between">
		<Text className="text-sm text-white">
			{currency} {value}{" "}
			{multiplier && multiplier > 1 && `(x${multiplier})`}{" "}
			{profitMargin && profitMargin > 1 && `(${profitMargin}%)`}
		</Text>
		<Text
			className={clsx("text-sm", {
				"text-primary-green": type === "earning",
				"text-text-100": type === "neutral",
				"text-red": type === "expense",
			})}
		>
			{type === "earning" ? "+ " : type === "expense" ? "- " : ""}
			{currency}
			{
				(profitMargin ? value * (profitMargin / 100) : value) *
					(multiplier ? multiplier : 1) /* .toFixed(2) */
			}
		</Text>
	</View>
);
