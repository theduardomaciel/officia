import Modal from "components/Modal";
import colors from "global/colors";

export interface ConfirmExitModalProps {
	isVisible: boolean;
	toggleVisibility: () => void;
	onExitConfirmation: () => void;
	title?: string;
	message?: string;
}

export default function ConfirmExitModal({
	isVisible,
	toggleVisibility,
	onExitConfirmation,
	title,
	message,
}: ConfirmExitModalProps) {
	return (
		<Modal
			isVisible={isVisible}
			toggleVisibility={toggleVisibility}
			title={title ?? "Você tem alterações não salvas."}
			icon="warning"
			message={
				message ??
				"Tem certeza que deseja sair sem salvar? As alterações serão perdidas."
			}
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
