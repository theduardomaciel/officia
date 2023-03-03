import * as React from "react";
import { Dimensions, View } from "react-native";
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { StatisticsCard } from "./Card";

const PAGE_WIDTH = Dimensions.get("window").width;

interface Props {
}

export default function StatisticsCarousel({ }: Props) {
    const progressValue = useSharedValue<number>(0);
    const baseOptions = {
        vertical: false,
        width: PAGE_WIDTH,
        height: PAGE_WIDTH * 0.6,
    } as const;

    const carousel = React.useRef<any>(null);

    return (
        <View style={{ alignItems: "center" }} hitSlop={{ top: 25, bottom: 25, }}>
            <Carousel
                {...baseOptions}
                loop
                ref={carousel}
                pagingEnabled={true}
                snapEnabled={true}
                autoPlay={true}
                autoPlayInterval={10000}
                onProgressChange={(_, absoluteProgress) => (progressValue.value = absoluteProgress)}
                panGestureHandlerProps={{
                    minDist: 0,
                    activeOffsetY: 0,
                    activeOffsetX: 0,
                }}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.88,
                    parallaxScrollingOffset: 50,
                }}
                autoFillData
                data={[...new Array(3).keys()]}
                renderItem={({ index }) => <StatisticsCard index={index} />}
            />
            {!!progressValue && (
                <View className="flex-row justify-between self-center w-10">
                    {[...new Array(3).keys()].map((_, index) => {
                        return (
                            <PaginationItem
                                animValue={progressValue}
                                index={index}
                                key={index}
                                isRotate={false}
                                length={3}
                            />
                        );
                    })}
                </View>
            )}
        </View>
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
            className="bg-gray-200"
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