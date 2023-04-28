import { View, Text, TextProps } from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";
import { FC, SVGProps } from "react";

interface Props extends TextProps {
	icon?: {
		name: string;
		size?: number;
		color?: string;
	};
	customIcon?: FC<SVGProps<SVGSVGElement>>;
}

export default function Label({
	children,
	icon,
	customIcon: CustomIcon,
	...rest
}: Props) {
	const { colorScheme } = useColorScheme();

	return (
		<View
			className="flex flex-row items-center justify-start"
			style={{ columnGap: 10, width: "100%" }}
		>
			{CustomIcon && (
				<CustomIcon fontSize={18} color={colors.text[100]} />
			)}
			{icon && (
				<MaterialIcons
					name={icon.name as unknown as any}
					size={icon.size || 18}
					color={
						icon.color
							? icon.color
							: colorScheme === "dark"
							? colors.text[100]
							: colors.black
					}
				/>
			)}
			<Text
				className="flex flex-1 font-semibold text-[15px] text-black dark:text-text-100"
				{...rest}
			>
				{children}
			</Text>
		</View>
	);
}
