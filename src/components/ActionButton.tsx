import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";
import { ViewProps } from "react-native";
import { forwardRef } from "react";

interface Props {
    label: string;
    icon?: string;
    onPress: () => void;
}

const ActionButton = forwardRef(({ onPress, label, icon }: Props, ref) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded bg-primary-green'
            onPress={onPress}
            ref={(ref) => { ref = ref }}
        >
            <MaterialIcons name={icon as unknown as any} size={18} color={colors.white} />
            <Text className='ml-2 font-medium text-white text-sm'>
                {label}
            </Text>
        </TouchableOpacity>
    )
})

export default ActionButton;