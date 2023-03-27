import { TextInput, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

interface Props {
    placeholder: string;
    onSubmit?: () => void;
}

export default function SearchBar({ placeholder, onSubmit }: Props) {
    return (
        <View className="flex flex-row w-full h-10" style={{ position: "relative" }}>
            <TextInput
                className="flex flex-1 flex-row bg-gray-200 p-2 rounded-lg pl-12 text-text-100"
                onSubmitEditing={onSubmit}
                placeholderTextColor={colors.text[200]}
                cursorColor={colors.primary.green}
                placeholder={placeholder}
            />
            <MaterialIcons
                name="search"
                style={{ position: "absolute", top: 10, left: 15 }}
                size={18}
                color={colors.text[100]}
            />
        </View>
    )
}