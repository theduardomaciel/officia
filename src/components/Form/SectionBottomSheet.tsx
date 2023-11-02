import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "global/colors";

import BottomSheet, { BottomSheetProps } from "components/BottomSheet";
import { memo } from "react";

interface Props extends BottomSheetProps {
    rowGap?: number;
}

function unmemorized_SectionBottomSheet({
    children,
    id,
    defaultValues = {
        expanded: false,
    },
    onDismissed,
    onExpanded,
    height = "76%",
    rowGap,
    ...rest
}: Props) {
    const insets = useSafeAreaInsets();

    console.log("RERENDER DO BOTTOM SHEET DA SEÇÃO");

    return (
        <BottomSheet
            id={id}
            suppressBackdrop={true}
            suppressHandle={true}
            suppressPortal={true}
            height={height}
            canDismiss={false}
            heightLimitBehaviour="contentHeight"
            colors={{
                background: colors.gray[500],
            }}
            defaultValues={defaultValues}
            {...rest}
        >
            <View
                className="flex flex-1"
                style={{
                    paddingTop: 24,
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12 + insets.bottom + 10,
                    rowGap: rowGap ?? 25,
                }}
            >
                {children}
            </View>
        </BottomSheet>
    );
}

const SectionBottomSheet = memo(unmemorized_SectionBottomSheet, () => true);

export default SectionBottomSheet;
