import { useEffect, useState } from 'react';
import { useWindowDimensions, View, Text, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList, useDrawerProgress } from '@react-navigation/drawer';

import { MaterialIcons } from "@expo/vector-icons";
import colors from 'global/colors';

import Logo from "src/assets/icons/logo.svg";

const Drawer = createDrawerNavigator();

// Screens
import HomeNavigator from './bottomTabNavigator';
import Animated, { CurvedTransition, EntryAnimationsValues, ExitAnimationsValues, FadingTransition, Layout, SequencedTransition, SlideInDown, SlideInUp, SlideOutUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RectButton } from 'react-native-gesture-handler';

export default function DrawerNavigator(props: any) {
    const { width } = useWindowDimensions();

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('drawerItemPress', (event: any) => {
            // Prevent default behavior
            event.preventDefault();
        });

        return unsubscribe;
    }, [props.navigation]);

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
                drawerActiveTintColor: colors.primary.green
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen
                name="homeTab"
                component={HomeNavigator}
                options={{ headerShown: false, swipeEnabled: true, drawerItemStyle: { display: "none" } }}
            />
        </Drawer.Navigator>
    );
}

const STYLE = {
    width: "100%",
    marginLeft: 0,
    paddingLeft: 0,
};

const LABEL_STYLE = {
    fontSize: 18,
    color: colors.white,
};

const PADDING = { paddingLeft: 24, paddingRight: 24 }

function CustomDrawerContent(props: DrawerContentComponentProps) {
    const insets = useSafeAreaInsets();

    return (
        <DrawerContentScrollView
            {...props}
            /* style={{ paddingLeft: 24 }} */
            contentContainerStyle={{ paddingTop: 48, paddingBottom: insets.bottom + 10, rowGap: 25 }}
        >
            <View className='flex flex-row justify-between items-start' style={PADDING}>
                <View className='flex flex-col items-start justify-start' style={{ rowGap: 10 }}>
                    <View className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-200" >
                        <MaterialIcons name="person" size={24} color={colors.text[100]} />
                    </View>
                    <Text className='font-titleBold text-xl text-white leading-tight'>meninocoiso</Text>
                    <Text className='leading-tight text-sm text-text-100 -mt-2'>desde 2021</Text>
                </View>
                <MaterialIcons name="pending" size={24} color={colors.text[100]} style={{ transform: [{ rotate: "90deg" }] }} />
            </View>
            <View className='w-full h-[1px] rounded-sm bg-gray-200' style={PADDING} />
            <View className='flex flex-col justify-between items-start' style={{ rowGap: 5, ...PADDING }}>
                <DrawerItem
                    label="Perfil"
                    icon={() => <MaterialIcons name="account-circle" size={24} color={colors.white} />}
                    style={STYLE}
                    labelStyle={LABEL_STYLE}
                    onPress={() => props.navigation.navigate('profile')}
                />
                <DrawerItem
                    label="Clientes"
                    icon={() => <MaterialIcons name="group" size={24} color={colors.white} />}
                    style={STYLE}
                    labelStyle={LABEL_STYLE}
                    onPress={() => props.navigation.navigate('clients')}
                />
                <DrawerItem
                    label="Itens Salvos"
                    icon={() => <MaterialIcons name="bookmarks" size={24} color={colors.white} />}
                    style={STYLE}
                    labelStyle={LABEL_STYLE}
                    onPress={() => props.navigation.navigate('savedItems')}
                />
                <DrawerItem
                    label="Personalização"
                    icon={() => <MaterialIcons name="palette" size={24} color={colors.white} />}
                    style={STYLE}
                    labelStyle={LABEL_STYLE}
                    onPress={() => props.navigation.navigate('customization')}
                />
                <DrawerItem
                    label="officia+"
                    style={STYLE}
                    labelStyle={{
                        fontSize: 22,
                        color: colors.white,
                        fontFamily: 'AbrilFatface_400Regular'
                    }}
                    icon={() => <Logo width={24} height={24} color={colors.white} />}
                    onPress={() => props.navigation.navigate('subscription')}
                />
            </View>
            <View className='flex w-full flex-1 bg-red-100' style={{ flex: 1 }} />
            <View className='w-full h-[1px] rounded-sm bg-gray-200' />
            <Animated.View className='flex flex-col flex-1 items-center justify-start w-full' layout={Layout.springify()}>
                <SubSectionHolder
                    title={"Preços & condições"}
                    sections={[
                        { label: "Termos de Compra", icon: "attach-money", onPress: () => props.navigation.navigate('prices') },
                        { label: "Termos de Uso", icon: "description", onPress: () => props.navigation.navigate('conditions') },
                    ]}
                />
                <SubSectionHolder
                    title={"Dados & privacidade"}
                    sections={[
                        { label: "Gerenciar dados pessoais", icon: "bar-chart", onPress: () => props.navigation.navigate('data') },
                        { label: "Política de Privacidade", icon: "shield", onPress: () => props.navigation.navigate('privacy') },
                    ]}
                />
                <SubSectionHolder
                    title={"Configurações & suporte"}
                    sections={[
                        { label: "Configurações do aplicativo", icon: "settings", onPress: () => props.navigation.navigate('settings') },
                        { label: "Central de Ajuda", icon: "contact-support", onPress: () => props.navigation.navigate('support') },
                    ]}
                />
            </Animated.View>
        </DrawerContentScrollView>
    );
}

interface SubSection {
    title: string;
    sections: {
        label: string;
        icon: string;
        onPress: () => void;
    }[]
}

const SUBSECTION_HEIGHT = 50;

function SubSectionHolder({ title, sections }: SubSection) {
    const [isExpanded, setIsExpanded] = useState(false);
    const rotation = useSharedValue(-90);

    const arrowStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
            ]
        };
    });

    const height = useSharedValue(SUBSECTION_HEIGHT);

    const sizeStyle = useAnimatedStyle(() => {
        return {
            height: height.value,
        };
    });


    return (
        <Animated.View className='flex flex-col w-full' style={[{ rowGap: 0, overflow: "hidden" }, sizeStyle]}>
            <RectButton
                activeOpacity={0.5}
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: SUBSECTION_HEIGHT,
                    paddingTop: 15,
                    paddingBottom: 15,
                    ...PADDING
                }}
                onPress={() => {
                    setIsExpanded(!isExpanded)
                    rotation.value = withSpring(isExpanded ? -90 : 90, { damping: 100, stiffness: 100, mass: 0.15 });
                    height.value = withSpring(isExpanded ? SUBSECTION_HEIGHT : (SUBSECTION_HEIGHT * sections.length) + SUBSECTION_HEIGHT, { damping: 100, stiffness: 100, mass: 0.15 });
                }}
            >
                <Text className='font-medium text-md text-white'>
                    {title}
                </Text>
                <Animated.View className={'flex items-center justify-center w-5 h-5'} style={arrowStyle}>
                    <MaterialIcons name='chevron-left' size={18} color={colors.white} />
                </Animated.View>
            </RectButton>
            <Animated.View
                className='flex flex-col justify-between items-start'
                style={{ rowGap: 0 }}
            >
                {sections.map((section, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={section.onPress}
                        style={{
                            columnGap: 15,
                            display: "flex",
                            height: SUBSECTION_HEIGHT,
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            paddingTop: 12.5,
                            paddingBottom: 12.5,
                            ...PADDING
                        }}
                    >
                        <MaterialIcons name={section.icon as unknown as any} size={20} color={colors.text[100]} />
                        <Text className='font-regular text-sm text-text-100 leading-tight'>{section.label}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </Animated.View>
    )
}