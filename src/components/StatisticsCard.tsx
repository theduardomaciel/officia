import React from "react";
import type { StyleProp, ViewStyle, ViewProps } from "react-native";
import { View, ActivityIndicator, Text } from "react-native";
import Animated, { AnimateProps, interpolateColor, useAnimatedStyle } from "react-native-reanimated";

import colors from "global/colors";

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    index: number;
    progressValue: Animated.SharedValue<number>;
    pretty?: boolean
}

export const StatisticsCard: React.FC<Props> = (props) => {
    const { style, index, pretty, testID, progressValue, ...animatedViewProps } = props;

    /* const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                progressValue.value,
                [index - 1, index, index + 1],
                [colors.gray[200], colors.gray[500], colors.gray[200]],
            ),
        };
    }, []); */

    return (
        <Animated.View testID={testID} style={{ flex: 1 }} {...animatedViewProps}>
            <Animated.View className="flex-1 justify-center items-center bg-gray-500 rounded-xl overflow-hidden" style={[/* animatedStyle */, style]}>
                <ActivityIndicator size="small" color={colors.gray[100]} />
            </Animated.View>
        </Animated.View>
    );
};