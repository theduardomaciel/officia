import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from "react";
import clsx from "clsx";

import { Text, LayoutAnimation, View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "global/colors";

import { Category } from "screens/Main/Business/@types";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type PartialCategory = PartialBy<Category, "icon" | "color"> & {
	onPress?: () => void;
};

export type TagObject = PartialCategory & {
	checked?: boolean;
};

type TagSectionProps = {
	tags: Array<PartialCategory>;
	uniqueSelection?: boolean;
	insertPaddingRight?: boolean;
	pallette?: "dark";
	height?: number;
	onSelectTags?: (tags: TagObject[]) => void;
	onClear?: () => void;
};

interface TagProps extends TagObject {
	children?: React.ReactNode;
	pallette?: TagSectionProps["pallette"];
}

export const Tag = ({
	onPress,
	children,
	pallette,
	checked,
	icon,
	name,
	color,
}: TagProps) => {
	const { colorScheme } = useColorScheme();

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={onPress ? 0.75 : 1}
			className={clsx(
				"bg-black dark:bg-gray-200 rounded-full h-full flex-row px-4 py-1 mr-2 items-center justify-center",
				{
					"bg-black dark:bg-gray-300 border border-text-200":
						pallette === "dark",
				}
			)}
			style={{
				...(checked && {
					borderWidth: 1,
					borderLeftColor: color || colors.gray[300],
					borderRightColor: color || colors.gray[300],
					borderTopColor: color || colors.gray[300],
					borderBottomColor: color || colors.gray[300],
				}),
				columnGap: 5,
			}}
		>
			{icon && (
				<MaterialIcons
					name={icon as unknown as any}
					size={16}
					color={
						colorScheme === "dark" ? colors.text[100] : colors.white
					}
				/>
			)}
			<Text className="text-white dark:text-text-100 text-sm text-center ml-1">
				{name}
			</Text>
			{children}
		</TouchableOpacity>
	);
};

export interface TagsSelectorRef {
	clearTags: () => void;
	setTags: (newTags: TagObject[]) => void;
}

export const TagsSelector = forwardRef(
	(
		{
			tags,
			uniqueSelection,
			onClear,
			onSelectTags,
			insertPaddingRight,
			pallette,
			height,
		}: TagSectionProps,
		ref
	) => {
		const { colorScheme } = useColorScheme();
		const [sectionData, setSectionData] = useState<TagObject[]>(tags);

		useImperativeHandle(
			ref,
			() => ({
				clearTags: () => {
					setSectionData(
						tags.map((tag) => ({ ...tag, checked: false }))
					);
				},
				setTags: (newTags: TagObject[]) => {
					setSectionData(newTags);
				},
			}),
			[tags]
		);

		function updateTagsData(updatedSectionData: TagObject[]) {
			const checkedData = [...updatedSectionData].filter(
				(tag) => tag.checked
			);
			const uncheckedData = [...updatedSectionData].filter(
				(tag) => !tag.checked
			);
			const sortedData = checkedData.concat(uncheckedData);
			setSectionData(sortedData);
		}

		const renderItem = ({
			item,
			index,
		}: {
			item: TagObject;
			index: number;
		}) => (
			<View className="h-full">
				<Tag
					key={item.id}
					pallette={pallette}
					{...item}
					onPress={
						item.onPress
							? item.onPress
							: () => {
									let updatedSectionData = sectionData;

									if (uniqueSelection) {
										updatedSectionData = [
											...sectionData,
										].map((tag) => {
											// Fazemos essa verificação para que seja possível remover a seleção dos outros items
											if (tag.id !== item.id) {
												tag.checked = false;
											}
											return tag;
										});
									}
									updatedSectionData.find(
										(tag) => tag.id === item.id
									)!.checked = !item.checked;

									LayoutAnimation.configureNext(
										LayoutAnimation.Presets.easeInEaseOut
									);

									onSelectTags &&
										onSelectTags(
											updatedSectionData.filter(
												(tag) => tag.checked === true
											)
										); // Passa os dados atualizados para o componente pai
									updateTagsData(updatedSectionData); // Atualiza os dados do componente
							  }
					}
				>
					{(!uniqueSelection ||
						(uniqueSelection && item.checked)) && (
						<MaterialIcons
							name={
								onClear
									? "expand-more"
									: uniqueSelection && item.checked
									? "check"
									: !uniqueSelection && item.checked
									? "remove"
									: "add"
							}
							size={18}
							color={
								colorScheme === "dark"
									? colors.text[100]
									: colors.white
							}
						/>
					)}
				</Tag>
			</View>
		);

		return (
			<FlatList
				style={{ flex: 1, zIndex: 5 }}
				contentContainerStyle={[
					{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						paddingRight: insertPaddingRight ? 48 : 0,
					},
					height ? { height: height } : { height: "100%" },
				]}
				ListFooterComponent={
					onClear ? (
						<TouchableOpacity className="flex items-center justify-center mr-4">
							<Text className="text-black dark:text-text-100 text-sm text-center ml-1 alice">
								Limpar
							</Text>
						</TouchableOpacity>
					) : (
						<></>
					)
				}
				horizontal
				showsHorizontalScrollIndicator={false}
				data={sectionData}
				renderItem={renderItem}
				keyExtractor={(item, index) => item.id ?? index.toString()}
			/>
		);
	}
);
