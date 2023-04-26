import React, { useState } from "react";

// Components
import Container, { BusinessScrollView } from "components/Container";
import Header from "components/Header";
import CatalogView, {
	updateMaterial,
	updateProduct,
} from "components/CatalogView";

// Bottom Sheet
import BottomSheet from "components/BottomSheet";

import MaterialForm from "components/ScheduleForm/Forms/MaterialForm";
import ProductForm from "components/ScheduleForm/Forms/SubserviceForm";

// Types
import type { ProductModel } from "database/models/productModel";
import type { MaterialModel } from "database/models/materialModel";

export default function CatalogScreen() {
	const [editableData, setEditableData] = useState<
		ProductModel | MaterialModel | undefined
	>(undefined);

	return (
		<>
			<Container>
				<Header title="Catálogo" returnButton />
				<BusinessScrollView>
					<CatalogView
						onEdit={(subOrderToEdit, materialToEdit) => {
							if (subOrderToEdit) {
								setEditableData(subOrderToEdit);
								BottomSheet.expand("subOrderBottomSheet");
							} else if (materialToEdit) {
								setEditableData(materialToEdit);
								BottomSheet.expand("materialBottomSheet");
							}
						}}
					/>
				</BusinessScrollView>
			</Container>

			<BottomSheet height={"78%"} id={"materialBottomSheet"}>
				<MaterialForm
					editableData={editableData as MaterialModel}
					onSubmitForm={(data: MaterialModel) => {
						if (editableData) {
							updateMaterial(editableData as MaterialModel, data);
						}
					}}
				/>
			</BottomSheet>

			<BottomSheet height={"62%"} id={"subOrderBottomSheet"}>
				<ProductForm
					editableData={editableData as ProductModel}
					onSubmitForm={(data: ProductModel) => {
						if (editableData) {
							updateProduct(editableData as ProductModel, data);
						}
					}}
				/>
			</BottomSheet>
		</>
	);
}
