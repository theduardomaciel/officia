import React, { FC, SVGProps } from "react";
import { Text, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import Label from "components/Label";
import ButtonLoadingIndicator from "components/ButtonLoadingIndicator";

// Types
import type { MaterialModel } from "database/models/materialModel";
import type { ServiceModel } from "database/models/serviceModel";
import type { SubServiceModel } from "database/models/subServiceModel";

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
        description?: string;
        icon?: string;
        customIcon?: FC<SVGProps<SVGSVGElement>>;
        children?: React.ReactNode;
    },
    preset?: "smallMargin" | "subSection";
    style?: ViewStyle;
    children?: React.ReactNode
}

export const SubSectionWrapper = React.memo(({ header, children, style, preset }: SubSectionWrapperProps) => {
    return (
        <View className='w-full flex-col items-start justify-start' style={[{ rowGap: 10 }, style]}>
            <View className='flex-1 flex-row items-center justify-between' style={{ marginBottom: preset === "smallMargin" ? 0 : 10 }}>
                <View className="flex-1 flex-col items-start justify-start">
                    <Label
                        icon={header.icon ? {
                            name: header.icon,
                            size: preset === "subSection" ? 14 : 18
                        } : undefined}
                        CustomIcon={header.customIcon}
                        style={[{ marginRight: 10 }, preset === "subSection" && { fontSize: 14, fontWeight: "400" }]}
                    >
                        {header.title}
                    </Label>
                    {
                        header.description && (
                            <Text className="text-sm leading-4 text-text-200">
                                {header.description}
                            </Text>
                        )
                    }
                </View>
                {header.children}
            </View>
            {children}
        </View>
    )
});

interface NextButtonProps extends TouchableOpacityProps {
    isLastButton?: boolean;
    isLoading?: boolean;
    style?: ViewStyle;
    title?: string;
    icon?: string;
}

export const NextButton = ({ isLastButton, isLoading, title, style, icon, ...rest }: NextButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={isLoading ? 1 : 0.8}
            className='flex-row items-center justify-center w-full py-4 rounded'
            disabled={isLoading}
            style={[{
                backgroundColor: isLastButton ? colors.primary.green : colors.gray[200],
            }, style]}
            {...rest}
        >
            {
                isLoading ? (
                    <ButtonLoadingIndicator />
                ) : (
                    <>
                        {icon && <MaterialIcons name={icon as unknown as any} size={22} color={colors.white} style={{ marginRight: 15 }} />}
                        <Text className='font-bold text-white text-base'>
                            {title ? title : isLastButton ? "Agendar" : "Próximo"}
                        </Text>
                    </>
                )
            }
        </TouchableOpacity>
    )
}