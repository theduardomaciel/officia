import { memo, useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

// Components
import ConfirmExitModal, {
	ConfirmExitModalProps,
} from "components/Business/ConfirmExitModal";

interface UseBackHandlerProps {
	shouldTriggerModal: () => boolean;
	onBack?: () => void;
	onExitConfirm: () => void;
}

export default function useBackHandler({
	shouldTriggerModal,
	onBack,
	onExitConfirm,
}: UseBackHandlerProps) {
	const [confirmExitModalVisible, setConfirmExitModalVisible] =
		useState(false);

	useEffect(() => {
		const backAction = () => {
			const shouldTrigger = shouldTriggerModal();
			if (shouldTrigger) {
				setConfirmExitModalVisible(true);
				return true;
			} else if (onBack) {
				onBack();
				return true;
			}
			return false;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		return () => backHandler.remove();
	}, []);

	const Modal = memo((props: Partial<ConfirmExitModalProps>) => {
		const { onExitConfirmation, isVisible, toggleVisibility, ...rest } =
			props;

		return (
			<ConfirmExitModal
				isVisible={confirmExitModalVisible}
				onExitConfirmation={() => {
					setConfirmExitModalVisible(false);
					onExitConfirm();
				}}
				toggleVisibility={() => setConfirmExitModalVisible(false)}
				{...rest}
			/>
		);
	});

	return {
		ConfirmExitModal: Modal,
		setConfirmExitModalVisible,
	};
}
