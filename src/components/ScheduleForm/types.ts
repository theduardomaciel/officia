// Types
import type { CalendarDate } from 'components/Calendar';
import type { MaterialModel } from 'database/models/materialModel';
import type { SubServiceModel } from 'database/models/subServiceModel';
import { Dispatch, SetStateAction } from 'react';

export interface Section0Props {
    data: {
        // Section 0
        name: string;
        subServices: SubServiceModel[];
        date: CalendarDate | undefined;
        time: Date;
        additionalInfo: string;
        materials: MaterialModel[];
    },
    setData: {
        // Section 0
        setName: Dispatch<SetStateAction<string>>;
        setSubServices: Dispatch<SetStateAction<SubServiceModel[]>>;
        setDate: Dispatch<SetStateAction<CalendarDate | undefined>>;
        setTime: Dispatch<SetStateAction<Date>>;
        setAdditionalInfo: Dispatch<SetStateAction<string>>;
        setMaterials: Dispatch<SetStateAction<MaterialModel[]>>;
    }
}

// Types
export type PaymentCondition = 'full' | 'installments' | 'agreement';
export type SplitMethod = 'percentage' | 'money';
export type RemainingValue = 'afterCompletion' | 'withInstallments'
export type WarrantyPeriod = 'days' | 'months' | 'years';

export interface Section1Props {
    data: {
        // Section 1
        paymentCondition: PaymentCondition;
        splitMethod: SplitMethod | null;
        agreementInitialPercentage: string;
        agreementInitialValue: string;
        remainingValue: RemainingValue;
        installmentsAmount: string;
        checkedPaymentMethods: string[];
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
        setCheckedPaymentMethods: Dispatch<SetStateAction<string[]>>
        setInstallmentsAmount: Dispatch<SetStateAction<string>>;
        setWarrantyPeriodType: Dispatch<SetStateAction<WarrantyPeriod>>;
        setWarrantyPeriod: Dispatch<SetStateAction<string>>;
    }
}