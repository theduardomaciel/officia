// Original code used for adaption from: https://github.com/CaioQuirinoMedeiros/react-native-mask-input/blob/main/src/formatWithMask.ts

type MaskItem = string | RegExp | [RegExp];

type MaskArray = Array<MaskItem>;

type Mask = MaskArray | ((value?: string) => MaskArray);

type FormatWithMaskProps = {
    /**
     * Text to be formatted with the mask.
     */
    text?: string;
    mask?: Mask;
    /**
     * Character to be used on the obfuscated characters. Defaults to `"*"`
     */
    obfuscationCharacter?: string;
    /** Add next mask characters at the end of the value. Defaults to `false`.
     *
     * Example: In a date mask, a input value of `"15/10"` will result:
     * - When set to false: `"15/10"`
     * - When set to true: `"15/10/"`
     */
    maskAutoComplete?: boolean;
};

export type FormatWithMaskResult = {
    masked: string;
    unmasked: string;
    obfuscated: string;
};

export default function formatWithMask({ text, mask, maskAutoComplete, obfuscationCharacter }: FormatWithMaskProps): FormatWithMaskResult {
    /* const { text, mask, obfuscationCharacter = '*', maskAutoComplete = false } = props; */

    // make sure it'll not break with null or undefined inputs
    if (!text) return { masked: '', unmasked: '', obfuscated: '' };
    if (!mask)
        return {
            masked: text || '',
            unmasked: text || '',
            obfuscated: text || '',
        };

    let maskArray = typeof mask === 'function' ? mask(text) : mask;

    let masked = '';
    let obfuscated = '';
    let unmasked = '';

    let maskCharIndex = 0;
    let valueCharIndex = 0;

    while (true) {
        // if mask is ended, break.
        if (maskCharIndex === maskArray.length) {
            break;
        }

        let maskChar = maskArray[maskCharIndex];
        let valueChar = text[valueCharIndex];

        // if value is ended, break.
        if (valueCharIndex === text.length) {
            if (typeof maskChar === 'string' && maskAutoComplete) {
                masked += maskChar;
                obfuscated += maskChar;

                maskCharIndex += 1;
                continue;
            }
            break;
        }

        // value equals mask: add to masked result and advance on both mask and value indexes
        if (maskChar === valueChar) {
            masked += maskChar;
            obfuscated += maskChar;

            valueCharIndex += 1;
            maskCharIndex += 1;
            continue;
        }

        let unmaskedValueChar = text[valueCharIndex];

        // it's a regex maskChar: let's advance on value index and validate the value within the regex
        if (typeof maskChar === 'object') {
            // advance on value index
            valueCharIndex += 1;

            const shouldObfuscateChar = Array.isArray(maskChar);

            const maskCharRegex = Array.isArray(maskChar) ? maskChar[0] : maskChar;

            const matchRegex = RegExp(maskCharRegex).test(valueChar);

            // value match regex: add to masked and unmasked result and advance on mask index too
            if (matchRegex) {
                masked += valueChar;
                obfuscated += shouldObfuscateChar ? obfuscationCharacter : valueChar;
                unmasked += unmaskedValueChar;

                maskCharIndex += 1;
            }

            continue;
        } else {
            // it's a fixed maskChar: add to maskedResult and advance on mask index
            masked += maskChar;
            obfuscated += maskChar;

            maskCharIndex += 1;
            continue;
        }
    }

    return { masked, unmasked, obfuscated };
}

const BRL_CPF = [
    /\d/,
    /\d/,
    /\d/,
    '.',
    /\d/,
    /\d/,
    /\d/,
    '.',
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
];

const BRL_PHONE = ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

const BRL_CNPJ = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

const ZIP_CODE = [/\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];

const BRL_AGENCY = [/\d/, /\d/, /\d/, /\d/, '-', /\d/];

const MASKS = {
    BRL_PHONE,
    BRL_CPF,
    BRL_CNPJ,
    ZIP_CODE,
    BRL_AGENCY
}

export { MASKS };
