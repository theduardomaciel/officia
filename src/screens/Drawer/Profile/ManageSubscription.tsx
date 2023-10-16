import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

// Components
import Container, { ContainerScrollView } from "components/Container";
import Header from "components/Header";
import BottomSheet from "components/BottomSheet";

export default function ManageSubscription() {
	return (
		<Container>
			<Header
				title="Gerenciar Assinatura"
				navigationHistory={["Seu Perfil"]}
				returnButton
			/>
			<ContainerScrollView></ContainerScrollView>
		</Container>
	);
}
