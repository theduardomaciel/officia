import colors from "global/colors";
import { Dispatch, forwardRef, memo, SetStateAction, useImperativeHandle, useRef, useState } from "react";
import { TouchableOpacity, View, Text, TextInput, TextInputProps } from "react-native";
import Input from "./Input";

type ToggleGroupData = {
    label: string;
    value: string;
}

type ToggleGroupManualValue = {
    onChange?: (value: string) => void;
    inputProps: TextInputProps;
    maxValue?: number;
}

interface ToggleGroupProps {
    data: ToggleGroupData[];
    selected: string | null;
    setSelected: (value: string | null) => void;
    manualValue?: ToggleGroupManualValue;
}

const ToggleGroupUI = memo(function ToggleGroupUI({ data, selected, setSelected, manualValue }: ToggleGroupProps) {
    const inputRef = useRef<TextInput>(null);
    const [value, setValue] = useState<string>("");

    return (
        <View className="flex-row w-full items-center justify-between">
            <View className="flex-row items-center justify-between flex-1">
                {
                    data.map((item, index) => (
                        <TouchableOpacity
                            activeOpacity={0.6}
                            key={index}
                            onPress={() => {
                                inputRef.current?.blur();
                                setSelected(item.value)
                            }}
                            className="flex flex-1 flex-row items-center justify-center py-4 bg-black dark:bg-gray-300 border-opacity-40 rounded-lg border-primary-green"
                            style={{
                                borderWidth: selected === item.value ? 1 : 0,
                                marginRight: index === data.length - 1 && !manualValue ? 0 : 10,
                            }}
                        >
                            <Text className='text-sm text-center text-white' style={{
                                fontWeight: selected === item.value ? "600" : "400",
                            }}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))
                }
            </View>
            {
                manualValue && (
                    <View className="flex flex-1">
                        <Input
                            ref={inputRef}
                            onChangeText={(value) => {
                                setValue(value)
                                manualValue.onChange && manualValue.onChange(value);
                            }}
                            value={value}
                            onFocus={() => {
                                setSelected(null)
                                setTimeout(() => {
                                    inputRef.current?.focus();
                                }, 1000);
                            }}
                            onBlur={() => {
                                console.log(value, manualValue.maxValue)
                                if (manualValue.maxValue && parseInt(value) > manualValue.maxValue) {
                                    console.log("max value")
                                    setValue(manualValue.maxValue.toString());
                                }
                            }}
                            style={{
                                paddingHorizontal: 0,
                                flex: 1,
                                textAlign: "center",
                                borderWidth: selected === null ? 1 : 0,
                                borderTopColor: selected === null ? colors.primary.green : colors.gray[300],
                                borderBottomColor: selected === null ? colors.primary.green : colors.gray[300],
                                borderColor: selected === null ? colors.primary.green : colors.gray[300]
                            }}
                            {...manualValue.inputProps}
                        />
                    </View>
                )
            }
        </View>
    )
})

export default function ToggleGroup({ data, selected, setSelected, manualValue }: ToggleGroupProps) {
    return <ToggleGroupUI
        data={data}
        selected={selected}
        setSelected={setSelected}
        manualValue={manualValue}
    />
};

interface StaticToggleGroupProps {
    data: ToggleGroupData[];
    manualValue?: ToggleGroupManualValue;
}

export interface RefProps {
    getSelected: () => string | null;
}

export const StaticToggleGroup = forwardRef(({ data, manualValue }: StaticToggleGroupProps, ref) => {
    //const [selected, setSelected] = useState<string | null>(initialSelected ?? data[0].value);
    const [selected, setSelected] = useState<string | null>(data[0].value);
    const manualValueRef = useRef("");

    useImperativeHandle(ref, () => ({
        getSelected: () => selected,
        getManualValue: () => manualValueRef.current,
    }));

    return <ToggleGroupUI
        data={data}
        selected={selected}
        setSelected={setSelected}
        manualValue={manualValue && {
            onChange: (value) => manualValueRef.current = value,
            inputProps: manualValue.inputProps,
            maxValue: manualValue.maxValue,
        }}
    />
});