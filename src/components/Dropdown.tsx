import React, { useCallback, useId, useImperativeHandle, useRef } from "react";
import {
	TouchableOpacity,
	TouchableOpacityProps,
	View,
	Text,
	Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlatList } from "react-native-gesture-handler";

import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";

import colors from "global/colors";
import clsx from "clsx";

import Label from "./Label";
import BottomSheet from "./BottomSheet/index";
import { runOnUI } from "react-native-reanimated";
import CustomBackdrop from "./BottomSheet/CustomBackdrop";

export type DropdownData = {
	label: string;
	value: string;
	icon?: string;
};

interface Props extends TouchableOpacityProps {
	label?: string;
	description?: string;
	overDragAmount?: number;
	data: DropdownData[];
	pallette?: "dark";
	bottomSheetHeight?: string;
	bottomSheetLabel?: string;
	closeOnSelect?: boolean;
	selected: string;
	setSelected: (value: string) => void;
}

const Dropdown = React.forwardRef(
	(
		{
			label,
			description,
			bottomSheetLabel,
			overDragAmount,
			data,
			bottomSheetHeight,
			pallette,
			selected,
			closeOnSelect = true,
			setSelected,
			...rest
		}: Props,
		ref
	) => {
		const { colorScheme } = useColorScheme();
		const id = useId();

		const openHandler = useCallback(() => {
			BottomSheet.expand(id);
		}, []);

		const closeHandler = useCallback(() => {
			BottomSheet.close(id);
		}, []);

		useImperativeHandle(
			ref,
			() => ({
				open: () => openHandler(),
				close: () => closeHandler(),
			}),
			[]
		);

		return (
			<>
				{!ref && (
					<View className="flex-col align-top justify-start gap-y-2">
						<View
							className="w-full flex-row items-center justify-between"
							style={{ marginBottom: 10 }}
						>
							<View className="w-full flex-col items-start justify-start">
								<Label>{label}</Label>
								{description && (
									<Text className="text-sm leading-4 text-text-200">
										{description}
									</Text>
								)}
							</View>
						</View>
						<TouchableOpacity
							activeOpacity={0.8}
							className={clsx(
								"flex-row justify-between w-full px-4 py-3 rounded-lg bg-black dark:bg-gray-200",
								{
									"bg-black dark:bg-gray-300":
										pallette === "dark",
								}
							)}
							onPress={openHandler}
							{...rest}
						>
							<Text className=" text-white">
								{
									data.find((item) => item.value === selected)
										?.label
								}
							</Text>
							<MaterialIcons
								name="expand-more"
								size={18}
								color={
									colorScheme === "dark"
										? colors.text[200]
										: colors.white
								}
							/>
						</TouchableOpacity>
					</View>
				)}
				<BottomSheet
					overDragAmount={overDragAmount || 0}
					height={bottomSheetHeight || "40%"}
					suppressBackdrop={true}
					backdropComponent={(props) => <CustomBackdrop {...props} />}
					id={id}
				>
					<View
						className="flex flex-1"
						style={{
							paddingLeft: 24,
							paddingRight: 24,
						}}
					>
						{bottomSheetLabel && (
							<Label style={{ marginBottom: 5 }}>
								{bottomSheetLabel}
							</Label>
						)}
						<FlatList
							data={data}
							keyExtractor={(_, index) => index.toString()}
							showsVerticalScrollIndicator={false}
							style={{
								flex: 1,
							}}
							ItemSeparatorComponent={() => (
								<View className="w-full h-px bg-gray-300 dark:bg-gray-100 opacity-40" />
							)}
							renderItem={({ item, index }) => (
								<TouchableOpacity
									key={index}
									activeOpacity={0.8}
									className="flex-row justify-between w-full py-4"
									onPress={() => {
										setSelected(item.value);
										if (closeOnSelect) {
											closeHandler();
										}
									}}
								>
									<View className="flex-row items-center justify-start">
										{item.icon && (
											<MaterialIcons
												name={
													item.icon as unknown as any
												}
												size={18}
												color={
													colorScheme === "dark"
														? colors.text[100]
														: colors.white
												}
												style={{ marginRight: 10 }}
											/>
										)}
										<Text
											className={clsx(
												"text-black dark:text-text-100 text-sm font-semibold",
												{
													"dark:text-white font-bold":
														selected === item.value,
												}
											)}
										>
											{item.label}
										</Text>
									</View>
									{selected === item.value && (
										<MaterialIcons
											name="check"
											size={18}
											color={
												colorScheme === "dark"
													? colors.text[200]
													: colors.white
											}
										/>
									)}
								</TouchableOpacity>
							)}
						/>
					</View>
				</BottomSheet>
			</>
		);
	}
);

export default Dropdown;
