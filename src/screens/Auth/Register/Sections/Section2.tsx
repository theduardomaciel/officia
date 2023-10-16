import { useCallback, useMemo, useRef, useState } from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

import colors from "global/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Components
import { ActionButton } from "components/Button";
import {
	BasicPlan,
	PremiumPlan,
	SubscriptionAppeal,
} from "screens/Drawer/Subscription";
import { getAccountPlan } from "utils/planHandler";

interface Props {
	navigation: any;
}

export default function RegisterSection2({ navigation }: Props) {
	const isPremium = getAccountPlan() === "premium";

	return (
		<>
			<View
				className="flex-col items-center justify-center"
				style={{ rowGap: 10 }}
			>
				<MaterialCommunityIcons
					name="check-circle-outline"
					size={36}
					color={colors.white}
				/>
				<Text className="text-white text-2xl font-logoRegular text-center max-w-[80%] leading-[95%]">
					Pronto para criar seu primeiro negócio?
				</Text>
			</View>
			<Text className="text-white text-[15px] text-left">
				Finalmente chegou a hora!{`\n\n`}
				Ao adicionar seu primeiro negócio você será capaz de
				administrá-lo de maneira direta.{`\n\n`}
				Veja a seguir algumas das coisas que você será capaz de fazer no{" "}
				<Text className="font-logoRegular">officia</Text>:
			</Text>
			{isPremium ? (
				<PremiumPlan
					isActual
					style={{
						backgroundColor: colors.gray[300],
						borderWidth: 0,
						borderColor: "transparent",
					}}
				/>
			) : (
				<BasicPlan
					isActual
					style={{
						backgroundColor: colors.gray[300],
						borderWidth: 0,
						borderColor: "transparent",
					}}
				/>
			)}
			{!isPremium && <SubscriptionAppeal />}
			<ActionButton
				onPress={() => navigation.navigate("businessRegister")}
				preset="next"
				style={{
					backgroundColor: colors.primary,
				}}
				label="Adicionar meu primeiro negócio"
				textProps={{
					className:
						"font-logoRegular text-center text-white text-md",
				}}
			/>
		</>
	);
}
