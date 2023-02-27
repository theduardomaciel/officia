import { Control, FieldErrors } from "react-hook-form";
import { z } from 'zod';

export interface FormProps {
    control: Control<any>;
    errors: FieldErrors<any>;
}

/* ============ Form Validation */

export const basicInfoScheme = z.object({
    fantasyName: z.string().min(1, "O nome da empresa não pode ser vazio.").max(50, "O nome da empresa deve ter no máximo 50 caracteres."),
    juridicalPerson: z.string().min(18, "O CNPJ deve ter 14 dígitos.").min(1, "O CNPJ não pode estar vazio."),
    socialReason: z.string().min(1, "A razão social da empresa não pode ser vazia.").max(80, "A razão social deve ter no máximo 80 caracteres."),
});

export type BasicInfoSchemeType = z.infer<typeof basicInfoScheme>;

export const contactAndAddressScheme = z.object({
    email: z.string().email({ message: "O e-mail inserido não é válido." }),
    phone: z.string({ required_error: "O telefone não pode estar vazio." }).min(15, { message: "O telefone inserido não é válido." }),
    phone2: z.string().optional(),
    address: z.string().optional(),
    postalCode: z.string({ required_error: "O CEP não pode estar vazio." }).min(9, { message: "O CEP inserido não é válido." }),
});

export type ContactAndAddressSchemeType = z.infer<typeof contactAndAddressScheme>;

export const additionalInfoScheme = z.object({
    defaultMessage: z.string().optional(),
    defaultWarrantyDetails: z.string().optional(),
});

export type AdditionalInfoSchemeType = z.infer<typeof additionalInfoScheme>;

export type BusinessData = BasicInfoSchemeType & AdditionalInfoSchemeType & ContactAndAddressSchemeType & {
    logo?: string;
    geocodedAddress?: string;
    digitalSignatureUri?: string;
}