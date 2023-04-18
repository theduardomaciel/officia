// Types
import { ServiceModel } from 'database/models/serviceModel';
import { SubServiceModel } from 'database/models/subServiceModel';
import { MaterialModel } from 'database/models/materialModel';

export interface InvoiceSectionProps {
    onSubmit: () => void;
    isLoading?: boolean;
    service: ServiceModel;
    subServices?: SubServiceModel[];
    materials?: MaterialModel[];
}