import React from "react";
import { TouchableOpacity, Text, ViewStyle, ActivityIndicator, TouchableOpacityProps } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";
import clsx from "clsx";

const Label = ({ children }: { children: React.ReactNode }) => (
    <Text className='ml-2 font-medium text-white text-sm'>
        {children}
    </Text>
)

interface Props {
    label?: string;
    icon?: string;
    disabled?: boolean;
    onPress: () => void;
    isLoading?: boolean;
    preset?: "next" | "dashed";
    style?: ViewStyle;
}

export const ActionButton = ({ onPress, label, icon, isLoading, disabled, style, preset }: Props) => {
    return (
        <TouchableOpacity
            activeOpacity={isLoading ? 1 : 0.8}
            disabled={isLoading || disabled}
            className={clsx('flex-row items-center justify-center w-full py-4 rounded bg-primary-green', {
                'bg-gray-200': isLoading || preset === "next",
            })}
            style={[style, { columnGap: 10, opacity: disabled ? 0.5 : 1 }]}
            onPress={onPress}
        >
            {
                isLoading ? (
                    <ActivityIndicator size={"small"} color={colors.white} />
                ) : (
                    <>
                        {icon &&
                            <MaterialIcons name={icon as unknown as any || 'add'}
                                size={preset === "next" ? 22 : 18} color={colors.white}
                            />}
                        {
                            label && preset === "next" ? (
                                <Text className='font-bold text-white text-base'>
                                    {label}
                                </Text>
                            ) : (
                                <Label>
                                    {label}
                                </Label>
                            )
                        }
                    </>
                )
            }
        </TouchableOpacity>
    )
}

interface SubProps extends Props {
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