/** @type {import('tailwindcss').Config} */
const colors = require('./src/global/colors')

module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: colors,
            borderRadius: {
                DEFAULT: 10,
                sm: 5,
            },
            fontSize: {
                md: 15
            },
            fontFamily: {
                regular: ['Inter_400Regular', 'Raleway_400Regular'],
                medium: 'Inter_500Medium',
                semibold: ['Inter_600SemiBold'],
                bold: ['Inter_700Bold', 'Raleway_700Bold'],
                extrabold: 'Inter_800ExtraBold',
                black: ['Inter_900Black'],
                titleRegular: ['Raleway_400Regular'],
                titleSemiBold: ['Raleway_600SemiBold'],
                titleBold: ['Raleway_700Bold'],
                logoRegular: ['AbrilFatface_400Regular'],
            }
        },
    },
    plugins: [],
}