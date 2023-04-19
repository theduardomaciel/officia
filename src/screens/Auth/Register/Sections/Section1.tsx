import { useCallback, useMemo, useRef, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Components
import Input, { borderErrorStyle } from "components/Input";
import Toast from "components/Toast";
import { ActionButton } from "components/Button";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const loginDataScheme = z
	.object({
		email: z
			.string({
				required_error: "O e-mail inserido não é inválido",
			})
			.email({ message: "O e-mail inserido não é válido" }),
		password: z
			.string({
				required_error: "É necessário inserir uma senha válida",
			})
			.min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
		confirmPassword: z.string({
			required_error: "As senhas não conferem.",
		}),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: "custom",
				message: "As senhas não conferem.",
			});
		}
	});

export type LoginDataSchemeType = z.infer<typeof loginDataScheme>;

interface Props {
	onSubmit: (data: LoginDataSchemeType) => void;
	email?: string;
}

export default function RegisterSection1({ onSubmit, email }: Props) {
	const {
		handleSubmit: section1HandleSubmit,
		control: section1Control,
		formState: { errors: section1Errors },
	} = useForm<LoginDataSchemeType>({
		mode: "onSubmit",
		defaultValues: {
			email: email ?? undefined,
		},
		resetOptions: {
			keepDirtyValues: true, // user-interacted input will be retained
			keepErrors: true, // input errors will be retained with value update
		},
		resolver: zodResolver(loginDataScheme),
	});

	const onError: SubmitErrorHandler<LoginDataSchemeType> = (errors, e) => {
		Toast.show({
			preset: "error",
			title: "Algo está errado com os dados inseridos.",
			message: Object.values(errors)
				.map((error) => error.message)
				.join("\n"),
		});
	};

	const [isPasswordHidden, setIsPasswordHidden] = useState(true);
	const [fulfilledRequirements, setFulfilledRequirements] = useState({
		hasUppercase: false,
		hasLowercase: false,
		hasNumber: false,
		hasSpecialCharacter: false,
	});

	const fulfilledRequirementsAmount = useMemo(() => {
		const amount = fulfilledRequirements
			? Object.values(fulfilledRequirements).filter(Boolean).length
			: 0;
		return amount;
	}, [fulfilledRequirements]);

	const submitSection1Data = section1HandleSubmit((data) => {
		let errorsMessage = "";
		if (fulfilledRequirementsAmount < 3) {
			errorsMessage += `A senha deve conter ao menos 3 dos seguintes itens: letras maiúsculas, letras minúsculas, números e caracteres especiais.`;
		}

		if (errorsMessage) {
			Toast.show({
				preset: "error",
				title: "Algo está errado com os dados inseridos.",
				message: errorsMessage,
			});
			return;
		}

		onSubmit(data);
	}, onError);

	return (
		<>
			<Controller
				control={section1Control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						label="E-mail"
						onBlur={onBlur}
						onChangeText={(value) => onChange(value)}
						value={value}
						keyboardType="email-address"
						maxLength={50}
						autoCapitalize="none"
						pallette="dark"
						labelChildren={
							section1Errors.email && (
								<Text className="text-xs text-red text-right">
									{section1Errors.email?.message}
								</Text>
							)
						}
					/>
				)}
				name="email"
			/>
			<Controller
				control={section1Control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						label="Senha"
						onBlur={onBlur}
						onChangeText={(value) => {
							onChange(value);
							setFulfilledRequirements({
								hasUppercase: /[A-Z]/.test(value),
								hasLowercase: /[a-z]/.test(value),
								hasNumber: /[0-9]/.test(value),
								hasSpecialCharacter: /[^a-zA-Z0-9]/.test(value),
							});
						}}
						style={section1Errors.password && borderErrorStyle}
						autoCapitalize="none"
						secureTextEntry={isPasswordHidden}
						value={value}
						maxLength={50}
						pallette="dark"
						labelChildren={
							section1Errors.password && (
								<Text className="text-xs text-red text-right">
									{section1Errors.password?.message}
								</Text>
							)
						}
					>
						<TouchableOpacity
							className="p-2 absolute right-2 top-[12.5%]"
							activeOpacity={0.7}
							onPress={() =>
								setIsPasswordHidden(!isPasswordHidden)
							}
						>
							<MaterialCommunityIcons
								name={
									isPasswordHidden
										? "eye-off-outline"
										: "eye-outline"
								}
								color={colors.gray[100]}
								size={20}
							/>
						</TouchableOpacity>
					</Input>
				)}
				name="password"
			/>
			<Text className="text-sm text-left text-text-200">
				Senhas devem ter pelo menos 8 caracteres e conter ao menos 3 dos
				seguintes itens:
				<Text
					style={{
						color: fulfilledRequirements.hasLowercase
							? colors.primary
							: colors.text[200],
					}}
				>
					{`\n`}• Letras minúsculas
				</Text>
				<Text
					style={{
						color: fulfilledRequirements.hasUppercase
							? colors.primary
							: colors.text[200],
					}}
				>
					{`\n`}• Letras maiúsculas
				</Text>
				<Text
					style={{
						color: fulfilledRequirements.hasNumber
							? colors.primary
							: colors.text[200],
					}}
				>
					{`\n`}• Números
				</Text>
				<Text
					style={{
						color: fulfilledRequirements.hasSpecialCharacter
							? colors.primary
							: colors.text[200],
					}}
				>
					{`\n`}• Caracteres não alfanuméricos{" "}
					{`(ex: _, /, ., -, {, [)`}
				</Text>
			</Text>
			<View
				className="flex-row items-center justify-between w-full"
				style={{ columnGap: 75 }}
			>
				<Text className="text-sm text-left text-text-200">
					Força da senha:
				</Text>
				<View className="flex-1 items-start justify-center bg-gray-400 rounded-full h-3">
					<View
						className="rounded-full h-full"
						style={{
							width: `${fulfilledRequirementsAmount * 25}%`,
							backgroundColor:
								fulfilledRequirementsAmount === 1
									? colors.red
									: fulfilledRequirementsAmount === 2
									? colors.yellow
									: fulfilledRequirementsAmount === 3
									? colors.yellow
									: fulfilledRequirementsAmount === 4
									? colors.primary
									: colors.gray[400],
						}}
					/>
				</View>
			</View>
			<Controller
				control={section1Control}
				render={({ field: { onChange, onBlur, value } }) => (
					<Input
						label="Confirmar senha"
						onBlur={onBlur}
						onChangeText={(value) => onChange(value)}
						value={value}
						secureTextEntry={isPasswordHidden}
						autoCapitalize="none"
						maxLength={50}
						pallette="dark"
						labelChildren={
							section1Errors.confirmPassword && (
								<Text className="text-xs text-red text-right">
									{section1Errors.confirmPassword?.message}
								</Text>
							)
						}
					/>
				)}
				name="confirmPassword"
			/>
			<ActionButton
				onPress={submitSection1Data}
				preset="next"
				label="Concordar e continuar"
				textProps={{
					className: "font-logoRegular text-white text-md",
				}}
			/>
			<View
				style={{
					borderBottomWidth: 1,
					width: "50%",
					height: 1,
					alignSelf: "center",
					backgroundColor: "transparent",
					borderStyle: "dashed",
					borderColor: colors.gray[100],
				}}
			/>
			<Text className="w-full text-center text-xs text-gray-100">
				Ao continuar, você concorda com os nossos{" "}
				<Text
					className="font-bold underline"
					onPress={() => {
						Linking.openURL("https://officia.vercel.app/terms");
					}}
				>
					Termos
				</Text>{" "}
				e nossa{" "}
				<Text
					className="font-bold underline"
					onPress={() => {
						Linking.openURL("https://officia.vercel.app/privacy");
					}}
				>
					Política de Privacidade
				</Text>
				.
			</Text>
		</>
	);
}
