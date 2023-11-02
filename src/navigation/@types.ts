import type {
    CompositeScreenProps,
    NavigatorScreenParams,
} from "@react-navigation/native";

import type { DrawerScreenProps } from "@react-navigation/drawer";
import type { StackScreenProps } from "@react-navigation/stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type HomeTabParamList = {
    Home: undefined;
    Overview: undefined;
    Business: undefined;
};

export type HomeDrawerParamList = {
    HomeTab: NavigatorScreenParams<HomeTabParamList>;
};

type BusinessScreensParamList = {
    BasicInfo: undefined;
    AdditionalInfo: undefined;
    Marketplace: undefined;
    Contact: undefined;
    Payments: undefined;
    Categories: undefined;
    DigitalSignature: undefined;
};

type DrawerScreensParamList = {
    Profile: undefined;
    Costumers: undefined;
    Catalog: undefined;
    Subscription: undefined;
    /* Drawer -> Profile */
    ManageAccount: undefined;
    ManageSubscription: undefined;
    /* DRAWER OPTIONS */
    Settings: undefined;
    ManageData: undefined;
};

export type RootStackParamList = {
    HomeDrawer: NavigatorScreenParams<HomeDrawerParamList>;
    /* GENERAL */
    Schedule: { orderId: string };
    DateAgenda: { dateString: string };
    Order: { id: string; hasUpdated: boolean };
    Invoice: { orderId: string };
    /* AUTHENTICATION */
    AccountSelection: undefined;
    Login: undefined;
} & DrawerScreensParamList &
    BusinessScreensParamList;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    StackScreenProps<RootStackParamList, T>;

export type HomeTabScreenProps<T extends keyof HomeTabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<HomeTabParamList, T>,
        RootStackScreenProps<keyof RootStackParamList>
    >;

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}
