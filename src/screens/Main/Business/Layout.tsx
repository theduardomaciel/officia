import React from "react";

// Components
import Container from "components/Container";
import Header from "components/Header";
import { ContainerScrollView } from "components/Container";

// Hooks
import { useNavigation } from "@react-navigation/native";
import useBackHandler from "hooks/useBackHandler";
import useFormChangesObserver from "hooks/useFormChangesObserver";

// Types
import type { WrapperProps } from "components/Form/SectionWrapper";
import type { FormChangesObserver } from "hooks/useFormChangesObserver";

interface Props {
	children: React.ReactNode;
	headerProps: WrapperProps["headerProps"];
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
				navigationHistory={[`Meu Negócio`]}
				returnButton={() => {
					if (hasDifferences) {
						setConfirmExitModalVisible(true);
					} else {
						navigation.goBack();
					}
				}}
				{...headerProps}
			/>
			<ContainerScrollView>{children}</ContainerScrollView>
			<FormSaveButton onPress={submitData} />
			<ConfirmExitModal />
		</Container>
	);
}
