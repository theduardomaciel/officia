import { Control, FieldErrors } from "react-hook-form";

export interface FormProps {
    control: Control<any>;
    errors: FieldErrors<any>;
}