import { useEffect, useState } from "react";
import { Text } from "react-native";

import colors from "global/colors";

// Components
import SearchBar from "components/SearchBar";
import Modal from "./Modal";
import { Preview, PreviewStatic } from "components/Preview";
import { SubSectionWrapper } from "components/ScheduleForm/SubSectionWrapper";
import { Empty } from "./StatusMessage";

// Database
import { database } from "database/index.native";
import { Q } from "@nozbe/watermelondb";

// Types
import type { MaterialModel } from "database/models/materialModel";
import type { SubServiceModel } from "database/models/subServiceModel";

interface Props {
	palette?: "dark";
	type?: "material" | "sub_service";
	onEdit?: (subService?: SubServiceModel, material?: MaterialModel) => void;
	onSelect?: (subService?: SubServiceModel, material?: MaterialModel) => void;
}

export default function CatalogView({
	onEdit,
	onSelect,
	type,
	palette,
}: Props) {
	const [materials, setMaterials] = useState<MaterialModel[]>([]);
	const [subServices, setSubServices] = useState<SubServiceModel[]>([]);

	const [itemToDelete, setItemToDelete] = useState<
		| undefined
		| {
				type: "material" | "sub_service";
				item: SubServiceModel | MaterialModel;
		  }
	>(undefined);

	useEffect(() => {
		async function getSavedItems() {
			await database
				.get<SubServiceModel>("sub_services")
				.query(Q.where("saved", true))
				.observe()
				.subscribe((subServices: SubServiceModel[]) => {
					setSubServices(subServices);
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

	async function deleteSubService(subService: SubServiceModel) {
		await subService.destroyPermanently();
	}

	async function deleteMaterial(material: MaterialModel) {
		await material.destroyPermanently();
	}

	const HAS_CONTENT = subServices.length > 0 || materials.length > 0;

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
					<SubSectionWrapper header={{ title: "Serviços" }}>
						{subServices && subServices.length > 0 ? (
							subServices.map((subService) =>
								onEdit ? (
									<Preview
										subService={subService}
										onEdit={() => onEdit(subService)}
										onDelete={() =>
											setItemToDelete({
												type: "sub_service",
												item: subService,
											})
										}
									/>
								) : (
									<PreviewStatic
										subService={subService}
										onPress={() =>
											onSelect && onSelect(subService)
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
					<SubSectionWrapper header={{ title: "Materiais" }}>
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
				message={`O ${
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
								deleteSubService(
									itemToDelete?.item as SubServiceModel
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

export async function updateSubService(
	oldSubService: SubServiceModel,
	subService: SubServiceModel
) {
	await database.write(async () => {
		await oldSubService.update((old) => {
			old.description = subService.description;
			old.details = subService.details;
			old.price = subService.price;
			old.amount = subService.amount;
			old.types = subService.types;
		});
	});
}

export async function toggleSubServiceBookmark(subService: SubServiceModel) {
	await database.write(async () => {
		await subService.update((old) => {
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
