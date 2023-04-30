import React, { FC, SVGProps } from "react";
import { Text, View, ViewStyle } from "react-native";

import Label from "components/Label";

// Types
import type { MaterialModel } from "database/models/materialModel";
import type { OrderModel } from "database/models/orderModel";
import type { ProductModel } from "database/models/productModel";

export interface Section {
	initialValue?: {
		order: OrderModel;
		products: ProductModel[];
		materials: MaterialModel[];
	};
	updateHandler?: (id: number) => void;
}

export interface WrapperProps {
	headerProps: {
		title: string;
		description?: string;
		icon?: string | any;
		children?: React.ReactNode;
		style?: ViewStyle;
	};
	style?: ViewStyle;
	children?: React.ReactNode;
}

export default function SectionWrapper({
	headerProps,
	style,
	children,
}: WrapperProps) {
	return (
		<View
			className="w-full flex-1 flex-col items-start justify-start"
			style={[style, { rowGap: 20 }]}
		>
			{/* Header */}
			<View
				className="flex-1 flex-row items-center justify-between"
				style={headerProps.style}
			>
				<View className="flex-1 flex-col items-start justify-start">
					<Label
						icon={
							headerProps.icon &&
							typeof headerProps.icon === "string"
								? {
										name: headerProps.icon,
										size: 18,
								  }
								: undefined
						}
						customIcon={
							headerProps.icon &&
							typeof headerProps.icon !== "string"
								? headerProps.icon
								: undefined
						}
						style={{ marginRight: 10 }}
					>
						{headerProps.title}
					</Label>
					{headerProps.description && (
						<Text className="text-sm leading-4 text-text-200 mt-1">
							{headerProps.description}
						</Text>
					)}
				</View>
				{headerProps.children}
			</View>
			{children}
		</View>
	);
}

export const SubSectionWrapper = React.memo(
	({ headerProps, children, style }: WrapperProps) => {
		return (
			<View
				className="flex flex-col items-center justify-start w-full"
				style={[style, { rowGap: 10 }]}
			>
				<View
					className="w-full flex-row items-center justify-between"
					style={headerProps.style}
				>
					<View className="flex flex-col items-start justify-start">
						<Label
							icon={
								headerProps.icon &&
								typeof headerProps.icon === "string"
									? {
											name: headerProps.icon,
											size: 18, // supostamente 14
									  }
									: undefined
							}
							customIcon={
								headerProps.icon &&
								typeof headerProps.icon !== "string"
									? headerProps.icon
									: undefined
							}
							style={[
								{
									marginRight: 10,
									fontSize: 13,
									lineHeight: 16,
									fontFamily: "Inter_500Medium",
								},
							]}
						>
							{headerProps.title}
						</Label>
						{headerProps.description && (
							<Text className="text-sm leading-4 text-text-200 mt-1">
								{headerProps.description}
							</Text>
						)}
					</View>
					{headerProps.children}
				</View>
				{children}
			</View>
		);
	}
);
