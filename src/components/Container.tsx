import React from "react";
import { View, ScrollView, ViewStyle } from "react-native";

interface BackHandlerProps {
	shouldTrigger: boolean;
	onBack: () => void;
	navigation: any;
}

interface Props {
	children: React.ReactNode;
	style?: ViewStyle;
}

export default function Container({
	children,
	style,
}: Props & { backHandlerProps?: BackHandlerProps }) {
	return (
		<View
			className="flex-1 min-h-full px-6 pt-12 relative"
			style={[{ rowGap: 20 }, style]}
		>
			{children}
		</View>
	);
}

export function BusinessScrollView({ children, style }: Props) {
	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={{ flex: 1 }}
			contentContainerStyle={[{ rowGap: 20 }, style]}
		>
			{children}
		</ScrollView>
	);
}
