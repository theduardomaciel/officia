import React from "react";

// Components
import { BusinessScrollView } from "components/Container";
import Toast from "components/Toast";
import Input, { borderErrorStyle } from "components/Input";

import BusinessLayout, { ChangesObserver } from "../Layout";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updateData } from "screens/Main/Business";

// Types
import {
	BusinessData,
	socialMediaScheme,
	SocialMediaSchemeType,
} from "screens/Main/Business/@types";

export default function SocialMedia({ route, navigation }: any) {
	const { businessData: data }: { businessData: BusinessData } = route.params;
	const [businessData, setBusinessData] = React.useState<BusinessData>(data); // é necessário em todas as telas pois o parâmetro de comparação tem que mudar após a atualização dos dados
	const screenData = {
		site: businessData.site,
		facebook: businessData.facebook,
		instagram: businessData.instagram,
		twitter: businessData.twitter,
		youtube: businessData.youtube,
		tiktok: businessData.tiktok,
		whatsAppBusiness: businessData.whatsAppBusiness,
	} as SocialMediaSchemeType;

	const [hasDifferences, setHasDifferences] = React.useState(false);

	const {
		handleSubmit,
		control,
		formState: { errors },
		getValues,
		watch,
		setFocus,
	} = useForm<SocialMediaSchemeType>({
		mode: "onSubmit",
		defaultValues: {
			site: "",
			facebook: "",
			instagram: "",
			twitter: "",
			youtube: "",
			tiktok: "",
			whatsAppBusiness: "",
		},
		values: businessData ? screenData : undefined,
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(socialMediaScheme),
	});

	const onError: SubmitErrorHandler<SocialMediaSchemeType> = (errors, e) => {
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
			setHasDifferences(false);
			console.log(hasDifferences);
			setBusinessData(result);
		}
	}, onError);

	return (
		<BusinessLayout
			headerProps={{
				title: "Redes Sociais",
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
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="Site"
								value={value}
								onBlur={onBlur}
								keyboardType="url"
								autoCapitalize="none"
								onChangeText={onChange}
								style={!!errors.site && borderErrorStyle}
							/>
						)}
						name="site"
						rules={{ maxLength: 50 }}
					/>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="Instagram"
								icon={{
									name: "instagram",
									family: "FontAwesome5",
								}}
								value={value}
								onBlur={onBlur}
								autoCapitalize="none"
								onChangeText={onChange}
								style={!!errors.instagram && borderErrorStyle}
							/>
						)}
						name="instagram"
						rules={{ maxLength: 50 }}
					/>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="WhatsApp Business"
								icon={{
									name: "whatsapp",
									family: "FontAwesome5",
								}}
								value={value}
								onBlur={onBlur}
								autoCapitalize="none"
								onChangeText={onChange}
								style={
									!!errors.whatsAppBusiness &&
									borderErrorStyle
								}
							/>
						)}
						name="whatsAppBusiness"
						rules={{ maxLength: 50 }}
					/>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="Twitter"
								icon={{
									name: "twitter",
									family: "FontAwesome5",
								}}
								value={value}
								onBlur={onBlur}
								autoCapitalize="none"
								onChangeText={onChange}
								style={!!errors.twitter && borderErrorStyle}
							/>
						)}
						name="twitter"
						rules={{ maxLength: 50 }}
					/>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="Facebook"
								icon={{
									name: "facebook",
									family: "FontAwesome5",
								}}
								value={value}
								onBlur={onBlur}
								autoCapitalize="none"
								onChangeText={onChange}
								style={!!errors.facebook && borderErrorStyle}
							/>
						)}
						name="facebook"
						rules={{ maxLength: 50 }}
					/>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="YouTube"
								icon={{
									name: "youtube",
									family: "FontAwesome5",
								}}
								value={value}
								onBlur={onBlur}
								autoCapitalize="none"
								onChangeText={onChange}
								style={!!errors.youtube && borderErrorStyle}
							/>
						)}
						name="youtube"
						rules={{ maxLength: 50 }}
					/>
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<Input
								label="TikTok"
								icon={{
									name: "tiktok",
									family: "FontAwesome5",
								}}
								value={value}
								onBlur={onBlur}
								autoCapitalize="none"
								onChangeText={onChange}
								style={!!errors.tiktok && borderErrorStyle}
							/>
						)}
						name="tiktok"
						rules={{ maxLength: 50 }}
					/>
				</BusinessScrollView>
			</ChangesObserver>
		</BusinessLayout>
	);
}
