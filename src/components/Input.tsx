import { TextInput, Text, TextInputProps, View, TouchableOpacity, TouchableWithoutFeedback, Alert } from "react-native";

import { useColorScheme } from "nativewind";
import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import React, { forwardRef } from "react";

import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Props extends TextInputProps {
    label?: string;
    icon?: {
        name: string;
        family?: "MaterialIcons" | "MaterialCommunityIcons" /* | "Entypo" | "Feather" | "FontAwesome" | "Ionicons" | "FontAwesome5" | "AntDesign" | "Octicons" | "Zocial" | "SimpleLineIcons" | "Foundation" | "EvilIcons" | undefined */;
    }
    customIcon?: any;
    pallette?: "dark" | "disabled";
    required?: boolean;
    appendedChildren?: React.ReactNode;
    infoMessage?: string;
    onPress?: () => void;
}

const Input = forwardRef(({ label, customIcon, icon, pallette = undefined, required, multiline, onPress, appendedChildren, infoMessage, ...rest }: Props, ref) => {
    const { colorScheme } = useColorScheme();
    /* const [isInfoMessageVisible, setIsInfoMessageVisible] = React.useState(false); */

    const CustomInput = <TextInput
        className={clsx("flex-1 px-4 py-2 rounded-lg border border-gray-300 text-white", {
            "bg-black dark:bg-gray-200": pallette === undefined,
            "bg-black dark:bg-gray-300": pallette === "dark",
            "bg-black dark:bg-gray-100 border-text-200": pallette === "disabled",
            "min-h-[100px] pt-4": multiline,
        })}
        textAlignVertical={multiline ? "top" : "center"}
        multiline={multiline}
        editable={pallette !== "disabled"}
        placeholderTextColor={colorScheme === "dark" ? colors.text[200] : colors.white}
        cursorColor={colorScheme === "dark" ? colors.text[200] : colors.white}
        selectionColor={colorScheme === "dark" ? colors.text[200] : colors.white}
        ref={ref as any}
        {...rest}
    />

    return (
        <View className="flex-col align-top justify-start" style={{ rowGap: 8 }}>
            {
                label && (
                    <View className="flex-row w-full items-start justify-between">
                        <View className="flex-1 flex-row items-center justify-start">
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
                        {
                            infoMessage && (
                                <MaterialIcons
                                    name="info-outline"
                                    size={16}
                                    onPress={() => Alert.alert("", infoMessage)}
                                    className="relative"
                                    color={colors.text[100]}
                                />
                            )
                        }
                        {/* {
                            isInfoMessageVisible && (
                                <TouchableWithoutFeedback
                                    className="w-screen h-screen absolute top-0 left-0 right-0 bottom-0 bg-red-500 z-30"
                                    onPress={() => setIsInfoMessageVisible(false)}
                                >
                                    <View className="absolute top-0 right-0 z-10 w-64 p-2 bg-white dark:bg-gray-600 rounded-lg shadow-lg">
                                        <Text className="text-xs text-black dark:text-text-100">
                                            {infoMessage}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        } */}
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
                    : <View className="flex-row">
                        {CustomInput}
                        {appendedChildren}
                    </View>
            }
        </View>
    )
});

export default Input;