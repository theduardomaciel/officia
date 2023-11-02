// Types
import type { CalendarDate } from "components/Calendar";
import type { MaterialModel } from "database/models/material.model";
import type { ProductModel } from "database/models/product.model";
import type { OrderModel } from "database/models/order.model";

export interface SectionProps {
    initialValue?: Partial<OrderModel>;
    updateHandler: (id: number) => void;
}

export interface Section0Props {
    name: string;
    products: ProductModel[];
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
export type PaymentCondition = "FULL" | "INSTALLMENTS" | "AGREEMENT";
export type SplitMethod = "PERCENTAGE" | "MONEY";
export type RemainingValue = "AFTER_COMPLETION" | "WITH_INSTALLMENTS";
export type WarrantyPeriod = "DAYS" | "MONTHS" | "YEARS";

export interface Section1Props {
    paymentCondition: PaymentCondition;
    checkedPaymentMethods: string[];
    splitValue?: string;
    splitRemaining?: string;
    warrantyDays: number;
    warrantyDetails?: string;
}

export interface Section1RefProps {
    getData: () => Section1Props;
}

export const SECTION_PREFIX = "scheduleFormSectionBottomSheet_";
