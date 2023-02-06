import { View } from 'react-native';

import BottomSheet from 'components/BottomSheet';

import colors from 'global/colors';

interface Props {
    children: React.ReactNode;
    bottomSheetRef: React.RefObject<any>;
    expanded?: boolean;
}

export default function ScheduleFormSection({ children, bottomSheetRef, expanded = false }: Props) {
    return (
        <BottomSheet
            ref={bottomSheetRef}
            defaultValues={{
                expanded: expanded,
                suppressBackdrop: true,
                suppressHandle: true,
                suppressPortal: true
            }}
            height={"76%"}
            canDismiss={false}
            heightLimitBehaviour="contentHeight"
            colors={{
                background: colors.gray[500],
            }}
        >
            <View
                className="flex flex-1"
                style={{
                    paddingTop: 24,
                    paddingLeft: 24,
                    paddingRight: 24,
                    paddingBottom: 12
                }}
            >
                {children}
            </View>
        </BottomSheet>
    )
}