import { useWindowDimensions, View, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList, useDrawerProgress } from '@react-navigation/drawer';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Logo from "src/assets/icons/logo.svg";

const Drawer = createDrawerNavigator();

// Screens
import HomeNavigator from './bottomTabNavigator';
import ProfileScreen from 'screens/Drawer/Profile';
import ClientsScreen from 'screens/Drawer/Clients';
import SavedItemsScreen from 'screens/Drawer/SavedItems';
import CustomizationScreen from 'screens/Drawer/Customization';
import SubscriptionScreen from 'screens/Drawer/Subscription';

export default function DrawerNavigator(props: any) {
    const { width } = useWindowDimensions();

    return (
        <Drawer.Navigator
            initialRouteName="homeTab"
            screenOptions={{
                swipeEdgeWidth: (width / 3) * 2,
                swipeEnabled: true,
                drawerStyle: {
                    backgroundColor: colors.gray[400],
                },
                sceneContainerStyle: {
                    backgroundColor: "transparent",
                },
                drawerItemStyle: {
                    width: "100%",
                    marginLeft: 0,
                    paddingLeft: 0,
                },
                drawerLabelStyle: {
                    fontSize: 18,
                    color: colors.white,
                },
                drawerActiveTintColor: colors.primary.green
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                name="homeTab"
                component={HomeNavigator}
                options={{ headerShown: false, swipeEnabled: true, drawerItemStyle: { display: "none" } }}
            />
            <Drawer.Screen
                name="profile"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    drawerLabel: 'Perfil',
                    swipeEnabled: false,
                    drawerIcon: () => <MaterialIcons name="account-circle" size={24} color={colors.white} />
                }}
            />
            <Drawer.Screen
                name="clients"
                component={ClientsScreen}
                options={{
                    headerShown: false,
                    drawerLabel: 'Clientes',
                    swipeEnabled: false,
                    drawerIcon: () => <MaterialIcons name="group" size={24} color={colors.white} />
                }}
            />
            <Drawer.Screen
                name="savedItems"
                component={SavedItemsScreen}
                options={{
                    headerShown: false,
                    drawerLabel: 'Itens Salvos',
                    swipeEnabled: false,
                    drawerIcon: () => <MaterialIcons name="bookmarks" size={24} color={colors.white} />
                }}
            />
            <Drawer.Screen
                name="customization"
                component={CustomizationScreen}
                options={{
                    headerShown: false,
                    drawerLabel: 'Customização',
                    swipeEnabled: false,
                    drawerIcon: () => <MaterialIcons name="border-color" size={24} color={colors.white} />
                }}
            />
            <Drawer.Screen
                name="subscription"
                component={SubscriptionScreen}
                options={{
                    headerShown: false,
                    drawerLabel: 'officia+',
                    drawerLabelStyle: {
                        fontSize: 22,
                        color: colors.white,
                        fontFamily: 'AbrilFatface_400Regular'
                    },
                    swipeEnabled: false,
                    drawerIcon: () => <Logo width={24} height={24} color={colors.white} />
                }}
            />
        </Drawer.Navigator>
    );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 48, paddingLeft: 24, paddingRight: 24, rowGap: 25 }} >
            <View className='flex flex-row justify-between items-start'>
                <View className='flex flex-col items-start justify-start' style={{ rowGap: 10 }}>
                    <View className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200" >
                        <MaterialIcons name="person" size={24} color={colors.text[100]} />
                    </View>
                    <Text className='font-titleBold text-xl text-white leading-tight'>meninocoiso</Text>
                    <Text className='leading-tight text-sm text-text-100 -mt-2'>desde 2021</Text>
                </View>
                <MaterialIcons name="pending" size={24} color={colors.text[100]} style={{ transform: [{ rotate: "90deg" }] }} />
            </View>
            <View className='w-full h-[1px] rounded-sm bg-gray-200' />
            <View className='flex flex-col justify-between items-start' style={{ rowGap: 5 }}>
                <DrawerItemList {...props} />
            </View>

        </DrawerContentScrollView>
    );
}