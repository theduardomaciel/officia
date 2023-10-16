import { ActivityIndicator, View } from "react-native";

import colors from "global/colors";

import Modal from "components/Modal";
import { useState } from "react";

interface LoadingModalProps {
	description?: string;
	loadingColor?: string;
}

export default function useLoadingModal() {
	const [isVisible, setIsVisible] = useState(false);

	const LoadingModal = ({ description, loadingColor }: LoadingModalProps) => (
		<Modal
			isVisible={isVisible}
			toggleVisibility={() => setIsVisible(!isVisible)}
			title={"Aguarde..."}
			description={description ?? "Estamos processando sua requisição..."}
			icon="pending-actions"
		>
			<View className="w-full py-2.5 bg-gray-100 rounded-md flex-row items-center justify-center">
				<ActivityIndicator
					size={"small"}
					color={loadingColor ?? colors.text[100]}
				/>
			</View>
		</Modal>
	);

	return { LoadingModal, setIsVisible };
}
