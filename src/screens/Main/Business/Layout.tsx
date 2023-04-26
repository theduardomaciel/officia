import React, { useEffect } from "react";

// Components
import Container from "components/Container";
import Header from "components/Header";
import SaveButton from "components/Business/SaveButton";

// Hooks
import { useNavigation } from "@react-navigation/native";
import useBackHandler from "hooks/useBackHandler";

// Types
import type { BusinessData } from "./@types";
import type { SubSectionWrapperProps } from "components/Form/SubSectionWrapper";
import type { FormChangesObserver } from "hooks/useFormChangesObserver";
import useFormChangesObserver from "hooks/useFormChangesObserver";

interface Props {
	children: React.ReactNode;
	headerProps: SubSectionWrapperProps["header"];
	changesObserverProps: FormChangesObserver;
	submitData: () => void;
}

export default function BusinessLayout({
	children,
	headerProps,
	changesObserverProps,
	submitData,
}: Props) {
	const navigation = useNavigation();

	const { FormSaveButton, hasDifferences } = useFormChangesObserver({
		...changesObserverProps,
	});

	const { ConfirmExitModal, setConfirmExitModalVisible } = useBackHandler({
		onExitConfirm: () => {
			navigation.goBack();
		},
		shouldTriggerModal: () => hasDifferences,
	});

	return (
		<Container>
			<Header
				returnButton={() => {
					if (hasDifferences) {
						setConfirmExitModalVisible(true);
					} else {
						navigation.goBack();
					}
				}}
				{...headerProps}
			/>
			{children}
			<FormSaveButton onPress={submitData} />
			<ConfirmExitModal />
		</Container>
	);
}
