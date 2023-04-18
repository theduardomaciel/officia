import Modal from "components/Modal";
import colors from "global/colors";

interface Props {
	isVisible: boolean;
	toggleVisibility: () => void;
	onExitConfirmation: () => void;
}

export default function ConfirmExitModal({
	isVisible,
	toggleVisibility,
	onExitConfirmation,
}: Props) {
	return (
		<Modal
			isVisible={isVisible}
			toggleVisibility={toggleVisibility}
			title="Você tem alterações não salvas."
			icon="warning"
			message="Tem certeza que deseja sair sem salvar? As alterações serão perdidas."
			buttons={[
				{
					label: "Sair",
					onPress: onExitConfirmation,
					color: colors.red,
				},
				{
					label: "Continuar editando",
					closeOnPress: true,
				},
			]}
		/>
	);
}
