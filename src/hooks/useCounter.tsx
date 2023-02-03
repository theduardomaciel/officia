import { useEffect, useState } from "react";

// Original code from: https://github.com/nikantic/stopwatch-timer-reanimated/blob/master/src/components/Counter.tsx

import {
    cancelAnimation,
    Easing,
    runOnJS,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { withPause } from "react-native-redash";

const useCounter = ({ timerDuration }: { timerDuration?: number }) => {
    const duration = timerDuration ? timerDuration : 5000;

    /* const [value, setValue] = useState(timerDuration ? duration : 0);
    const [started, setStarted] = useState(false); */

    const animCounter = useSharedValue(timerDuration ? duration : 0);
    const animPaused = useSharedValue(true);

    /* const updateValue = (val: number) => setValue(val);

    useDerivedValue(() => {
        runOnJS(updateValue)(animCounter.value);
    }); */

    const startAnimation = () => {
        animCounter.value = withPause(
            withRepeat(
                withTiming(timerDuration ? 0 : duration, {
                    duration,
                    easing: Easing.linear,
                }),
                timerDuration ? 1 : -1
            ),
            animPaused
        );
    };

    const controls = {
        play: (play: boolean) => {
            animPaused.value = !play;
            if (play && /* !started */ !animPaused.value) {
                startAnimation();
                //setStarted(true);
            }
        },
        reset: () => {
            cancelAnimation(animCounter);
            animCounter.value = timerDuration ? duration : 0;
        },
    };

    useEffect(() => {
        return () => cancelAnimation(animCounter);
    }, []);

    return {
        animCounter,
        //value,
        controls,
    };
};

export default useCounter;