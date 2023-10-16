// Types
import { OrderModel } from "database/models/order.model";
import { ProductModel } from "database/models/product.model";
import { MaterialModel } from "database/models/material.model";

export interface InvoiceSectionProps {
	onSubmit: () => void;
	isLoading?: boolean;
	order: OrderModel;
	products?: ProductModel[];
	materials?: MaterialModel[];
}
