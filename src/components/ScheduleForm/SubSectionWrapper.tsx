import { View, Text } from "react-native";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import Label from "components/Label";

interface SubSectionWrapperProps {
    header: {
        title: string;
        icon?: string;
        children?: React.ReactNode;
    },
    children: React.ReactNode
}

export const MARGIN = 20;

export const SubSectionWrapper = ({ header, children }: SubSectionWrapperProps) => {
    const { colorScheme } = useColorScheme();

    return (
        <View className='w-full flex-col items-start justify-start gap-y-3' style={{ marginBottom: MARGIN }}>
            <View className='w-full flex-row items-center justify-between'>
                <View className='flex-row items-center justify-start'>
                    {
                        header.icon && (
                            <MaterialIcons
                                name={header.icon as unknown as any}
                                size={18}
                                style={{ marginRight: 10 }}
                                color={colorScheme === "dark" ? colors.text[100] : colors.black}
                            />
                        )
                    }
                    <Label>
                        {header.title}
                    </Label>
                </View>
                {header.children}
            </View>
            {children}
        </View>
    )
}

export const SubSection = ({ header, children }: SubSectionWrapperProps) => {
    const { colorScheme } = useColorScheme();

    return (
        <View className='w-full flex-col items-start justify-start gap-y-2' style={{ marginBottom: MARGIN }}>
            <View className='w-full flex-row items-center justify-between'>
                <View className='flex-row items-center justify-start'>
                    {
                        header.icon && (
                            <MaterialIcons
                                name={header.icon as unknown as any}
                                size={14}
                                style={{ marginRight: 10 }}
                                color={colorScheme === "dark" ? colors.text[100] : colors.black}
                            />
                        )
                    }
                    <Text className="text-sm text-black dark:text-text-100 font-medium">
                        {header.title}
                    </Text >
                </View>
                {header.children}
            </View>
            {children}
        </View>
    )
}