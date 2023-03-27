// Types
import type { CalendarDate } from 'components/Calendar';
import type { MaterialModel } from 'database/models/materialModel';
import type { SubServiceModel } from 'database/models/subServiceModel';

export interface Section0Props {
    name: string;
    subServices: SubServiceModel[];
    date: CalendarDate;
    discount: number;
    time: Date | undefined;
    additionalInfo: string;
    materials: MaterialModel[];
}

export interface Section0RefProps {
    getData: () => Section0Props;
}

// Types
export type PaymentCondition = 'full' | 'installments' | 'agreement';
export type SplitMethod = 'percentage' | 'money';
export type RemainingValue = 'afterCompletion' | 'withInstallments'
export type WarrantyPeriod = 'days' | 'months' | 'years';

export interface Section1Props {
    checkedPaymentMethods: string[];
    agreement: {
        splitMethod: SplitMethod;
        agreementInitialValue: string; // pode ser 'half', incluir porcentagem ou ser um número representando o valor
        remainingValue: RemainingValue;
    } | undefined;
    installments: number | undefined;
    warrantyDays: number;
    warrantyDetails: string;
}

export interface Section1RefProps {
    getData: () => Section1Props;
}