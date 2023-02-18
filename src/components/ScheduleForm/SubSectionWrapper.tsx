import React, { FC, memo, SVGProps } from "react";
import { View, Text, TouchableOpacity, ViewStyle, TouchableOpacityProps } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import Label from "components/Label";

// Types
import type { ServiceModel } from "database/models/serviceModel";
import type { SubServiceModel } from "database/models/subServiceModel";
import type { MaterialModel } from "database/models/materialModel";

export interface Section {
    bottomSheetRef: React.RefObject<any>;
    initialValue?: {
        service: ServiceModel;
        subServices: SubServiceModel[];
        materials: MaterialModel[];
    };
    updateHandler?: (id: number) => void;
}

export interface SubSectionWrapperProps {
    header: {
        title: string;
        icon?: string;
        customIcon?: FC<SVGProps<SVGSVGElement>>;
        children?: React.ReactNode;
    },
    style?: ViewStyle;
    children?: React.ReactNode
}


export const MARGIN = 20;

export const SubSectionWrapper = memo(({ header, children, style }: SubSectionWrapperProps) => {
    return (
        <View className='w-full flex-col items-start justify-start gap-y-4' style={[{ marginBottom: MARGIN }, style]}>
            <View className='w-full flex-row items-center justify-between'>
                <Label
                    icon={header.icon ? { name: header.icon } : undefined}
                    CustomIcon={header.customIcon}
                    style={{ marginRight: 10 }}
                >
                    {header.title}
                </Label>
                {header.children}
            </View>
            {children}
        </View>
    )
})

export const SubSection = React.memo(({ header, children }: SubSectionWrapperProps) => {
    return (
        <View className='w-full flex-col items-start justify-start gap-y-2' style={{ marginBottom: MARGIN }}>
            <View className='w-full flex-row items-center justify-between'>
                <View className='flex-row items-center justify-start'>
                    <Label
                        icon={header.icon ? {
                            name: header.icon,
                            size: 14,
                        } : undefined}
                        CustomIcon={header.customIcon}
                        style={{ marginRight: 10, fontSize: 14, fontWeight: "400" }}
                    >
                        {header.title}
                    </Label>
                </View>
                {header.children}
            </View>
            {children}
        </View>
    )
});

interface NextButtonProps extends TouchableOpacityProps {
    isLastButton?: boolean;
    style?: ViewStyle;
    title?: string;
    icon?: string;
}

export const NextButton = ({ isLastButton, title, style, icon, ...rest }: NextButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            className='flex-row items-center justify-center w-full py-4 rounded'
            style={[{
                backgroundColor: isLastButton ? colors.primary.green : colors.gray[200],
            }]}
            {...rest}
        >
            {icon && <MaterialIcons name={icon as unknown as any} size={22} color={colors.white} style={{ marginRight: 15 }} />}
            <Text className='font-bold text-white text-base'>
                {title ? title : isLastButton ? "Agendar" : "Próximo"}
            </Text>
        </TouchableOpacity>
    )
}