import React, {
    Dispatch,
    SetStateAction,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacityProps,
    TouchableOpacity,
} from "react-native";

import colors from "global/colors";

import Input from "./Input";
import { Controller } from "react-hook-form";

interface ToggleProps extends TouchableOpacityProps {
    item: {
        label: string;
        value: string;
    };
    applyMarginRight?: boolean;
    isSelected?: boolean;
}

function Toggle({ item, isSelected, applyMarginRight, ...rest }: ToggleProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            className="flex flex-1 flex-row items-center justify-center py-4 bg-black dark:bg-gray-300 border-opacity-40 rounded-lg border-primary"
            style={{
                borderWidth: isSelected ? 1 : 0,
                marginRight: applyMarginRight ? 10 : 0,
            }}
            {...rest}
        >
            <Text
                className="text-sm text-center text-white"
                style={{
                    fontWeight: isSelected ? "600" : "400",
                }}
            >
                {item.label}
            </Text>
        </TouchableOpacity>
    );
}

interface DataProps {
    label: string;
    value: string;
}

interface ToggleGroupProps {
    data: DataProps[];
    selected: string | string[] | null;
    setSelected: (value: string | string[] | null) => void;
    children?: React.ReactNode;
}

const ToggleGroup = React.memo(
    ({ data, selected, setSelected, children }: ToggleGroupProps) => {
        return (
            <View className="flex-row w-full items-center justify-between">
                <View className="flex-row items-center justify-between flex-1">
                    {data.map((item, index) => {
                        return (
                            <Toggle
                                key={index.toString()}
                                item={item}
                                onPress={() => setSelected(item.value)}
                                isSelected={
                                    typeof selected === "string"
                                        ? selected === item.value
                                        : selected
                                        ? selected.includes(item.value)
                                        : false
                                }
                                applyMarginRight={index !== data.length - 1}
                            />
                        );
                    })}
                </View>
                {children}
            </View>
        );
    }
);

export default ToggleGroup;

interface ToggleGroupWithManualValueProps {
    data: DataProps[];
    manualValue: {
        name: string;
        inputProps: TextInputProps;
        maxValue?: number;
        unit?: {
            label: string;
            position: "start" | "end";
        };
    };
    control: any;
    hasError?: boolean;
    value?: string;
    setValue: Dispatch<SetStateAction<any>>;
}

export function ToggleGroupWithManualValue({
    data,
    manualValue,
    control,
    hasError,
    value,
    setValue,
}: ToggleGroupWithManualValueProps) {
    const inputRef = useRef<TextInput>(null); // usamos o useRef para acessar o input manualmente, removendo o foco ao apertar em outro botão

    return (
        <View
            className="flex-row w-full items-center justify-between"
            key={`${manualValue.name}_container`}
        >
            <View
                className="flex-row items-center justify-between flex-1"
                key={`${manualValue.name}_toggleContainer`}
            >
                {data.map((item, index) => (
                    <Toggle
                        key={index.toString()}
                        item={item}
                        onPress={() => {
                            setValue(item.value);
                            inputRef.current?.blur();
                        }}
                        isSelected={value === item.value}
                        applyMarginRight={
                            (data && index !== data.length - 1) ||
                            (manualValue ? true : false)
                        }
                    />
                ))}
            </View>
            <View key={`${manualValue.name}_container`} className="flex flex-1">
                <Controller
                    key={`${manualValue.name}_controller`}
                    control={control}
                    name={manualValue.name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                            key={`${name}_input`}
                            value={value}
                            onChangeText={(text) => {
                                onChange(text);
                                setValue(text);
                            }}
                            onFocus={() => {
                                if (manualValue.unit && value) {
                                    const replacedValue = value
                                        .replaceAll(manualValue.unit.label, "")
                                        .replaceAll(" ", "");
                                    onChange(replacedValue);
                                }
                            }}
                            onBlur={() => {
                                onBlur();
                                const reducedValue =
                                    manualValue.maxValue &&
                                    parseInt(value) > manualValue.maxValue
                                        ? manualValue.maxValue.toString()
                                        : value;
                                if (
                                    manualValue.unit &&
                                    value &&
                                    value.length > 0
                                ) {
                                    onChange(
                                        `${
                                            manualValue.unit &&
                                            manualValue.unit.position ===
                                                "start"
                                                ? `${manualValue.unit.label} `
                                                : ""
                                        }${reducedValue}${
                                            manualValue.unit &&
                                            manualValue.unit.position === "end"
                                                ? ` ${manualValue.unit.label}`
                                                : ""
                                        }`
                                    );
                                }
                            }}
                            ref={inputRef}
                            pallette="dark"
                            style={{
                                paddingHorizontal: 0,
                                flex: 1,
                                textAlign: "center",
                                borderWidth: value === null || hasError ? 1 : 0,
                                borderTopColor:
                                    value === null
                                        ? colors.primary
                                        : hasError
                                        ? colors.red
                                        : colors.gray[200],
                                borderBottomColor:
                                    value === null
                                        ? colors.primary
                                        : hasError
                                        ? colors.red
                                        : colors.gray[200],
                                borderColor:
                                    value === null
                                        ? colors.primary
                                        : hasError
                                        ? colors.red
                                        : colors.gray[200],
                            }}
                            {...manualValue.inputProps}
                            required
                        />
                    )}
                    rules={{ required: true }}
                />
            </View>
        </View>
    );
}
