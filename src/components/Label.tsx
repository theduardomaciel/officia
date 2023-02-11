import { View, Text, TextProps } from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";
import { FC, SVGProps } from "react";

interface Props extends TextProps {
    icon?: {
        name: string;
        size?: number;
        color?: string;
    }
    CustomIcon?: FC<SVGProps<SVGSVGElement>>;
}

export default function Label({ children, icon, CustomIcon, ...rest }: Props) {
    const { colorScheme } = useColorScheme();
    return (
        <View className="flex-row items-center justify-start">
            {
                (icon || CustomIcon) && (
                    <View className="mr-2">
                        {
                            CustomIcon && <CustomIcon fontSize={18} color={colors.text[100]} />
                        }
                        {
                            icon && <MaterialIcons
                                name={icon.name as unknown as any}
                                size={icon.size || 18}
                                color={icon.color || colorScheme === "dark" ? colors.text[100] : colors.black}
                            />
                        }
                    </View>
                )
            }
            <Text className="font-semibold text-[15px] text-black dark:text-text-100" {...rest}>
                {children}
            </Text>
        </View>
    )
}