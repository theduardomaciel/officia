import React, { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from 'react';

// Types
export type PaymentCondition = 'full' | 'installments' | 'agreement';
export type SplitMethod = 'percentage' | 'money';
export type RemainingValue = 'afterCompletion' | 'withInstallments'
export type WarrantyPeriod = 'days' | 'months' | 'years';

interface ScheduleFormContextProps {
    data: {
        // Section 1
        paymentCondition: PaymentCondition;
        splitMethod: SplitMethod | null;
        agreementInitialPercentage: string;
        agreementInitialValue: string;
        remainingValue: RemainingValue;
        installmentsAmount: string;
        checkedPaymentMethods: React.RefObject<[]>;
        warrantyPeriodType: WarrantyPeriod;
        warrantyPeriod: string;
    },
    setData: {
        // Section 1
        setPaymentCondition: Dispatch<SetStateAction<PaymentCondition>>;
        setSplitMethod: Dispatch<SetStateAction<SplitMethod | null>>;
        setAgreementInitialPercentage: Dispatch<SetStateAction<string>>;
        setAgreementInitialValue: Dispatch<SetStateAction<string>>;
        setRemainingValue: Dispatch<SetStateAction<RemainingValue>>;
        setInstallmentsAmount: Dispatch<SetStateAction<string>>;
        setWarrantyPeriodType: Dispatch<SetStateAction<WarrantyPeriod>>;
        setWarrantyPeriod: Dispatch<SetStateAction<string>>;
    }
}

const ScheduleFormContext = createContext<ScheduleFormContextProps>({} as ScheduleFormContextProps);

export function Section1ContextProvider({ children }: { children: React.ReactNode }) {
    // Section 1
    const [paymentCondition, setPaymentCondition] = useState<PaymentCondition>('full');
    const [splitMethod, setSplitMethod] = useState<SplitMethod | null>('percentage');

    const [agreementInitialPercentage, setAgreementInitialPercentage] = useState<string>("50");
    const [agreementInitialValue, setAgreementInitialValue] = useState<string>("0");

    const [remainingValue, setRemainingValue] = useState<RemainingValue>("afterCompletion");
    const [installmentsAmount, setInstallmentsAmount] = useState<string>("2x");

    const checkedPaymentMethods = React.useRef<[]>([]);

    const [warrantyPeriodType, setWarrantyPeriodType] = useState<WarrantyPeriod>('days');
    const [warrantyPeriod, setWarrantyPeriod] = useState<string>("30");

    const contextProps = /* useMemo(() => ( */{
        data: {
            paymentCondition, splitMethod,
            agreementInitialPercentage, agreementInitialValue,
            remainingValue, installmentsAmount,
            checkedPaymentMethods,
            warrantyPeriodType, warrantyPeriod
        },
        setData: {
            setPaymentCondition, setSplitMethod,
            setAgreementInitialPercentage, setAgreementInitialValue,
            setRemainingValue, setInstallmentsAmount,
            setWarrantyPeriodType, setWarrantyPeriod
        }
    }/* ), [
        paymentCondition, splitMethod,
        agreementInitialPercentage, agreementInitialValue,
        remainingValue, installmentsAmount,
        warrantyPeriodType, warrantyPeriod
    ]); */

    return (
        <ScheduleFormContext.Provider value={contextProps}>
            {children}
        </ScheduleFormContext.Provider>
    )
}

export function useScheduleFormSection1Context() {
    return useContext(ScheduleFormContext);
}