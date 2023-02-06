import React, { useState } from 'react';
import { View, Text } from "react-native";

import { useColorScheme } from 'nativewind';
import colors from 'global/colors';

// Components
import SectionBottomSheet from '../SectionBottomSheet';
import { MARGIN, NextButton, Section, SubSection, SubSectionWrapper } from '../SubSectionWrapper';
import ToggleGroup from 'components/ToggleGroup';

// Types
type PaymentMethod = 'full' | 'installments' | 'agreement';

export default function Section1({ bottomSheetRef, updateHandler }: Section) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('full');

    return (
        <SectionBottomSheet bottomSheetRef={bottomSheetRef}>
            <Text>

            </Text>

            <NextButton section={1} updateHandler={updateHandler} />
        </SectionBottomSheet>
    )
}