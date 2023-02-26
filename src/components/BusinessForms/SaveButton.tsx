import { KeyboardAvoidingView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

interface Props {
    hasDifferences: boolean;
    submitData: () => void;
}

export default function SaveButton({ hasDifferences, submitData }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <KeyboardAvoidingView behavior="position" enabled>
            <TouchableOpacity
                className='absolute w-14 h-14 rounded-full right-1 items-center justify-center'
                activeOpacity={hasDifferences ? 0.7 : 1}
                disabled={!hasDifferences}
                onPress={submitData}
                style={{
                    bottom: insets.bottom + 15,
                    backgroundColor: hasDifferences ? colors.primary.green : colors.text[200],
                    opacity: hasDifferences ? 1 : 0.5
                }}
            >
                <MaterialIcons name="save" size={28} color={colors.white} />
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}