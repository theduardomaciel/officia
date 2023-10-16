// Types
import type { CalendarDate } from "components/Calendar";
import type { MaterialModel } from "database/models/material.model";
import type { ProductModel } from "database/models/product.model";

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
export type PaymentCondition = "full" | "card" | "agreement";
export type SplitMethod = "percentage" | "money";
export type RemainingValue = "afterCompletion" | "withInstallments";
export type WarrantyPeriod = "days" | "months" | "years";

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
