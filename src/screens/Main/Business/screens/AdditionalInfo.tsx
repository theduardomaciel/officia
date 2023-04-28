import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import { BusinessScrollView } from "components/Container";
import Toast from "components/Toast";
import Input, { borderErrorStyle } from "components/Input";
import { SubSectionWrapper } from "components/Form/SectionWrapper";

import BusinessLayout, { ChangesObserver } from "../Layout";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateData } from "screens/Main/Business";

// Types
import {
	BusinessData,
	additionalInfoScheme,
	AdditionalInfoSchemeType,
} from "../@types";

export default function AdditionalInfoScreen({ route, navigation }: any) {
	const {
		businessData: data,
	}: { businessData: BusinessData; update: boolean } = route.params;
	const [businessData, setBusinessData] = React.useState<BusinessData>(data); // é necessário em todas as telas pois o parâmetro de comparação tem que mudar após a atualização dos dados
	const screenData = {
		defaultMessage: businessData.defaultMessage ?? "",
		defaultWarrantyDetails: businessData.defaultWarrantyDetails ?? "",
	} as AdditionalInfoSchemeType;

	const [hasDifferences, setHasDifferences] = React.useState(false);

	const { colorScheme } = useColorScheme();

	const {
		handleSubmit,
		control,
		formState: { errors },
		getValues,
		watch,
	} = useForm<AdditionalInfoSchemeType>({
		mode: "onSubmit",
		defaultValues: {
			defaultMessage: "",
			defaultWarrantyDetails: "",
		},
		values: businessData ? screenData : undefined,
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(additionalInfoScheme),
	});

	const onError: SubmitErrorHandler<AdditionalInfoSchemeType> = (
		errors,
		e
	) => {
		//console.log(errors)
		//setFocus(Object.keys(errors)[0] as unknown as keyof BasicInfoSchemeType)
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			message: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const submitData = handleSubmit(async (data) => {
		const result = await updateData(getValues(), businessData);
		if (result) {
			setBusinessData(result);
			setHasDifferences(false);
		}
	}, onError);

	return (
		<BusinessLayout
			headerProps={{
				title: "Informações Básicas",
			}}
			hasDifferences={hasDifferences}
			submitData={submitData}
		>
			<ChangesObserver
				setHasDifferences={setHasDifferences}
				currentData={screenData}
				watch={watch}
			>
				<BusinessScrollView>
					<SubSectionWrapper
						header={{
							title: "Mensagens Padrão",
							description:
								"Estas mensagens serão inseridas caso seus respectivos campos durante a criação do serviço não tenham sido especificados.",
						}}
					>
						<Controller
							control={control}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<Input
									label="Informações Adicionais"
									placeholder="[não especificado]"
									value={value}
									onBlur={onBlur}
									onChangeText={(value) => onChange(value)}
									multiline
									style={
										!!errors.defaultMessage &&
										borderErrorStyle
									}
								/>
							)}
							name="defaultMessage"
							rules={{ maxLength: 50 }}
						/>
						<Controller
							control={control}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<Input
									label="Condições da Garantia"
									placeholder="[não especificado]"
									value={value}
									onBlur={onBlur}
									onChangeText={(value) => onChange(value)}
									multiline
									style={
										!!errors.defaultWarrantyDetails &&
										borderErrorStyle
									}
								/>
							)}
							name="defaultWarrantyDetails"
							rules={{ maxLength: 50 }}
						/>
					</SubSectionWrapper>
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
					<SubSectionWrapper
						header={{ title: "Assinatura Digital", icon: "brush" }}
					>
						<TouchableOpacity
							activeOpacity={0.8}
							className="w-full flex-col items-center justify-center px-12 gap-y-1 border rounded-lg border-dashed border-primary-green"
							style={{
								paddingTop:
									businessData &&
									businessData.digitalSignatureUri
										? 0
										: 50,
								paddingBottom:
									businessData &&
									businessData.digitalSignatureUri
										? 0
										: 50,
								paddingLeft:
									businessData &&
									businessData.digitalSignatureUri
										? 5
										: 50,
								paddingRight:
									businessData &&
									businessData.digitalSignatureUri
										? 5
										: 50,
							}}
							onPress={() =>
								navigation.navigate("digitalSignature", {
									businessData,
								})
							}
						>
							{businessData &&
							businessData.digitalSignatureUri ? (
								<Image
									source={{
										uri: businessData?.digitalSignatureUri,
									}}
									style={{ width: "100%", height: 175 }}
									contentFit="cover"
									transition={1000}
								/>
							) : (
								<>
									<MaterialIcons
										name="brush"
										size={32}
										color={
											colorScheme === "dark"
												? colors.white
												: colors.black
										}
									/>
									<Text className="font-medium text-sm text-black dark:text-white">
										Adicionar assinatura digital
									</Text>
								</>
							)}
						</TouchableOpacity>
					</SubSectionWrapper>
				</BusinessScrollView>
			</ChangesObserver>
		</BusinessLayout>
	);
}
