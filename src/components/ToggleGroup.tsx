import React, { Dispatch, forwardRef, memo, SetStateAction, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View, Text, TextInput, TextInputProps } from "react-native";

import colors from "global/colors";

import Input from "./Input";
import { Controller } from "react-hook-form";

interface ToggleProps {
    item: {
        label: string;
        value: string;
    };
    updateState: Dispatch<SetStateAction<any>> | (() => void);
    applyMarginRight?: boolean;
    isSelected?: boolean;
};

function Toggle({ item, updateState, isSelected, applyMarginRight }: ToggleProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => updateState(item.value)}
            className="flex flex-1 flex-row items-center justify-center py-4 bg-black dark:bg-gray-300 border-opacity-40 rounded-lg border-primary-green"
            style={{
                borderWidth: isSelected ? 1 : 0,
                marginRight: applyMarginRight ? 10 : 0,
            }}
        >
            <Text className='text-sm text-center text-white' style={{
                fontWeight: isSelected ? "600" : "400",
            }}>
                {item.label}
            </Text>
        </TouchableOpacity>
    )
}

interface DataProps {
    label: string;
    value: string;
}

interface ToggleGroupProps {
    data: DataProps[];
    selected: string | null;
    updateState: (value: any) => void;
    children?: React.ReactNode;
}

const ToggleGroup = React.memo(({ data, selected, updateState, children }: ToggleGroupProps) => {
    return (
        <View className="flex-row w-full items-center justify-between">
            <View className="flex-row items-center justify-between flex-1">
                {
                    data.map((item, index) => (
                        <Toggle
                            key={index.toString()}
                            item={item}
                            updateState={updateState}
                            isSelected={selected === item.value}
                            applyMarginRight={index !== data.length - 1}
                        />
                    ))
                }
            </View>
            {children}
        </View>
    )
});

export default ToggleGroup;

interface ToggleGroupWithManualValueProps {
    data: DataProps[];
    selected: string | null;
    setSelected: (value: any) => void;
    control: any;
    manualValue?: {
        inputProps: TextInputProps;
        maxValue?: number;
        unit?: {
            label: string;
            position: "start" | "end";
        };
    };
    defaultValue?: string;
    name: string;
}

export const ToggleGroupWithManualValue = memo(({ data, selected, setSelected, control, manualValue, name }: ToggleGroupWithManualValueProps) => {
    const inputRef = useRef<TextInput>(null); // usamos o useRef para acessar o input manualmente, removendo o foco ao apertar em outro botão

    /* useEffect(() => {
        if (selected === null) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 10);
        }
    }, [selected]) */

    return (
        <View className="flex-row w-full items-center justify-between" key={`${name}_container`}>
            <View className="flex-row items-center justify-between flex-1" key={`${name}_toggleContainer`}>
                {
                    data.map((item, index) => (
                        <Toggle
                            key={index.toString()}
                            item={item}
                            updateState={(value) => {
                                setSelected(value)
                                inputRef.current?.blur();
                            }}
                            isSelected={selected === item.value}
                            applyMarginRight={index !== data.length - 1 || (manualValue ? true : false)}
                        />
                    ))
                }
            </View>
            {
                manualValue && (
                    <View key={`${name}_container`} className="flex flex-1">
                        <Controller
                            key={`${name}_controller`}
                            control={control}
                            name={name}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    key={`${name}_input`}
                                    value={value}
                                    onChangeText={onChange}
                                    onFocus={() => {
                                        setSelected(null)
                                        if (manualValue.unit && value) {
                                            const replacedValue = value.replaceAll(manualValue.unit.label, "");
                                            onChange(replacedValue);
                                        }
                                    }}
                                    onBlur={() => {
                                        onBlur();
                                        const reducedValue = manualValue.maxValue && parseInt(value) > manualValue.maxValue ? manualValue.maxValue.toString() : value;
                                        if (manualValue.unit) {
                                            onChange(`${manualValue.unit && manualValue.unit.position === "start" ? manualValue.unit.label : ""}${reducedValue}${manualValue.unit && manualValue.unit.position === "end" ? manualValue.unit.label : ""}`)
                                        }
                                    }}
                                    ref={inputRef}
                                    pallette='dark'
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
                                    required
                                />
                            )}
                            rules={{ required: true }}
                        />
                    </View>
                )
            }
        </View>
    )
});