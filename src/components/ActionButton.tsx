import { TouchableOpacity, Text } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

interface Props {
    label: string;
    icon?: string;
    onPress: () => void;
}

export const ActionButton = ({ onPress, label, icon }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded bg-primary-green'
            onPress={onPress}
            ref={(ref) => { ref = ref }}
        >
            <MaterialIcons name={icon as unknown as any || 'add'} size={18} color={colors.white} />
            <Text className='ml-2 font-medium text-white text-sm'>
                {label}
            </Text>
        </TouchableOpacity>
    )
}

export const SubActionButton = ({ onPress, label, icon }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className='flex-row items-center justify-center w-full py-3 bg-gray-300 border border-gray-100 rounded'
        >
            <MaterialIcons name={icon as unknown as any || 'add'} size={18} color={colors.white} />
            <Text className='ml-2 font-medium text-white text-sm'>
                {label}
            </Text>
        </TouchableOpacity>
    )
}