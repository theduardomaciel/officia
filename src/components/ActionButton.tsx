import { TouchableOpacity, Text, ViewStyle } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";
import clsx from "clsx";

interface Props {
    label: string;
    icon?: string;
    onPress: () => void;
    preset?: 'dashed';
    borderColor?: string;
    style?: ViewStyle;
}

export const ActionButton = ({ onPress, label, icon, preset, style }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded bg-primary-green'
            style={style}
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

export const SubActionButton = ({ onPress, label, icon, style, preset, borderColor }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className={'flex-row items-center justify-center w-full py-3 bg-gray-300'}
            style={[style, {
                borderRadius: 5,
                borderWidth: 1,
                borderStyle: preset === 'dashed' ? 'dashed' : 'solid',
                backgroundColor: preset === "dashed" ? 'transparent' : colors.gray[300],
                borderColor: borderColor ? borderColor : colors.gray[100],
            }]}
        >
            {icon && <MaterialIcons name={icon as unknown as any || 'add'} size={18} color={colors.white} />}
            <Text className='ml-2 font-medium text-white text-sm'>
                {label}
            </Text>
        </TouchableOpacity>
    )
}