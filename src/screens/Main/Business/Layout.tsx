import React, { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";

// Components
import Container from "components/Container";
import Header from "components/Header";
import Toast from "components/Toast";
import SaveButton from "components/Business/SaveButton";
import ConfirmExitModal from "components/Business/ConfirmExitModal";

// Hooks
import { useNavigation } from "@react-navigation/native";

// Types
import type { BusinessData } from "./@types";
import type { SubSectionWrapperProps } from "components/ScheduleForm/SubSectionWrapper";

interface Props {
    headerProps: SubSectionWrapperProps['header'];
    children: React.ReactNode;
    hasDifferences: boolean;
    submitData: () => void;
}

interface ChangesObserverProps {
    children: React.ReactNode;
    setHasDifferences: React.Dispatch<React.SetStateAction<boolean>>;
    watch: (callback: (value: any) => void) => { unsubscribe: () => void };
    currentData: Partial<BusinessData>;
}

export function ChangesObserver({ children, watch, currentData, setHasDifferences }: ChangesObserverProps) {
    useEffect(() => {
        const subscription = watch((value) => {
            console.log('value', value)
            console.log('currentData', currentData)
            setHasDifferences(JSON.stringify(currentData) !== JSON.stringify(value))
        });
        return () => subscription.unsubscribe();
    }, [watch, currentData]);

    return (
        <>
            {children}
        </>
    )
}

export default function BusinessLayout({ headerProps, children, hasDifferences, submitData }: Props) {
    const navigation = useNavigation();
    const [isConfirmExitModalVisible, setConfirmExitModalVisible] = React.useState(false);

    const backAction = useCallback(() => {
        if (hasDifferences) {
            setConfirmExitModalVisible(true);
            return true;
        } else {
            return false;
        }
    }, [hasDifferences])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [hasDifferences]);

    return (
        <Container>
            <Header
                returnButton={() => {
                    if (hasDifferences) {
                        setConfirmExitModalVisible(true);
                    } else {
                        navigation.goBack();
                    }
                }}
                {...headerProps}
            />
            {children}
            <SaveButton hasDifferences={hasDifferences} submitData={submitData} />
            <Toast
                toastPosition='top'
                toastOffset='14%'
                autoDismissDelay={3000}
            />
            <ConfirmExitModal
                isVisible={isConfirmExitModalVisible}
                toggleVisibility={() => setConfirmExitModalVisible(false)}
                onExitConfirmation={() => {
                    navigation.goBack();
                }}
            />
        </Container>
    )
}