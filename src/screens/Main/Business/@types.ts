import { Control, FieldErrors } from "react-hook-form";
import { z } from "zod";

export interface FormProps {
	control: Control<any>;
	setValue?: (name: any, value: any) => void;
	errors: FieldErrors<any>;
}

/* ============ Form Validation */

export const basicInfoScheme = z.object({
	fantasyName: z
		.string({ required_error: "O nome da empresa deve ser informado." })
		.max(50, "O nome da empresa deve ter no máximo 50 caracteres."),
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
	socialReason: z
		.string({
			required_error: "A razão social da empresa deve ser informada.",
		})
		.max(80, "A razão social deve ter no máximo 80 caracteres."),
});

export type BasicInfoSchemeType = z.infer<typeof basicInfoScheme>;

/*  */

export const additionalInfoScheme = z.object({
	defaultMessage: z.string().optional(),
	defaultWarrantyDetails: z.string().optional(),
});

export type AdditionalInfoSchemeType = z.infer<typeof additionalInfoScheme>;

/*  */

export const contactAndAddressScheme = z.object({
	email: z
		.string({ required_error: "O e-mail inserido não é válido." })
		.email({ message: "O e-mail inserido não é válido." }),
	phone: z
		.string({ required_error: "O telefone não pode estar vazio." })
		.min(15, { message: "O telefone inserido não é válido." }),
	phone2: z.string().optional(),
	address: z.string().optional(),
	postalCode: z
		.string({ required_error: "O CEP não pode estar vazio." })
		.min(9, { message: "O CEP inserido não é válido." }),
});

export type ContactAndAddressSchemeType = z.infer<
	typeof contactAndAddressScheme
>;

/*  */

export const bankAccountScheme = z.object({
	agency: z.string().optional(),
	account: z.string().optional(),
	accountHolder: z.string().optional(),
	pixKey: z.string().optional(),
});

export type BankAccountSchemeType = z.infer<typeof bankAccountScheme>;

/*  */

export const socialMediaScheme = z.object({
	site: z.string().optional(),
	facebook: z.string().optional(),
	instagram: z.string().optional(),
	twitter: z.string().optional(),
	whatsAppBusiness: z.string().optional(),
	youtube: z.string().optional(),
	tiktok: z.string().optional(),
});

export type SocialMediaSchemeType = z.infer<typeof socialMediaScheme>;

/*  */

export type Category = {
	id: string;
	name: string;
	icon: string;
	color: string;
};

export type BusinessData = BasicInfoSchemeType &
	AdditionalInfoSchemeType &
	ContactAndAddressSchemeType &
	BankAccountSchemeType &
	SocialMediaSchemeType & {
		logo?: string;
		geocodedAddress?: string;
		digitalSignatureUri?: string;
		bank?: string;
		bankPixType?: string;
		bankAccountType?: string;
		categories?: Category[];
		invoiceUri?: string;
		documentsColor?: string;
	};
