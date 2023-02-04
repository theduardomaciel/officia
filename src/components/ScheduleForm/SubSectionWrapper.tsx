import { View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

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
    return (
        <View className='w-full flex-col items-start justify-start gap-y-5' style={{ marginBottom: MARGIN }}>
            <View className='w-full flex-row items-center justify-between'>
                <View className='flex-row items-center justify-start'>
                    {
                        header.icon && (
                            <MaterialIcons name={header.icon as unknown as any} size={18} style={{ marginRight: 10 }} />
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