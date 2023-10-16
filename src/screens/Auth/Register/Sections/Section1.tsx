import React, {
	useCallback,
	useMemo,
	useRef,
	useState,
	forwardRef,
} from "react";
import {
	ActivityIndicator,
	Linking,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import clsx from "clsx";
import colors from "global/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import MailLockIcon from "assets/icons/mail_lock.svg";

// Components
import { ActionButton } from "components/Button";
import Input, { borderErrorStyle } from "components/Input";
import Toast from "components/Toast";
import Modal from "components/Modal";

// Form
import { Controller, SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Utils
import { useAuth } from "context/AuthContext";
import { censorEmail } from "utils";

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

const formatSecondsToTimer = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const secondsLeft = seconds % 60;
	return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
};

interface Props {
	onSubmit: (data: LoginDataSchemeType) => Promise<void>;
	email?: string;
}

interface EmailVerificationData {
	email: string;
	verificationCode: string;
}

const EMAIL_RESEND_DELAY = 90;
const CODE_CHARACTERS_AMOUNT = 4;

export default function RegisterSection1({ onSubmit, email }: Props) {
	const { verifyEmail } = useAuth();

	const {
		handleSubmit: section1HandleSubmit,
		control: section1Control,
		formState: { errors: section1Errors },
		getValues,
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
			description: Object.values(errors)
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

	const [isSendingEmail, setIsSendingEmail] = useState(false);
	const [verificationData, setVerificationData] = useState<
		EmailVerificationData | undefined
	>(undefined);

	const emailsSent = useRef(0);
	const [resendEmailCooldown, setResendEmailCooldown] =
		useState(EMAIL_RESEND_DELAY);

	const startInterval = () => {
		const timer = setInterval(() => {
			setResendEmailCooldown((prevCount) => {
				if (prevCount === 0) {
					clearInterval(timer);
					return prevCount;
				}

				return prevCount - 1;
			});
		}, 1000);
		return timer;
	};

	const lastInterval = useRef<any>(); /* NodeJS.Timeout */

	const sendEmail = useCallback(
		async (email: string, isResending?: boolean) => {
			if (isResending) {
				lastInterval.current && clearInterval(lastInterval.current);
				setVerificationData(undefined);
			} else {
				setIsSendingEmail(true);
			}
			emailsSent.current += 1;

			try {
				const verificationCode = await verifyEmail(email);

				setVerificationData({
					email,
					verificationCode,
				});

				// Aumentamos o delay de reenvio de e-mails a cada tentativa
				if (emailsSent.current > 1) {
					setResendEmailCooldown(
						Math.round(
							EMAIL_RESEND_DELAY *
								Math.pow(1.5, emailsSent.current)
						)
					);
				}

				const interval = startInterval();
				lastInterval.current = interval;

				if (isResending) {
					Toast.show({
						preset: "success",
						title: "E-mail reenviado com sucesso!",
						description: `O código de verificação foi enviado novamente para ${censorEmail(
							email
						)}.\nLembre-se de conferir o spam!`,
					});
				}
			} catch (error) {
				Toast.show({
					preset: "error",
					title: "Algo deu errado ao concluir o cadastro de sua conta",
					description:
						"Um problema com o serviço de e-mails nos impediu de criar sua conta. Tente novamente mais tarde.",
				});
			} finally {
				if (!isResending) {
					setIsSendingEmail(false);
				}
			}
		},
		[]
	);

	const submitSection1Data = section1HandleSubmit(async (data) => {
		let errorsMessage = "";
		if (fulfilledRequirementsAmount < 3) {
			errorsMessage += `A senha deve conter ao menos 3 dos seguintes itens: letras maiúsculas, letras minúsculas, números e caracteres especiais.`;
		}

		if (errorsMessage) {
			Toast.show({
				preset: "error",
				title: "Algo está errado com os dados inseridos.",
				description: errorsMessage,
			});
			return;
		}

		await sendEmail(data.email);
		//onSubmit(data);
	}, onError);

	const codeInputsRefs = useRef<React.MutableRefObject<TextInput | null>[]>(
		[]
	);
	const fullCode = useRef<string[]>([]);

	const checkCodeInput = useCallback(async () => {
		if (fullCode.current.join("") == verificationData?.verificationCode) {
			setVerificationData(undefined);
			await onSubmit(getValues());
		}
	}, [verificationData?.verificationCode]);

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
										? "eye-outline"
										: "eye-off-outline"
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
				isLoading={
					isSendingEmail && !verificationData?.verificationCode
				}
				disabled={
					isSendingEmail || verificationData?.verificationCode
						? true
						: false
				}
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
			<Modal
				isVisible={!!verificationData?.verificationCode}
				toggleVisibility={() => setVerificationData(undefined)}
				title={"Verifique seu e-mail"}
				description={
					<Text className="text-white text-sm text-left">
						Insira o código enviado para o e-mail{` `}
						<Text className="font-bold">
							{verificationData?.email
								? censorEmail(verificationData?.email)
								: ""}
						</Text>{" "}
						no campo abaixo para prosseguir
					</Text>
				}
				icon={<MailLockIcon />}
			>
				<View className="w-full flex-row items-center justify-between my-4">
					{Array.from({ length: CODE_CHARACTERS_AMOUNT }).map(
						(_, index) => {
							codeInputsRefs.current[index] = React.createRef();
							return (
								<CodeCharacterInput
									key={index}
									ref={codeInputsRefs.current[index]}
									onChange={async (value) => {
										if (
											index <
											CODE_CHARACTERS_AMOUNT - 1
										) {
											codeInputsRefs.current[
												index + 1
											].current?.focus();
										}

										fullCode.current[index] = value;
										await checkCodeInput();
									}}
									onBack={() => {
										if (index > 0) {
											codeInputsRefs.current[
												index - 1
											].current?.clear();
											codeInputsRefs.current[
												index - 1
											].current?.focus();
										}
									}}
								/>
							);
						}
					)}
				</View>
				<TouchableOpacity
					className={clsx(
						"w-full py-2.5 bg-primary rounded-md flex-row items-center justify-center",
						{
							"bg-gray-100": resendEmailCooldown > 0,
						}
					)}
					activeOpacity={
						resendEmailCooldown > 0 || isSendingEmail ? 1 : 0.7
					}
					disabled={isSendingEmail || resendEmailCooldown > 0}
					onPress={() => {
						sendEmail(verificationData?.email ?? "", true);
					}}
				>
					{isSendingEmail ? (
						<ActivityIndicator
							size={"small"}
							color={colors.text[100]}
						/>
					) : (
						<Text
							className={clsx("text-sm font-bold text-white", {
								"text-text-100": resendEmailCooldown > 0,
							})}
						>
							Reenviar código
							{resendEmailCooldown > 0
								? ` (${formatSecondsToTimer(
										resendEmailCooldown
								  )})`
								: ""}
						</Text>
					)}
				</TouchableOpacity>
			</Modal>
		</>
	);
}

interface CodeCharacterInputProps {
	onChange: (value: string) => void;
	onBack: () => void;
}

const CodeCharacterInput = forwardRef<
	React.ElementRef<typeof TextInput>,
	CodeCharacterInputProps
>(({ onChange, onBack }: CodeCharacterInputProps, ref) => {
	return (
		<TextInput
			ref={ref}
			className="text-center text-6xl font-bold text-text-100 bg-transparent border border-text-100 rounded-md py-4 min-h-[100px]"
			style={{
				width: `${100 / CODE_CHARACTERS_AMOUNT - 1}%`,
			}}
			onChangeText={onChange}
			cursorColor={colors.text[100]}
			maxLength={1}
			autoCapitalize="characters"
			placeholder="_"
			placeholderTextColor={colors.text[100]}
			onKeyPress={({ nativeEvent }) => {
				if (nativeEvent.key === "Backspace") {
					onBack();
				}
			}}
		/>
	);
});
