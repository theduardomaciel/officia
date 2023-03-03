import React, { useRef } from 'react';
import { View } from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { v4 as uuidv4 } from 'uuid';

import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import colors from 'global/colors';

// Components
import Container from 'components/Container';
import Header from 'components/Header';

// Types
import type { BusinessData } from 'screens/Main/Business/@types';
import { ActionButton, SubActionButton } from 'components/Button';

import { updateData } from 'screens/Main/Business';

const style = `
    body {
        background: ${colors.gray[300]};
        height: 100%;
    }

    .m-signature-pad--footer {
        display: none; 
        margin: 0px;
    }

    .m-signature-pad {
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        background-color: transparent; /* de alguma forma isso deu certo e fez o painel ocupar todo o espaço */
        border-radius: 10px;
        box-shadow: none;
        border: none;
        margin: 0;
    }

    .m-signature-pad:after {
        display: none;
    }

    .m-signature-pad:before {
        content: "Escreva sua assinatura aqui";
        padding-right: 80%;
        
        opacity: 0.5;
        color: ${colors.text[200]};
        user-select: none;
        white-space: nowrap;
        font-size: 16px;
        font-weight: 600;
        transform: rotate(-90deg);
    }

    .m-signature-pad--body {
        position: absolute;
        left: 0px;
        top: 0px;
        bottom: 0px;
        right: 0px;
        border: none;
    }

    .m-signature-pad--body canvas {
        /* position: absolute;
        left: 0;
        top: 0; */
        width: 100%;
        height: 100%;
        border-radius: 10px;
        border: none;
        box-shadow: none;
  }
`;

export default function DigitalSignature({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const ref = useRef<SignatureViewRef>(null);

    const { businessData: data }: { businessData: BusinessData } = route.params;

    const handleOK = async (signature: string | undefined) => {
        if (signature) {
            console.log("cheas")
            if (data.digitalSignatureUri) await FileSystem.deleteAsync(data.digitalSignatureUri, { idempotent: true });

            const path = FileSystem.documentDirectory + `signature_${uuidv4()}.png`;
            const manipulationResult = await manipulateAsync(signature, [{ rotate: 90 }], { base64: true, format: SaveFormat.PNG });
            if (manipulationResult.base64) {
                FileSystem.writeAsStringAsync(
                    path,
                    manipulationResult.base64.replace("data:image/png;base64,", ""),
                    { encoding: FileSystem.EncodingType.Base64 }
                )
                    .then(async () => {
                        const file = await FileSystem.getInfoAsync(path)
                        console.log("terminou.")
                        const result = await updateData({ digitalSignatureUri: file.uri }, data)
                        navigation.navigate('additionalInfo', { businessData: result })
                    })
                    .catch(console.error);
            }
        }
    };

    /* const handleClear = () => {
        ref.current?.clearSignature();
    }; */

    const handleUndo = () => {
        ref.current?.undo();
    };

    const handleConfirm = () => {
        ref.current?.readSignature();
    };

    return (
        <Container>
            <Header title='Assinatura Digital' returnButton />
            <View
                className='flex-1 p-1'
                style={{
                    borderWidth: 2,
                    borderColor: colors.gray[100],
                    borderStyle: "dashed",
                    borderRadius: 10,
                }}
            >
                <SignatureScreen
                    ref={ref}
                    onOK={handleOK}
                    penColor={colors.white}
                    style={{ backgroundColor: "transparent" }}
                    webviewContainerStyle={{ backgroundColor: "transparent" }}
                    webStyle={style}
                />
            </View>
            <View className='flex-row justify-between'>
                <View className='flex-2 mr-3'>
                    <ActionButton
                        label='Salvar assinatura'
                        icon='brush'
                        onPress={handleConfirm}
                        style={{ marginBottom: insets.bottom + 15, backgroundColor: colors.primary.green }}
                        preset="next"
                    />
                </View>
                <View className='flex-1'>
                    <SubActionButton
                        icon='undo'
                        preset='dashed'
                        borderColor={colors.primary.red}
                        onPress={handleUndo}
                        style={{ paddingTop: 16, paddingBottom: 16 }}
                    />
                </View>
            </View>
        </Container>
    )
}