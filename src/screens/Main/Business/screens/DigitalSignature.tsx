import React, { useRef, useState } from "react";
import {
	Canvas,
	ImageFormat,
	PaintStyle,
	Path,
	SkCanvas,
	Skia,
	SkiaView,
	SkPaint,
	SkPath,
	StrokeCap,
	StrokeJoin,
	useCanvasRef,
	useDrawCallback,
	useTouchHandler,
} from "@shopify/react-native-skia";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { v4 as uuidv4 } from "uuid";

import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import colors from "global/colors";

// Components
import Container from "components/Container";
import Header from "components/Header";

// Types
import type { BusinessData } from "screens/Main/Business/@types";
import { ActionButton, SubActionButton } from "components/Button";

import { updateData } from "screens/Main/Business";

const paint = () => {
	const paint = Skia.Paint();
	paint.setStyle(PaintStyle.Stroke);
	paint.setStrokeWidth(4);
	paint.setColor(Skia.Color(colors.white));
	return paint;
};

interface IPath {
	path: SkPath;
	paint: SkPaint;
}

export default function DigitalSignature({ route, navigation }: any) {
	const insets = useSafeAreaInsets();
	const { businessData: data }: { businessData: BusinessData } = route.params;

	const pictureCanvasRef = useCanvasRef();
	const canvasRef = useRef<SkCanvas | null>(null);
	const currentPath = useRef<SkPath | null>(null);
	const [paths, setPaths] = useState<IPath[]>([]);

	const onTouch = useTouchHandler({
		onStart: ({ x, y }) => {
			currentPath.current = Skia.Path.Make();
			currentPath.current.moveTo(x, y);
		},
		onActive: ({ x, y }) => {
			currentPath.current?.lineTo(x, y);

			// Desenha o caminho atual
			if (currentPath.current) {
				canvasRef.current?.drawPath(currentPath.current, paint());
			}
		},
		onEnd: () => {
			setPaths((paths) =>
				paths.concat({
					path: currentPath.current!,
					paint: paint(),
				})
			);
			currentPath.current = null;
		},
	});

	const onDraw = useDrawCallback((canvas, info) => {
		canvasRef.current = canvas;
		onTouch(info.touches);
	}, []);

	const onClear = () => {
		setPaths([]);
		containerRef.current?.redraw();
	};

	async function handleConfirm() {
		if (currentPath.current) {
			if (data.digitalSignatureUri)
				await FileSystem.deleteAsync(data.digitalSignatureUri, {
					idempotent: true,
				});
		}

		const path = FileSystem.documentDirectory + `signature_${uuidv4()}.png`;

		const image = pictureCanvasRef.current?.makeImageSnapshot();

		if (image) {
			const signature = await image.encodeToBase64(ImageFormat.PNG, 100);

			const manipulationResult = await manipulateAsync(
				"data:image/png;base64," + signature,
				[{ rotate: 90 }],
				{
					base64: true,
					format: SaveFormat.PNG,
				}
			);
			if (manipulationResult.base64) {
				FileSystem.writeAsStringAsync(
					path,
					manipulationResult.base64.replace(
						"data:image/png;base64,",
						""
					),
					{ encoding: FileSystem.EncodingType.Base64 }
				)
					.then(async () => {
						const file = await FileSystem.getInfoAsync(path);
						const updatedData = await updateData(
							{ digitalSignatureUri: file.uri },
							data
						);

						navigation.navigate("additionalInfo", {
							businessData: updatedData,
						});
					})
					.catch(console.error);
			}
		}
	}

	const containerRef = useRef<SkiaView>(null);

	return (
		<Container>
			<Header title="Assinatura Digital" returnButton />
			<SkiaView
				style={{
					borderWidth: 2,
					zIndex: 10,
					borderColor: colors.gray[100],
					borderStyle: "dashed",
					borderRadius: 10,
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
				}}
				onDraw={onDraw}
				ref={containerRef}
				pointerEvents="none"
			>
				<Canvas
					style={{
						width: "100%",
						height: "100%",
						margin: -2,
						backgroundColor: "transparent",
						zIndex: -100,
						position: "absolute",
						top: 0,
						left: 0,
					}}
					pointerEvents="none"
					ref={pictureCanvasRef}
				>
					{paths.map((path, index) => (
						<Path
							key={index}
							path={path.path}
							style={"stroke"}
							strokeWidth={4}
							color={colors.white}
						/>
					))}
				</Canvas>
				<Text className="text-text-200 font-semibold -rotate-90 opacity-50">
					Desenhe sua assinatura digital
				</Text>
			</SkiaView>

			<View className="flex-row justify-between">
				<View className="flex-2 mr-3">
					<ActionButton
						label="Salvar assinatura"
						icon="brush"
						onPress={handleConfirm}
						style={{
							marginBottom: insets.bottom + 15,
							backgroundColor: colors.primary,
						}}
						preset="next"
					/>
				</View>
				<View className="flex-1">
					<SubActionButton
						icon="undo"
						preset="dashed"
						borderColor={colors.red}
						onPress={onClear}
						style={{ paddingTop: 16, paddingBottom: 16 }}
					/>
				</View>
			</View>
		</Container>
	);
}
