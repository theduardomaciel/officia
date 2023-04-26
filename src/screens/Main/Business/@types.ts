import { z } from "zod";

export interface FormProps {
	onSubmit: (data: any) => void;
	onChange?: (data: any) => void;
	defaultValues?: Partial<BusinessData>;
}

/* ============ Form Validation */

export const basicInfoScheme = z.object({
	name: z
		.string({ required_error: "O nome da empresa deve ser informado." })
		.max(50, "O nome da empresa deve ter no máximo 50 caracteres."),
	socialReason: z
		.string({
			required_error: "A razão social da empresa deve ser informada.",
		})
		.max(80, "A razão social deve ter no máximo 80 caracteres."),
	juridicalPerson: z
		.string()
		.optional()
		.refine(
			(value) => {
				if (value && value.length > 1 && value.length < 18) {
					return false;
				} else {
					return true;
				}
			},
			{ message: "O CNPJ inserido não é válido." }
		),
});

type BasicInfoSchemeInputsType = z.infer<typeof basicInfoScheme>;

export interface BasicInfoSchemeType extends BasicInfoSchemeInputsType {
	segments: string[];
}

/*  */

export const additionalInfoScheme = z.object({
	defaultMessage: z.string().optional(),
	defaultWarrantyDetails: z.string().optional(),
});

type AdditionalInfoSchemeInputsType = z.infer<typeof additionalInfoScheme>;

export interface AdditionalInfoSchemeType
	extends AdditionalInfoSchemeInputsType {
	defaultOrderString: "service" | "order";
	defaultProductString: "service" | "product";
	digitalSignature_url?: string;
}

/*  */

type DAYS =
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday"
	| "sunday";

export const serviceScheme = z.object({
	businessModel: z.string().optional(),
	agenda: z
		.string()
		.optional()
		.default("sunday,monday,tuesday,wednesday,thursday,friday,saturday"),
	autoHolidayUnavailability: z.boolean().default(false).optional(),
	busyAmount: z.number().default(1).optional(),
	unavailableAmount: z.number().default(3).optional(),
	serviceZoneCountries: z.string().optional(),
	serviceZoneStates: z.string().optional(),
	serviceZoneCities: z.string().optional(),
});

export type OrderSchemeType = z.infer<typeof serviceScheme>;

/*  */

export const contactScheme = z.object({
	email: z
		.string({ required_error: "O e-mail inserido não é válido." })
		.email({ message: "O e-mail inserido não é válido." }),
	phone1: z
		.string({ required_error: "O telefone não pode estar vazio." })
		.min(15, { message: "O telefone inserido não é válido." }),
	phone2: z.string().optional(),
	website: z.string().optional(),
	socialMedia: z.string().optional(),
});

export type ContactSchemeType = z.infer<typeof contactScheme>;

/*  */

export const brandingScheme = z.object({
	logo_url: z.string().optional(),
	banner_url: z.string().optional(),
	primaryColor: z.string().optional(),
	secondaryColor: z.string().optional(),
	marketplaceData: z.string().optional(),
});

export type BrandingSchemeType = z.infer<typeof brandingScheme>;

/*  */

export const addressScheme = z.object({
	address: z.string().optional(),
});

export type AddressSchemeType = z.infer<typeof addressScheme>;

/*  */

export const paymentsScheme = z.object({
	defaultPaymentMethods: z.string().optional(),
	currency: z.string().optional(),
	bankAccount: z.string().optional(),
	pix: z.string().optional(),
});

export type PaymentsSchemeType = z.infer<typeof paymentsScheme>;

/*  */

export type Category = {
	id: string;
	name: string;
	icon: string;
	color: string;
};

export type BusinessData = BasicInfoSchemeType &
	AdditionalInfoSchemeType &
	OrderSchemeType &
	ContactSchemeType &
	BrandingSchemeType &
	AddressSchemeType &
	PaymentsSchemeType & {
		categories: Category[];
	};
