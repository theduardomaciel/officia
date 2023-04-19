import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheet from "components/BottomSheet";

import colors from "global/colors";

interface Props {
	children: React.ReactNode;
	bottomSheet: string;
	expanded?: boolean;
	onDismissed?: () => void;
	onExpanded?: () => void;
	bottomSheetHeight?: string;
	rowGap?: number;
}

export default function SectionBottomSheet({
	children,
	bottomSheet,
	expanded = false,
	onDismissed,
	onExpanded,
	bottomSheetHeight,
	rowGap,
}: Props) {
	const insets = useSafeAreaInsets();

	return (
		<BottomSheet
			id={bottomSheet}
			defaultValues={{
				expanded: expanded,
				suppressBackdrop: true,
				suppressHandle: true,
				suppressPortal: true,
			}}
			height={bottomSheetHeight ?? "76%"}
			canDismiss={false}
			heightLimitBehaviour="contentHeight"
			colors={{
				background: colors.gray[500],
			}}
			onDismissed={onDismissed}
			onExpanded={onExpanded}
		>
			<View
				className="flex flex-1"
				style={{
					paddingTop: 24,
					paddingLeft: 24,
					paddingRight: 24,
					paddingBottom: 12 + insets.bottom + 10,
					rowGap: rowGap ?? 25,
				}}
			>
				{children}
			</View>
		</BottomSheet>
	);
}
