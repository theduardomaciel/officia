import React, { useState } from "react";

// Components
import Container, { ContainerScrollView } from "components/Container";
import Header from "components/Header";
import CatalogView, {
    updateMaterial,
    updateProduct,
} from "components/CatalogView";

// Bottom Sheet
import BottomSheet from "components/BottomSheet";

import MaterialForm from "screens/ScheduleForm/Forms/MaterialForm";
import ProductForm from "screens/ScheduleForm/Forms/ProductForm";

// Types
import type { ProductModel } from "database/models/product.model";
import type { MaterialModel } from "database/models/material.model";

export default function CatalogScreen() {
    const [editableData, setEditableData] = useState<
        ProductModel | MaterialModel | undefined
    >(undefined);

    return (
        <>
            <Container>
                <Header title="Catálogo" returnButton />
                <ContainerScrollView>
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
                </ContainerScrollView>
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
