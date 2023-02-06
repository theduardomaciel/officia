import { View, Text, TextProps } from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

interface Props extends TextProps {
    icon?: string
}

export default function Label({ children, icon, ...rest }: Props) {
    const { colorScheme } = useColorScheme();

    return (
        <View className="w-full flex-row items-center justify-start">
            {
                icon && (
                    <View className="mr-2">
                        {
                            typeof icon === "string" ?
                                <MaterialIcons
                                    name={icon as unknown as any}
                                    size={18} color={colorScheme === "dark" ? colors.text[100] : colors.black}
                                />
                                : icon
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