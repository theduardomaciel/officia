import { useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native"

import * as Location from "expo-location"

import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from 'global/colors';

// Components
import Toast from 'components/Toast';
import Input, { CustomInputProps } from "./Input"

interface Props extends CustomInputProps {
    value: string;
    geocodedAddress?: string;
    onAddressFetch: (address: string | undefined, coords?: Location.LocationGeocodedLocation) => void;
}

export default function AddressFetch({ value, geocodedAddress, onAddressFetch, pallette, ...rest }: Props) {
    const [isFetchingLocation, setFetchingLocation] = useState(false);

    async function getPostalCodeAddress() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    message: "É necessário que a permissão de localização seja concedida para que o endereço do CEP seja identificado automaticamente.",
                    title: "Permissão negada",
                    preset: "error",
                })
                return;
            }

            setFetchingLocation(true)

            //const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            //const addressFetched = await Location.reverseGeocodeAsync(coords);
            const addressFetched = await Location.geocodeAsync(value);
            const coords = addressFetched[0];
            const addressGeocoded = await Location.reverseGeocodeAsync(coords);
            const address = addressGeocoded[0];

            //console.log(address)
            /* 
                [0] = street
                [1] = name or streetNumber
                [2] = district (Bairro)
                [3] = city
                [4] = region (Estado)
                [5] = country
            */
            const addressText = (address.street ?? "") + ", " + (address.name ?? address.streetNumber ?? "") + ", " + address.district + ", " + (address.city ?? address.subregion ?? "") + ", " + address.region + ", " + address.country;

            onAddressFetch(addressText, coords);
            setFetchingLocation(false);
        } catch (error) {
            console.log(error)
            Toast.show({
                title: "Ops! Algo deu errado.",
                message: "Não foi possível obter o endereço do seu negócio. Por favor, tente novamente.",
                preset: "error",
            })
            setFetchingLocation(false)
        }
    }

    return (
        <Input
            {...rest}
            value={value}
            pallette={pallette}
            maxLength={9}
            keyboardType='number-pad'
            appendedChildren={
                <TouchableOpacity
                    className='flex items-center justify-center p-3 px-4 rounded-lg ml-2'
                    disabled={!value || value && value.length < 9 ? true : false || isFetchingLocation}
                    activeOpacity={0.7}
                    onPress={geocodedAddress ? () => onAddressFetch(undefined) : getPostalCodeAddress}
                    style={{
                        backgroundColor: geocodedAddress || !value || value && value.length < 9 ? (pallette === "dark" ? colors.gray[300] : colors.gray[200]) : colors.primary.green,
                    }}
                >
                    {
                        isFetchingLocation ? (
                            <ActivityIndicator size={"small"} color={colors.white} />
                        ) : (
                            <MaterialCommunityIcons
                                name={geocodedAddress ? "close" : 'map'}
                                size={18}
                                color={geocodedAddress || !value || value.length < 9 ? colors.text[200] : colors.white}
                            />
                        )
                    }
                </TouchableOpacity>
            }
        />
    )
}