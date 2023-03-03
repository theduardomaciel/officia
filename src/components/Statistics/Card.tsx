import React from "react";
import type { ViewStyle } from "react-native";
import { View, ActivityIndicator } from "react-native";

import colors from "global/colors";

interface Props {
    index: number;
    style?: ViewStyle;
}

export const StatisticsCard = ({ index, style }: Props) => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-500 rounded-xl overflow-hidden" style={[style]}>
            <ActivityIndicator size="small" color={colors.gray[100]} />
        </View>
    );
};