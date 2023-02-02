import colors from "global/colors";
import { TextInput, TextInputProps, View } from "react-native";

import Label from "./Label";

interface Props extends TextInputProps {
    label: string;
    icon?: any;
}

export default function Input({ label, icon, ...rest }: Props) {
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
            </View>
            <TextInput
                {...rest}
                placeholder={rest.placeholder || label}
                className="w-full px-4 py-2 rounded-lg bg-black dark:bg-gray-200"
                placeholderTextColor={colors.text[200]}
                cursorColor={colors.text[200]}
                selectionColor={colors.text[200]}
            />
        </View>
    )
}