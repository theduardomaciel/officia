// Types
import { OrderModel } from "database/models/orderModel";
import { ProductModel } from "database/models/productModel";
import { MaterialModel } from "database/models/materialModel";

export interface InvoiceSectionProps {
	onSubmit: () => void;
	isLoading?: boolean;
	order: OrderModel;
	products?: ProductModel[];
	materials?: MaterialModel[];
}
