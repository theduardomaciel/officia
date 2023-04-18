import React, { useState } from "react";

// Components
import Container, { BusinessScrollView } from "components/Container";
import Header from "components/Header";
import CatalogView, {
	updateMaterial,
	updateSubService,
} from "components/CatalogView";

// Bottom Sheet
import BottomSheet from "components/BottomSheet";

import MaterialForm from "components/ScheduleForm/Forms/MaterialForm";
import SubServiceForm from "components/ScheduleForm/Forms/SubserviceForm";

// Types
import type { SubServiceModel } from "database/models/subServiceModel";
import type { MaterialModel } from "database/models/materialModel";

export default function CatalogScreen() {
	const [editableData, setEditableData] = useState<
		SubServiceModel | MaterialModel | undefined
	>(undefined);

	return (
		<>
			<Container>
				<Header title="Catálogo" returnButton />
				<BusinessScrollView>
					<CatalogView
						onEdit={(subServiceToEdit, materialToEdit) => {
							if (subServiceToEdit) {
								setEditableData(subServiceToEdit);
								BottomSheet.expand("subServiceBottomSheet");
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

			<BottomSheet height={"62%"} id={"subServiceBottomSheet"}>
				<SubServiceForm
					editableData={editableData as SubServiceModel}
					onSubmitForm={(data: SubServiceModel) => {
						if (editableData) {
							updateSubService(
								editableData as SubServiceModel,
								data
							);
						}
					}}
				/>
			</BottomSheet>
		</>
	);
}
