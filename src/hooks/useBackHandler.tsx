import { memo, useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

// Components
import ConfirmExitModal, {
	ConfirmExitModalProps,
} from "components/Business/ConfirmExitModal";

export default function useBackHandler(
	shouldTriggerModal: () => boolean | undefined,
	onBack: () => void,
	onExitConfirm: () => void
) {
	const [confirmExitModalVisible, setConfirmExitModalVisible] =
		useState(false);

	useEffect(() => {
		const backAction = () => {
			const shouldTrigger = shouldTriggerModal();
			if (shouldTrigger) {
				setConfirmExitModalVisible(true);
			} else {
				onBack();
			}
			return true;
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
				onExitConfirmation={onExitConfirm}
				toggleVisibility={() => setConfirmExitModalVisible(false)}
				{...rest}
			/>
		);
	});

	return {
		ConfirmExitModal: Modal,
	};
}
