import React from "react";
import { View, Text, Image, ViewStyle } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "global/colors";

//import Pattern from "src/assets/pattern.svg";
//import Pattern from "assets/Pattern";
import Logo from "src/assets/logo_gradient.svg";

// Components
import Container, { BusinessScrollView } from "components/Container";
import Header from "components/Header";
import { cn } from "utils";

const SPRING_CONFIG = {
	damping: 20,
	mass: 0.5,
	stiffness: 100,
	overshootClamping: false,
	restDisplacementThreshold: 0.01,
	restSpeedThreshold: 0.01,
};

export default function SubscriptionScreen() {
	const [selectedModel, setSelectedModel] = React.useState<
		"monthly" | "yearly"
	>("monthly");

	const selectedModelPosition = useSharedValue(0);
	const selectedModelStyle = useAnimatedStyle(() => {
		return {
			left: selectedModelPosition.value + "%",
			zIndex: 5,
		};
	});

	return (
		<LinearGradient
			// Button Linear Gradient
			colors={[colors.gray[300], colors.gray[600]]}
			style={{ flex: 1 }}
		>
			<Container style={{ rowGap: 0 }}>
				<Header title="" returnButton />
				<BusinessScrollView style={{ paddingBottom: 180 }}>
					<Text className="font-logoRegular text-white text-5xl w-full text-center pt-2 mt-12 mb-4">
						officia+
					</Text>

					<View className="flex-row items-center justify-between p-3 rounded border border-gray-200 bg-gray-500 w-full">
						<Text className="font-logoRegular text-white text-md text-left">
							Recursos exclusivos. {`\n`} Produtividade. {`\n`}
							Acompanhamento direto.
						</Text>
						<View className="flex items-center justify-center px-6">
							<Logo />
						</View>
					</View>

					<View className="flex-row items-center justify-between w-full rounded-2xl border border-gray-200 bg-gray-500 relative">
						<View
							className="w-1/2 py-3 z-20 items-center justify-center"
							pointerEvents="none"
						>
							<Text className="font-medium text-sm text-white">
								Mensalmente
							</Text>
						</View>
						<View
							className="flex-row w-1/2 py-3 items-center justify-center z-20"
							style={{ columnGap: 10 }}
							pointerEvents="none"
						>
							<Text className="font-medium text-sm text-white">
								Anualmente
							</Text>
							<View
								className="flex-row items-center justify-center bg-primary opacity-75 px-1 rounded-sm"
								style={{ columnGap: 2.5 }}
							>
								<Text className="font-bold text-white text-[10px] py-[2px]">
									-28%
								</Text>
								<MaterialCommunityIcons
									name="tag"
									size={10}
									color={colors.white}
								/>
							</View>
						</View>
						<Animated.View
							className="h-full w-1/2 absolute left-1/2 bg-gray-400 rounded-[15px]"
							style={[selectedModelStyle, { zIndex: 5 }]}
						/>
						{selectedModel === "yearly" && (
							<RectButton
								style={{
									width: "55%",
									height: "100%",
									position: "absolute",
									left: 0,
									borderRadius: 15,
									zIndex: 4,
								}}
								onPress={() => {
									setSelectedModel("monthly");
									selectedModelPosition.value = withSpring(
										0,
										SPRING_CONFIG
									);
								}}
							/>
						)}
						{selectedModel === "monthly" && (
							<RectButton
								style={{
									width: "55%",
									height: "100%",
									position: "absolute",
									right: 0,
									borderRadius: 15,
									zIndex: 4,
								}}
								onPress={() => {
									setSelectedModel("yearly");
									selectedModelPosition.value = withSpring(
										50,
										SPRING_CONFIG
									);
								}}
							/>
						)}
					</View>
					<BasicPlan />
					<Plan
						title="Plano Plus"
						description={`• Todas as funcionalidades do Plano Básico
• Remoção total de anúncios
• Backup na nuvem em tempo real
• Sincronização entre 2 dispositivos simultâneos
• Upload de imagens em documentos
• Pesquisa de serviços, clientes, materiais e qualquer outro tipo de elemento
• Acompanhamento financeiro com gráficos e dados organizados por períodos
• Marca d’água em documentos com sua marca própria
• Criação de categorias para organizar diferentes tipos de serviços
• Catálogo de serviços e produtos ofertados, que são armazenados e podem ser adicionados novamente a qualquer momento
• Suporte técnico a qualquer momento`}
					/>
				</BusinessScrollView>
				<View
					className="w-screen rounded-tl-3xl rounded-tr-3xl bg-gray-600 p-6 absolute left-0 bottom-0"
					style={{ rowGap: 15 }}
				>
					<RectButton
						style={{
							padding: 15,
							backgroundColor: colors.primary,
							borderRadius: 25,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{selectedModel === "monthly" ? (
							<Text className="font-bold text-sm text-white">
								assinar por{" "}
								<Text className="font-regular text-xs line-through"></Text>{" "}
								R$ 24,99/mês
							</Text>
						) : (
							<Text className="font-bold text-sm text-white">
								assinar por{" "}
								<Text className="font-regular text-xs line-through">
									R$ 537,99/ano
								</Text>{" "}
								R$ 419,99/ano
							</Text>
						)}
					</RectButton>
					<Text className="text-[10px] text-white">
						Ao assinar, você concorda com os{" "}
						<Text className="text-primary underline">
							Termos de Serviço do Comprador
						</Text>
						. As assinaturas são renovadas automaticamente até serem
						canceladas, conforme descrito nos Termos. Caso a
						assinatura expire, todas as funcionalidades exclusivas
						de assinantes serão imediatamente revogadas e a conta do
						usuário retornará ao Plano Gratuito.
					</Text>
				</View>
				{/* <Pattern
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						zIndex: -1,
					}}
					pointerEvents="none"
				/> */}
				<Image
					source={require("../../assets/images/pattern.png")}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						zIndex: -1,
						opacity: 0.085,
					}}
				/>
			</Container>
		</LinearGradient>
	);
}

interface Plan {
	title: string;
	description: string;
	isActual?: boolean;
	style?: ViewStyle;
}

const Plan = ({ title, description, isActual, style }: Plan) => {
	return (
		<View
			className={
				"flex-col items-start justify-start p-4 rounded border border-gray-200 bg-gray-500 w-full"
			}
			style={[{ rowGap: 10 }, style]}
		>
			<View
				className="flex-row items-center justify-start"
				style={{ columnGap: 10 }}
			>
				<Text className="font-logoRegular text-white text-md text-left">
					{title}
				</Text>
				{isActual && (
					<View
						className="flex-row items-center justify-center bg-primary opacity-75 px-1 rounded-sm"
						style={{ columnGap: 2.5 }}
					>
						<Text className="font-bold text-white text-[10px] py-[2px]">
							Atual
						</Text>
					</View>
				)}
			</View>
			<Text className="text-text-200 text-sm ml-2 whitespace-pre-line">
				{description}
			</Text>
		</View>
	);
};

export const BasicPlan = ({ style }: { style?: ViewStyle }) => (
	<Plan
		title="Plano Básico"
		isActual
		style={style}
		description={`• Anúncios \n• Agendamento de serviços, com inserção de materiais e seleção de cliente \n• Geração de documentos com base nos serviços agendados \n• Marca d’água em documentos`}
	/>
);
