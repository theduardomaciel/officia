import {
	TextInput,
	Text,
	TextInputProps,
	View,
	TouchableOpacity,
	Alert,
	ViewStyle,
} from "react-native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import React, { forwardRef } from "react";

import {
	MaterialIcons,
	MaterialCommunityIcons,
	FontAwesome5,
} from "@expo/vector-icons";

export interface CustomInputProps extends TextInputProps {
	children?: React.ReactNode;
	label?: string;
	icon?: {
		name: string;
		family?:
			| "MaterialIcons"
			| "MaterialCommunityIcons"
			| "FontAwesome5" /* | "Entypo" | "Feather" | "FontAwesome" | "Ionicons"  | "AntDesign" | "Octicons" | "Zocial" | "SimpleLineIcons" | "Foundation" | "EvilIcons" | undefined */;
	};
	labelChildren?: React.ReactNode;
	customIcon?: any;
	pallette?: "dark" | "disabled";
	required?: boolean;
	infoMessage?: string;
	onPress?: () => void;
	disabled?: boolean;
}

const Input = forwardRef(
	(
		{
			label,
			customIcon,
			icon,
			pallette = undefined,
			required,
			labelChildren,
			multiline,
			onPress,
			children,
			infoMessage,
			disabled,
			...rest
		}: CustomInputProps,
		ref
	) => {
		const { colorScheme } = useColorScheme();
		/* const [isInfoMessageVisible, setIsInfoMessageVisible] = React.useState(false); */

		const CustomInput = (
			<TextInput
				className={clsx(
					"flex-1 px-4 py-2 rounded-lg border border-gray-300 text-white",
					{
						"bg-black dark:bg-gray-200": pallette === undefined,
						"bg-black dark:bg-gray-300": pallette === "dark",
						"bg-black dark:bg-gray-100 border-text-200":
							pallette === "disabled",
						"min-h-[100px] pt-4": multiline,
					}
				)}
				textAlignVertical={multiline ? "top" : "center"}
				multiline={multiline}
				editable={pallette !== "disabled" && !onPress}
				placeholderTextColor={
					colorScheme === "dark" ? colors.text[200] : colors.white
				}
				cursorColor={
					colorScheme === "dark" ? colors.text[200] : colors.white
				}
				selectionColor={
					colorScheme === "dark" ? colors.text[200] : colors.white
				}
				ref={ref as any}
				{...rest}
			/>
		);

		return (
			<View
				className="flex-col align-top justify-start"
				style={{ rowGap: 8 }}
			>
				{label && (
					<View className="flex-row w-full items-center justify-between">
						<View className="flex-1 flex-row items-center justify-start">
							{customIcon ? (
								<View className="mr-3">{customIcon}</View>
							) : (
								icon && (
									<View className="mr-3">
										{icon.family ===
										"MaterialCommunityIcons" ? (
											<MaterialCommunityIcons
												name={
													icon.name as unknown as any
												}
												size={18}
												color={
													colorScheme === "dark"
														? colors.text[200]
														: colors.black
												}
											/>
										) : icon.family === "FontAwesome5" ? (
											<FontAwesome5
												name={
													icon.name as unknown as any
												}
												size={18}
												color={
													colorScheme === "dark"
														? colors.text[200]
														: colors.black
												}
											/>
										) : (
											<MaterialIcons
												name={
													icon.name as unknown as any
												}
												size={18}
												color={
													colorScheme === "dark"
														? colors.text[200]
														: colors.black
												}
											/>
										)}
									</View>
								)
							)}
							<Label>
								{label}
								{required && (
									<Text className="text-xs text-black dark:text-text-100">
										{` `}*
									</Text>
								)}
							</Label>
						</View>
						{infoMessage && (
							<MaterialIcons
								name="info-outline"
								size={16}
								onPress={() => Alert.alert("", infoMessage)}
								className="relative"
								color={colors.text[100]}
							/>
						)}
						{labelChildren && labelChildren}
					</View>
				)}
				{onPress ? (
					<TouchableOpacity
						onPress={onPress}
						activeOpacity={disabled ? 1 : 0.8}
						disabled={disabled}
					>
						{CustomInput}
					</TouchableOpacity>
				) : (
					<View className="flex-row relative">
						{CustomInput}
						{children}
					</View>
				)}
			</View>
		);
	}
);

export default Input;

export const borderErrorStyle = {
	borderColor: colors.red,
	borderWidth: 1,
	borderTopColor: colors.red,
	borderBottomColor: colors.red,
} as ViewStyle;
