import React, { FC, SVGProps } from "react";
import { Text, View, ViewStyle } from "react-native";

import Label from "components/Label";

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
        <View className='w-full flex-1 flex-col items-start justify-start' style={[{ rowGap: 10 }, style]}>
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