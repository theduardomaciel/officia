import React from "react";
import type { StyleProp, ViewStyle, ViewProps } from "react-native";
import { LongPressGestureHandler } from "react-native-gesture-handler";
import { AnimateProps, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import { View, ActivityIndicator, Text, Image, StyleSheet } from "react-native";

import Constants from "expo-constants";
import colors from "global/colors";

interface Props extends AnimateProps<ViewProps> {
    style?: StyleProp<ViewStyle>
    index: number;
    progressValue: Animated.SharedValue<number>;
    pretty?: boolean
}

export const StatisticsCard: React.FC<Props> = (props) => {
    const { style, index, pretty, testID, progressValue, ...animatedViewProps } = props;
    const enablePretty = Constants?.manifest?.extra?.enablePretty || false;
    const [isPretty, setIsPretty] = React.useState(pretty || enablePretty);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                progressValue.value,
                [index - 1, index, index + 1],
                [colors.bg[200], colors.bg[500], colors.bg[200]],
            ),
        };
    }, []);

    return (
        <LongPressGestureHandler
            onActivated={() => {
                setIsPretty(!isPretty);
            }}
        >
            <Animated.View testID={testID} style={{ flex: 1 }} {...animatedViewProps}>
                <Animated.View className="flex-1 justify-center items-center bg-bg-500 rounded-xl overflow-hidden" style={[animatedStyle, style]}>
                    <ActivityIndicator size="small" color={colors.bg[100]} />
                    {/* <Image key={index} style={styles.image} source={{ uri: "https://pbs.twimg.com/media/Fnu8kcxXwAISMEU?format=jpg&name=large" }} /> */}
                </Animated.View>
            </Animated.View>
        </LongPressGestureHandler>
    );
};

const styles = StyleSheet.create({
    image: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});