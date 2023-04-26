import React, { useCallback, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { MOBILE_TOKEN } from "@env";

// Visuals
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import Logo from "src/assets/logo.svg";

// Components
import Input from "components/Input";
import BottomSheet from "components/BottomSheet";
import { ActionButton } from "components/Button";
import { Loading } from "components/StatusMessage";

// Animations
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSpring,
} from "react-native-reanimated";

// Authentication
import { api } from "lib/axios";
import { Account, useAuth } from "context/AuthContext";

const QUOTES = [
	{
		title: "Simplicidade.",
		description:
			"Estamos aqui para unir tudo que o seu negócio precisa em um só lugar.",
	},
];

const validateEmail = async (email: string) => {
	const isValid = String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);

	try {
		const response = await api.get(`/accounts?email=${email}`, {
			headers: {
				Authorization: `Bearer ${MOBILE_TOKEN}`,
			},
		});

		if (response.data) {
			return {
				status: "account_already_exists",
				data: response.data,
			}; // Account already exists
		} else {
			return { status: !!isValid };
		}
	} catch (error: any) {
		console.log(error);
		if (error.response && error.response.data.statusCode === 404) {
			return { status: !!isValid };
		} else {
			const state = await NetInfo.fetch();
			if (state.isConnected === false) {
				return { status: "network_error" };
			} else {
				return { status: "error" };
			}
		}
	}
};

const SPRING_CONFIG = {
	damping: 10,
	mass: 0.1,
	stiffness: 25,
};

export default function Login({ navigation }: any) {
	const inserts = useSafeAreaInsets();
	const { height } = useWindowDimensions();
	const RANDOM_QUOTE_INDEX = Math.floor(Math.random() * QUOTES.length);

	const viewPosition = useSharedValue(0);
	const viewAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withSpring(viewPosition.value, SPRING_CONFIG),
				},
			],
		};
	});

	const refreshIconRotation = useSharedValue(0);
	const refreshIconAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${refreshIconRotation.value}deg`,
				},
			],
		};
	});

	const [isOnline, setIsOnline] = React.useState(true);
	const inputRef = React.useRef("");

	const [account, setAccount] = React.useState<Account | undefined>(
		undefined
	);
	const [status, setStatus] = React.useState<
		"loading" | "invalid" | "error" | undefined
	>(undefined);

	const handleLogin = useCallback(async () => {
		setStatus("loading");
		const isValid = await validateEmail(inputRef.current);

		switch (isValid.status) {
			case "account_already_exists":
				setAccount(isValid.data);
				setStatus(undefined);
				viewPosition.value = withSpring(-height / 8, SPRING_CONFIG);
				BottomSheet.expand("loginBottomSheet");
				break;
			case "network_error":
				setIsOnline(false);
				setStatus(undefined);
				break;
			case "error":
				setStatus("error");
				break;
			case true:
				setStatus(undefined);
				navigation.navigate("register", { email: inputRef.current });
				break;
			default:
				setStatus("invalid");
				break;
		}
	}, []);

	const refreshConnection = useCallback(() => {
		setStatus("loading");
		refreshIconRotation.value = withSpring(refreshIconRotation.value + 360);
		NetInfo.fetch().then((state) => {
			setIsOnline(state.isConnected === true);
			setStatus(undefined);
		});
	}, []);

	/* useEffect(() => {
		NetInfo.fetch().then((state) => {
			setIsOnline(state.isConnected === true);
		});
	}, []); */

	return (
		<>
			<View className="flex-1 min-h-full px-6 items-center justify-center">
				<View className="flex flex-col items-center justify-center w-full">
					<Animated.View
						className="flex-col items-center justify-center w-3/4 mb-16"
						style={viewAnimatedStyle}
					>
						<Logo className="mb-24" />
						<Text className="font-logoRegular text-4xl text-center dark:text-white mb-4">
							{QUOTES[RANDOM_QUOTE_INDEX].title}
						</Text>
						<Text className="font-semibold text-center leading-5 dark:text-white">
							{QUOTES[RANDOM_QUOTE_INDEX].description}
						</Text>
					</Animated.View>
					{isOnline ? (
						<View className="flex flex-col items-center justify-center w-full">
							<View className="w-full">
								<Input
									autoCapitalize="none"
									keyboardType="email-address"
									placeholder="Continue inserindo o seu e-mail"
									onChangeText={(text: string) =>
										(inputRef.current = text)
									}
								/>
							</View>
							<TouchableOpacity
								className="rounded w-full py-4 items-center justify-center bg-gray-200 mt-4"
								activeOpacity={0.8}
								disabled={status === "loading"}
								onPress={handleLogin}
							>
								{status === "loading" ? (
									<ActivityIndicator
										color={colors.primary}
										size="small"
									/>
								) : (
									<Text className="text-center font-semibold text-white">
										Continuar
									</Text>
								)}
							</TouchableOpacity>
							{status === "invalid" ? (
								<Text className="absolute -bottom-14 left-0 w-full text-center text-red">
									O e-mail inserido é inválido.
								</Text>
							) : status === "error" ? (
								<Text className="absolute -bottom-14 left-0 w-full text-center text-red opacity-80">
									Não foi possível entrar em contato com
									nossos servidores.{"\n"}
									Tente novamente mais tarde.
								</Text>
							) : (
								<Text className="absolute -bottom-14 left-0 w-full text-center text-text-200 opacity-80">
									Caso já possua uma conta, insira o {`\n`}
									e-mail de login.
								</Text>
							)}
						</View>
					) : (
						<TouchableOpacity
							className="flex flex-col items-center justify-center w-full"
							activeOpacity={0.7}
							onPress={refreshConnection}
							style={{
								opacity: status === "loading" ? 0.5 : 1,
							}}
						>
							<Text className=" w-full text-center text-text-200 opacity-80 mb-4">
								É necessário ter uma conexão ativa com a
								Internet para fazer login ou registrar-se.{"\n"}
								<Text className="font-semibold">
									Tente conectar-se novamente
								</Text>
							</Text>
							<Animated.View style={refreshIconAnimatedStyle}>
								<MaterialIcons
									name="replay"
									size={24}
									color={colors.text[200]}
								/>
							</Animated.View>
						</TouchableOpacity>
					)}
				</View>
				<View
					className="flex-col bg-transparent w-screen absolute bottom-0-0 left-0 items-center justify-center"
					style={{
						bottom: inserts.bottom ? inserts.bottom + 25 : 25,
						left: 0,
					}}
				>
					<View className="border-t border-dashed border-t-gray-100 w-24 mb-2 h-1" />
					<Text className="w-full text-center text-xs text-gray-100">
						officia v0.2.3.early-access
					</Text>
				</View>
			</View>
			<BottomSheet
				height={"50%"}
				id={"loginBottomSheet"}
				onDismiss={() => {
					console.log("dismissed");
					viewPosition.value = withSpring(0, SPRING_CONFIG);
				}}
				colors={{
					background: colors.gray[500],
					backdrop: "rgba(0, 0, 0, 0)",
				}}
			>
				<LoginBottomSheet account={account} />
			</BottomSheet>
		</>
	);
}

function LoginBottomSheet({ account }: { account?: Account }) {
	const { signIn } = useAuth();

	const [status, setStatus] = useState<
		"error" | "serverError" | "pending" | undefined
	>(undefined);
	const [isPasswordHidden, setIsPasswordHidden] = useState(true);
	const [password, setPassword] = useState("");

	async function checkLogin() {
		setStatus("pending");
		if (!account) return setStatus("serverError");
		try {
			console.log("logging in", account.email, account.password);
			await signIn({
				email: account.email,
				password: password,
			});
			BottomSheet.close("loginBottomSheet");
		} catch (error: any) {
			console.log(error);
			if (error.code === 401) {
				setStatus("error");
			} else {
				setStatus("serverError");
			}
		}
	}

	if (!account) {
		return <Loading />;
	}

	return (
		<View
			className="flex flex-1 items-center justify-center relative"
			style={{
				paddingLeft: 24,
				paddingRight: 24,
				paddingBottom: 12,
				rowGap: 20,
			}}
		>
			<View className="w-full flex-row items-center justify-start">
				<View className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mr-4">
					<MaterialIcons
						name="person"
						size={28}
						color={colors.text[100]}
					/>
				</View>
				<View className="flex-col items-start justify-start">
					<Text className="font-titleBold text-text-100 text-base">
						{account?.name ?? "Nome não informado"}
					</Text>
					<Text className="text-sm text-text-200">
						{account?.email}
					</Text>
				</View>
			</View>
			<Input
				label="Senha"
				onChangeText={setPassword}
				secureTextEntry={isPasswordHidden}
				autoCapitalize="none"
				labelChildren={
					status === "error" && (
						<Text className="text-right text-xs text-red opacity-80">
							A senha inserida está incorreta.
						</Text>
					)
				}
			>
				<TouchableOpacity
					className="p-2 absolute right-2 top-[12.5%]"
					activeOpacity={0.7}
					onPress={() => setIsPasswordHidden(!isPasswordHidden)}
				>
					<MaterialCommunityIcons
						name={
							isPasswordHidden ? "eye-off-outline" : "eye-outline"
						}
						color={colors.gray[100]}
						size={20}
					/>
				</TouchableOpacity>
			</Input>
			<ActionButton
				preset="next"
				label="Entrar"
				textProps={{
					style: {
						fontFamily: "AbrilFatface_400Regular",
					},
				}}
				style={{
					opacity: password?.length < 1 ? 0.5 : 1,
				}}
				isLoading={status === "pending"}
				disabled={password?.length < 1 || status === "pending"}
				onPress={checkLogin}
			/>
			{status === "serverError" && (
				<Text className="text-center text-xs text-red opacity-80">
					Um erro inesperado ocorreu. Tente novamente mais tarde.
				</Text>
			)}
			<View
				style={{
					borderBottomWidth: 1,
					width: "50%",
					height: 1,
					backgroundColor: "transparent",
					borderStyle: "dashed",
					borderColor: colors.gray[100],
				}}
			/>
			<TouchableOpacity activeOpacity={0.7}>
				<Text className="w-full text-center text-xs text-gray-100">
					Esqueceu sua senha?
				</Text>
			</TouchableOpacity>
		</View>
	);
}
