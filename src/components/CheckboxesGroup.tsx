import { forwardRef, useImperativeHandle, useState } from "react";
import { View } from "react-native"
import { Checkbox } from "./Checkbox";

interface Props {
    data: string[];
}

const CheckboxesGroups = forwardRef(({ data }: Props, ref) => {
    const [checked, setChecked] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
        getChecked: () => checked,
    }));

    return (
        <View className='flex-row flex-wrap items-center justify-between'>
            {
                data.map((tag, index) => (
                    <View key={index} className='w-1/2'>
                        <Checkbox
                            title={tag}
                            checked={checked.includes(tag)}
                            onPress={() => {
                                if (checked.includes(tag)) {
                                    setChecked(checked.filter(item => item !== tag))
                                } else {
                                    setChecked([...checked, tag])
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