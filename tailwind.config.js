/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    green: '#6CBE45',
                    red: '#CA4331',
                    blue: '#2D28FF',
                    yellow: '#FFBB0D',
                    purple: '#9747FF',
                },
                text: {
                    100: '#C4C4C4',
                    200: '#A1A1AA',
                    neutral: '#FFFFFF',
                },
                bg: {
                    100: '#666666',
                    200: '#333333',
                    300: '#292929',
                    400: '#27272A',
                    500: '#1E1F20',
                    600: "#1C1B1F"
                }
            },
            fontFamily: {
                regular: ['Inter_400Regular', 'Raleway_400Regular'],
                semibold: 'Inter_600SemiBold',
                bold: ['Inter_700Bold', 'Raleway_700Bold'],
                extrabold: 'Inter_800ExtraBold',
                titleRegular: ['Raleway_400Regular'],
                titleBold: ['Raleway_700Bold'],
            }
        },
    },
    plugins: [],
}