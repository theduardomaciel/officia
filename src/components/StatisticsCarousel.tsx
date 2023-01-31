import * as React from "react";
import { Dimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { StatisticsCard } from "./StatisticsCard";

const PAGE_WIDTH = Dimensions.get("window").width;
const colors = [
    "#26292E",
    "#899F9C",
    "#B3C680",
];

interface Props {
    setCanScrollVertically: (value: boolean) => void;
}

export default function StatisticsCarousel({ setCanScrollVertically }: Props) {
    const progressValue = useSharedValue<number>(0);
    const baseOptions = {
        vertical: false,
        width: PAGE_WIDTH,
        height: PAGE_WIDTH * 0.6,
    } as const;


    return (
        <GestureHandlerRootView style={{
            alignItems: "center",
        }}>
            <Carousel
                {...baseOptions}
                loop
                pagingEnabled={true}
                snapEnabled={true}
                /* autoPlay={true}
                autoPlayInterval={10000} */
                onProgressChange={(_, absoluteProgress) =>
                    (progressValue.value = absoluteProgress)
                }
                onScrollBegin={() => setCanScrollVertically(false)}
                onScrollEnd={() => setCanScrollVertically(true)}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.88,
                    parallaxScrollingOffset: 50,
                }}
                data={colors}
                renderItem={({ index }) => <StatisticsCard progressValue={progressValue} index={index} />}
            />
            {!!progressValue && (
                <View className="flex-row justify-between self-center w-10">
                    {colors.map((_, index) => {
                        return (
                            <PaginationItem
                                animValue={progressValue}
                                index={index}
                                key={index}
                                isRotate={false}
                                length={colors.length}
                            />
                        );
                    })}
                </View>
            )}
        </GestureHandlerRootView>
    );
}

const PaginationItem: React.FC<{
    index: number
    /* backgroundColor: string */
    length: number
    animValue: Animated.SharedValue<number>
    isRotate?: boolean
}> = (props) => {
    const { animValue, index, length, isRotate } = props;
    const width = 8;

    const animStyle = useAnimatedStyle(() => {
        let inputRange = [index - 1, index, index + 1];
        let outputRange = [-width, 0, width];

        if (index === 0 && animValue?.value > length - 1) {
            inputRange = [length - 1, length, length + 1];
            outputRange = [-width, 0, width];
        }

        return {
            transform: [
                {
                    translateX: interpolate(
                        animValue?.value,
                        inputRange,
                        outputRange,
                        Extrapolate.CLAMP,
                    ),
                },
            ],
        };
    }, [animValue, index, length]);
    return (
        <View
            className="bg-bg-200"
            style={{
                width,
                height: width,
                borderRadius: 50,
                overflow: "hidden",
                transform: [
                    {
                        rotateZ: isRotate ? "90deg" : "0deg",
                    },
                ],
            }}
        >
            <Animated.View
                className={'bg-text-200'}
                style={[
                    {
                        borderRadius: 50,
                        //backgroundColor,
                        flex: 1,
                    },
                    animStyle,
                ]}
            />
        </View>
    );
};