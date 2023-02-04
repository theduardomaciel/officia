import clsx from "clsx";
import colors from "global/colors";
import { TextInput, Text, TextInputProps, View, TouchableOpacity } from "react-native";

import Label from "./Label";

interface Props extends TextInputProps {
    label: string;
    icon?: any;
    pallette?: "dark";
    required?: boolean;
    onPress?: () => void;
}

export default function Input({ label, icon, pallette, required, onPress, ...rest }: Props) {
    const CustomInput = <TextInput
        {...rest}
        className={clsx("w-full px-4 py-2 rounded-lg text-white", {
            "bg-black dark:bg-gray-200": pallette !== "dark",
            "bg-black dark:bg-gray-300": pallette === "dark",
        })}
        placeholderTextColor={colors.text[200]}
        cursorColor={colors.text[200]}
        selectionColor={colors.text[200]}
    />

    return (
        <View className="flex-col align-top justify-start gap-y-2">
            <View className="w-full flex-row items-center justify-start">
                {
                    icon && (
                        <View className="mr-2">
                            {icon}
                        </View>
                    )
                }
                <Label>
                    {label}
                </Label>
                {
                    required && (
                        <Text className="text-xs text-black dark:text-text-100">
                            {` `}*
                        </Text>
                    )
                }
            </View>
            {
                onPress ? (
                    <TouchableOpacity
                        onPress={onPress}
                        activeOpacity={0.8}
                    >
                        {CustomInput}
                    </TouchableOpacity>
                )
                    : (
                        <TextInput
                            {...rest}
                            className={clsx("w-full px-4 py-2 rounded-lg text-white", {
                                "bg-black dark:bg-gray-200": pallette !== "dark",
                                "bg-black dark:bg-gray-300": pallette === "dark",
                            })}
                            placeholderTextColor={colors.text[200]}
                            cursorColor={colors.text[200]}
                            selectionColor={colors.text[200]}
                        />
                    )
            }
        </View>
    )
}