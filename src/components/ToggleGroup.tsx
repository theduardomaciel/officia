import { useState } from "react";
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import Input from "./Input";

interface Props {
    data: {
        label: string;
        value: string;
    }[];
    initialSelected?: string;
    manualValue?: {
        placeholder: string;
        onChange: (value: string) => void;
    };
    onSelectedChange: (value: string) => void;
}

export default function ToggleGroup({ data, initialSelected, manualValue, onSelectedChange }: Props) {
    const [selected, setSelected] = useState<string>(initialSelected ?? data[0].value);

    return (
        <View className="flex-row w-full items-center justify-between">
            {
                data.map((item, index) => (
                    <TouchableOpacity
                        activeOpacity={0.6}
                        key={index}
                        onPress={() => {
                            setSelected(item.value);
                            onSelectedChange(item.value);
                        }}
                        className="flex flex-1 flex-row items-center justify-center py-4 bg-black dark:bg-gray-300 border-opacity-40 rounded-md border-primary-green"
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
            {
                manualValue && (
                    <Input
                        placeholder={manualValue.placeholder}
                        onChangeText={manualValue.onChange}
                        style={{
                            paddingHorizontal: 0,
                            flex: 1,
                        }}
                    />
                )
            }
        </View>
    )
}