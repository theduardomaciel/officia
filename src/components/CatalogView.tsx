import { useEffect, useState } from "react";
import { Text } from "react-native";

import colors from "global/colors";

// Components
import SearchBar from "components/SearchBar";
import Modal from "./Modal";
import { Preview, PreviewStatic } from "components/Preview";
import { SubSectionWrapper } from "components/Form/SectionWrapper";
import { Empty } from "./StatusMessage";

// Database
import { database } from "database/index.native";
import { Q } from "@nozbe/watermelondb";

// Types
import type { MaterialModel } from "database/models/material.model";
import type { ProductModel } from "database/models/product.model";

interface Props {
	palette?: "dark";
	type?: "material" | "sub_service";
	onEdit?: (product?: ProductModel, material?: MaterialModel) => void;
	onSelect?: (product?: ProductModel, material?: MaterialModel) => void;
}

export default function CatalogView({
	onEdit,
	onSelect,
	type,
	palette,
}: Props) {
	const [materials, setMaterials] = useState<MaterialModel[]>([]);
	const [products, setProducts] = useState<ProductModel[]>([]);

	const [itemToDelete, setItemToDelete] = useState<
		| undefined
		| {
				type: "material" | "sub_service";
				item: ProductModel | MaterialModel;
		  }
	>(undefined);

	useEffect(() => {
		async function getSavedItems() {
			await database
				.get<ProductModel>("orders")
				.query(Q.where("saved", true))
				.observe()
				.subscribe((products: ProductModel[]) => {
					setProducts(products);
				});

			await database
				.get<MaterialModel>("materials")
				.query(Q.where("saved", true))
				.observe()
				.subscribe((materials: MaterialModel[]) => {
					setMaterials(materials);
				});
		}
		getSavedItems();
	}, []);

	async function deleteProduct(product: ProductModel) {
		await product.destroyPermanently();
	}

	async function deleteMaterial(material: MaterialModel) {
		await material.destroyPermanently();
	}

	const HAS_CONTENT = products.length > 0 || materials.length > 0;

	return (
		<>
			<SearchBar palette={palette} />
			{onEdit && (
				<>
					<Text className="text-xs text-text-100 font-medium w-full text-center">
						Arraste para{" "}
						<Text className="text-primary">
							direita para editar
						</Text>{" "}
						e para{" "}
						<Text className="text-primary">
							esquerda para excluir
						</Text>
					</Text>
				</>
			)}

			{type === "sub_service" ||
				(!type && (
					<SubSectionWrapper headerProps={{ title: "Serviços" }}>
						{products && products.length > 0 ? (
							products.map((product) =>
								onEdit ? (
									<Preview
										product={product}
										onEdit={() => onEdit(product)}
										onDelete={() =>
											setItemToDelete({
												type: "sub_service",
												item: product,
											})
										}
									/>
								) : (
									<PreviewStatic
										product={product}
										onPress={() =>
											onSelect && onSelect(product)
										}
										hasBorder
									/>
								)
							)
						) : (
							<Text className="text-text-100 text-center w-full">
								Nenhum serviço salvo no catálogo
							</Text>
						)}
					</SubSectionWrapper>
				))}

			{type === "material" ||
				(!type && (
					<SubSectionWrapper headerProps={{ title: "Materiais" }}>
						{materials && materials.length > 0 ? (
							materials.map((material) =>
								onEdit ? (
									<Preview
										material={material}
										onEdit={() =>
											onEdit(undefined, material)
										}
										onDelete={() =>
											setItemToDelete({
												type: "material",
												item: material,
											})
										}
									/>
								) : (
									<PreviewStatic
										material={material}
										onPress={() =>
											onSelect &&
											onSelect(undefined, material)
										}
									/>
								)
							)
						) : (
							<Text className="text-text-100 text-center w-full">
								Nenhum material salvo no catálogo
							</Text>
						)}
					</SubSectionWrapper>
				))}

			<Modal
				isVisible={itemToDelete !== undefined}
				toggleVisibility={() => setItemToDelete(undefined)}
				title={"Você tem certeza?"}
				description={`O ${
					itemToDelete?.type === "material" ? "material" : "serviço"
				} selecionado será apagado permanentemente. Essa ação não pode ser desfeita.`}
				icon="delete"
				buttons={[
					{
						label: "Remover",
						onPress: () => {
							if (itemToDelete?.type === "material") {
								deleteMaterial(
									itemToDelete?.item as MaterialModel
								);
							} else {
								deleteProduct(
									itemToDelete?.item as ProductModel
								);
							}
						},
						color: colors.red,
						closeOnPress: true,
					},
				]}
				cancelButton
			/>
		</>
	);
}

export async function updateMaterial(
	oldMaterial: MaterialModel,
	material: MaterialModel
) {
	await database.write(async () => {
		await oldMaterial.update((old) => {
			old.name = material.name;
			old.description = material.description;
			old.price = material.price;
			old.amount = material.amount;
			old.profitMargin = material.profitMargin;
			old.availability = material.availability;
			old.image_url = material.image_url;
		});
	});
}

export async function updateProduct(
	oldProduct: ProductModel,
	product: ProductModel
) {
	await database.write(async () => {
		await oldProduct.update((old) => {
			old.description = product.description;
			old.details = product.details;
			old.price = product.price;
			old.amount = product.amount;
			old.types = product.types;
		});
	});
}

export async function toggleProductBookmark(product: ProductModel) {
	await database.write(async () => {
		await product.update((old) => {
			old.saved = !old.saved;
		});
	});
}

export async function toggleMaterialBookmark(material: MaterialModel) {
	await database.write(async () => {
		await material.update((old) => {
			old.saved = !old.saved;
		});
	});
}
