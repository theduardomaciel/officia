import { z } from "zod";

export interface FormRef {
	submitForm: () => Promise<unknown>;
	getFormWatch?: () => any;
}

export interface FormProps {
	onStateChange?: (states: any[]) => void;
	onSubmit: (data: Partial<BusinessData>) => void;
	palette?: "dark";
}

/* ============ Form Validation */

export const refineJuridicalPerson = (value: string | undefined) => {
	if (value && value.length > 1 && value.length < 18) {
		return false;
	} else {
		return true;
	}
};

export const basicInfoScheme = z.object({
	name: z
		.string({ required_error: "O nome da empresa deve ser informado." })
		.max(50, "O nome da empresa deve ter no máximo 50 caracteres."),
	socialReason: z
		.string({
			required_error: "A razão social da empresa deve ser informada.",
		})
		.max(80, "A razão social deve ter no máximo 80 caracteres.")
		.optional(),
	juridicalPerson: z.string().optional().refine(refineJuridicalPerson, {
		message: "O CNPJ inserido não é válido.",
	}),
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

export const serviceScheme = z.object({
	manualBusyAmount: z.string().optional(),
	manualUnavailableAmount: z.string().optional(),
});

export type ServiceSchemeInputsType = z.infer<typeof serviceScheme>;

export type BusinessModel = "in_person" | "delivery" | "online";

export interface ServiceSchemeType extends ServiceSchemeInputsType {
	serviceZoneCountries: string[];
	serviceZoneStates: string[];
	serviceZoneCities: string[];
	businessModels?: BusinessModel[];
	agenda?: string[]; //
	autoHolidayUnavailability?: boolean;
	busyAmount: number;
	unavailableAmount: number;
}

export type ProjectObject = [
	BusinessData,
	React.Dispatch<React.SetStateAction<BusinessData>>
];

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

export type BusinessData = { id: string } & BasicInfoSchemeType &
	AdditionalInfoSchemeType &
	ServiceSchemeType &
	ContactSchemeType &
	BrandingSchemeType &
	AddressSchemeType &
	PaymentsSchemeType & {
		categories: Category[];
	};
