import { TextInput, Text, TextInputProps, View, TouchableOpacity } from "react-native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import { forwardRef, useMemo } from "react";

import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Props extends TextInputProps {
    label?: string;
    icon?: {
        name: string;
        family?: "MaterialIcons" | "MaterialCommunityIcons" /* | "Entypo" | "Feather" | "FontAwesome" | "Ionicons" | "FontAwesome5" | "AntDesign" | "Octicons" | "Zocial" | "SimpleLineIcons" | "Foundation" | "EvilIcons" | undefined */;
    }
    customIcon?: any;
    pallette?: "dark";
    required?: boolean;
    onPress?: () => void;
}

const Input = forwardRef(({ label, customIcon, icon, pallette, required, multiline, onPress, ...rest }: Props, ref) => {
    const { colorScheme } = useColorScheme();

    const CustomInput = <TextInput
        className={clsx("w-full px-4 py-2 rounded-lg border border-gray-300 text-white", {
            "bg-black dark:bg-gray-200": pallette !== "dark",
            "bg-black dark:bg-gray-300": pallette === "dark",
            "min-h-[100px] pt-4": multiline,
        })}
        textAlignVertical={multiline ? "top" : "center"}
        multiline={multiline}
        placeholderTextColor={colorScheme === "dark" ? colors.text[200] : colors.white}
        cursorColor={colorScheme === "dark" ? colors.text[200] : colors.white}
        selectionColor={colorScheme === "dark" ? colors.text[200] : colors.white}
        ref={ref as any}
        {...rest}
    />

    return (
        <View className="flex-col align-top justify-start gap-y-2">
            {
                label && (
                    <View className="w-full flex-row items-center justify-start">
                        {
                            customIcon ? (
                                <View className="mr-3">
                                    {customIcon}
                                </View>
                            ) : (
                                icon && (
                                    <View className="mr-3">
                                        {
                                            icon.family === "MaterialCommunityIcons" ? (
                                                <MaterialCommunityIcons
                                                    name={icon.name as unknown as any}
                                                    size={18}
                                                    color={colorScheme === "dark" ? colors.text[200] : colors.black}
                                                />
                                            ) : (
                                                <MaterialIcons
                                                    name={icon.name as unknown as any}
                                                    size={18}
                                                    color={colorScheme === "dark" ? colors.text[200] : colors.black}
                                                />
                                            )
                                        }
                                    </View>
                                )
                            )
                        }
                        <Label>
                            {label}
                            {
                                required && (
                                    <Text className="text-xs text-black dark:text-text-100">
                                        {` `}*
                                    </Text>
                                )
                            }
                        </Label>
                    </View>
                )
            }
            {
                onPress ? (
                    <TouchableOpacity
                        onPress={onPress}
                        activeOpacity={0.8}
                    >
                        {CustomInput}
                    </TouchableOpacity>
                )
                    : CustomInput
            }
        </View>
    )
});

export default Input;