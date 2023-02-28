import React from "react";
import { TouchableOpacity, Text, ViewStyle, ActivityIndicator } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

interface Props {
    label?: string;
    icon?: string;
    onPress: () => void;
    isLoading?: boolean;
    style?: ViewStyle;
}

const Label = ({ children }: { children: React.ReactNode }) => (
    <Text className='ml-2 font-medium text-white text-sm'>
        {children}
    </Text>
)

export const ActionButton = ({ onPress, label, icon, isLoading, style }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded bg-primary-green'
            style={style}
            onPress={onPress}
            ref={(ref) => { ref = ref }}
        >
            {
                isLoading ? (
                    <ActivityIndicator size={"small"} color={"#FFFFFF"} />
                ) : (
                    <>
                        <MaterialIcons name={icon as unknown as any || 'add'} size={18} color={colors.white} />
                        {
                            label && <Label>
                                {label}
                            </Label>
                        }
                    </>
                )
            }
        </TouchableOpacity>
    )
}

interface SubProps extends Props {
    preset?: 'dashed';
    borderColor?: string;
}

export const SubActionButton = ({ onPress, label, icon, isLoading, style, preset, borderColor }: SubProps) => {
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
            {
                isLoading ? (
                    <ActivityIndicator size={"small"} color={"#FFFFFF"} />
                ) : (
                    <>
                        {icon && <MaterialIcons name={icon as unknown as any || 'add'} size={18} color={colors.white} />}
                        {
                            label && <Label>
                                {label}
                            </Label>
                        }
                    </>
                )
            }
        </TouchableOpacity>
    )
}