import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";
import NavigationButton from "components/NavigationButton";
import Modal from "components/Modal";

// Auth
import { useAuth, userStorage } from "context/AuthContext";
import { useMMKVString } from "react-native-mmkv";

// Subscription
import { SubscriptionAppeal } from "../Subscription";
import { getAccountPlan } from "utils/planHandler";

export default function ProfileScreen({ navigation }: { navigation: any }) {
	const { signOut } = useAuth();

	const planExpiresAt = userStorage.getString("planExpiresAt");
	const SUBSCRIPTION_DATE = planExpiresAt
		? new Date(planExpiresAt)
		: undefined;

	const CURRENT_DATE_ONE_WEEK_AGO = new Date();
	CURRENT_DATE_ONE_WEEK_AGO.setDate(CURRENT_DATE_ONE_WEEK_AGO.getDate() - 7);

	const DAYS_TO_EXPIRE = SUBSCRIPTION_DATE
		? Math.floor(
				(SUBSCRIPTION_DATE.getTime() -
					CURRENT_DATE_ONE_WEEK_AGO.getTime()) /
					(1000 * 3600 * 24)
		  )
		: undefined;

	const [isConfirmLogoutModalOpen, setIsConfirmLogoutModalOpen] =
		React.useState(false);

	const [name] = useMMKVString("name", userStorage);
	const isPremium = getAccountPlan() === "premium";

	return (
		<Container>
			<Header title="Seu Perfil" returnButton />
			<ProfileHeader showPlan>
				<Text
					className="text-2xl text-white font-titleBold"
					ellipsizeMode="tail"
				>
					{name}
				</Text>
			</ProfileHeader>
			{DAYS_TO_EXPIRE &&
				SUBSCRIPTION_DATE &&
				SUBSCRIPTION_DATE < CURRENT_DATE_ONE_WEEK_AGO && (
					<Text
						className="text-text-100 text-xs text-center"
						onPress={
							DAYS_TO_EXPIRE < 0
								? () => navigation.navigate("subscription")
								: undefined
						}
					>
						<Text className="font-bold">
							Sua assinatura{" "}
							{DAYS_TO_EXPIRE > 0
								? `expira em ${DAYS_TO_EXPIRE} dias`
								: DAYS_TO_EXPIRE === 1
								? `expira amanhã`
								: `expirou há ${
										Math.abs(DAYS_TO_EXPIRE) > 1
											? `${Math.abs(DAYS_TO_EXPIRE)} dias`
											: "ontem"
								  }`}
							.
						</Text>{" "}
						{"\n"}
						{DAYS_TO_EXPIRE > 0 ? (
							<>
								{/* <Text className="text-primary underline font-bold">
								Habilite o pagamento recorrente
							</Text>{" "}
							para renovar seu plano automaticamente. */}
							</>
						) : (
							<Text className="text-primary underline font-bold">
								Reative sua assinatura
							</Text>
						)}
					</Text>
				)}
			<View className="w-full h-0 bg-transparent border-b border-solid rounded border-b-gray-100 self-center my-2" />
			{/* <NavigationButton
				title="Seus Negócios"
				description="Visualize, alterne e gerencie seus negócios"
				onPress={() => {}}
			/> */}
			<NavigationButton
				title="Gerenciar conta"
				onPress={() => navigation.navigate("manageAccount")}
			/>
			<NavigationButton
				title="Gerenciar assinatura"
				onPress={() => navigation.navigate("manageSubscription")}
			/>
			<NavigationButton
				title="Sair"
				onPress={() => setIsConfirmLogoutModalOpen(true)}
			/>
			<View className="flex-1 bg-transparent" />
			{!isPremium && (
				<SubscriptionAppeal
					style={{
						marginBottom: 20,
						backgroundColor: colors.gray[500],
					}}
				/>
			)}
			<Modal
				icon="logout"
				title="Você tem certeza que deseja des-logar?"
				description={
					"Após sair, será necessário inserir suas informações de login novamente."
				}
				cancelButton
				buttons={[
					{
						label: "Sair",
						color: colors.red,
						onPress: signOut,
					},
				]}
				toggleVisibility={() => setIsConfirmLogoutModalOpen(false)}
				isVisible={isConfirmLogoutModalOpen}
			/>
		</Container>
	);
}

export function ProfileHeader({
	children,
	showPlan,
}: {
	children?: React.ReactNode;
	showPlan?: boolean;
}) {
	const image_url = userStorage.getString("image_url");
	const isPremium = getAccountPlan() === "premium";

	return (
		<View className="items-center justify-center ">
			<TouchableOpacity
				className="w-24 h-24 rounded-full mb-4 bg-gray-100 items-center justify-center"
				activeOpacity={0.7}
			>
				<MaterialIcons
					name="add-a-photo"
					size={36}
					color={colors.text[100]}
				/>
				{image_url && (
					<Image
						source={{ uri: image_url }}
						className="w-24 h-24 rounded-full absolute"
					/>
				)}
			</TouchableOpacity>
			{children}
			{showPlan && (
				<View
					className="flex-row items-center justify-center bg-primary px-1 rounded-sm mt-2"
					style={{ columnGap: 2.5 }}
				>
					<Text className="font-bold text-white text-[10px] py-[2px]">
						Membro {isPremium ? "Plus" : "Básico"}
					</Text>
				</View>
			)}
		</View>
	);
}
