import React, { useImperativeHandle, useState } from "react";
import { View } from "react-native"
import { Checkbox } from "./Checkbox";

interface Props {
    data: string[];
    checked: string[];
    /* setChecked: (checked: string[]) => void; */
    /* updateTags: (tag: string, type: "add" | "remove") => void; */
    dispatch: (action: { type: "add" | "remove", payload: string }) => void;
}

const CheckboxesGroups = React.memo(({ data, checked, dispatch }: Props, ref) => {
    //const [checked, setChecked] = useState<string[]>([]);

    /* useImperativeHandle(ref, () => ({
        getValue: () => checked,
    })); */

    return (
        <View className='flex-row flex-wrap items-center justify-between'>
            {
                data.map((tag, index) => (
                    <View key={index} className='w-1/2'>
                        <Checkbox
                            customKey={`${tag}-${index}`}
                            title={tag}
                            checked={checked.includes(tag)}
                            onPress={() => {
                                if (checked.includes(tag)) {
                                    /* setChecked(checked.filter(item => item !== tag)) */
                                    /* updateTags(tag, "remove") */
                                    dispatch({ type: "remove", payload: tag });
                                } else {
                                    /* setChecked([...checked, tag]) */
                                    /* updateTags(tag, "add") */
                                    dispatch({ type: "add", payload: tag });
                                }
                            }}
                        />
                    </View>
                ))
            }
        </View>
    )
});

export default CheckboxesGroups;