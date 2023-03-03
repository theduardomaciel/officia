// Notifications
//import * as Notifications from 'expo-notifications';
import notifee, { AndroidImportance, AndroidVisibility, AuthorizationStatus, EventType, TimestampTrigger, TriggerType } from "@notifee/react-native";
import type { ServiceModel } from 'database/models/serviceModel';

export async function createChannelId() {
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Serviços',
        vibration: true,
        sound: 'default',
        visibility: AndroidVisibility.PUBLIC,
        badge: true, // contagem de notificações acima do ícone do app
        importance: AndroidImportance.HIGH,
    });
    return channelId;
}

export async function scheduleServiceNotification(service: Partial<ServiceModel>, subServicesAmount?: number, clientName?: string) {
    const settings = await notifee.requestPermission()

    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
        console.log('User denied permissions request');
        return false;
    } else if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('User granted permissions request');
    } else if (settings.authorizationStatus === AuthorizationStatus.PROVISIONAL) {
        console.log('User provisionally granted permissions request');
    }

    const trigger1HourAdvance: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: service.date!.getTime() - (1000 * 60 * 60),
        //timestamp: new Date().getTime() + (1000 * 15),
    }

    const trigger15MinutesAdvance: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: service.date!.getTime() - 1000 * 60 * 15,
        //timestamp: new Date().getTime() + (1000 * 30),
    }

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: service.date!.getTime(),
        //timestamp: new Date().getTime() + (1000 * 45),
    }

    const PLURAL = subServicesAmount ? subServicesAmount !== 1 ? "s" : "" : "";

    const SUMMARY = `Você tem ${!subServicesAmount || subServicesAmount === 0 ? "um" : subServicesAmount} serviço${PLURAL} agendado${PLURAL} ${clientName ? `para ${clientName} ` : ""}`;

    await notifee.createTriggerNotification({
        title: `CORRE! ${service.name} está atrasado!`,
        body: `${SUMMARY} ATRASADOS!`,
        id: service.id,
        android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
            pressAction: {
                id: service.id!,
                launchActivity: 'default',
            },
            lightUpScreen: true,
            showTimestamp: true,
            smallIcon: 'notification_icon',
        },
    }, trigger)

    await notifee.createTriggerNotification({
        title: `15 minutos para ${service.name}!`,
        body: `Mais um aviso! ${SUMMARY}daqui a 15 minutos!`,
        id: `${service.id}_15m`,
        android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
            pressAction: {
                id: service.id!,
                launchActivity: 'default',
            },
            smallIcon: 'notification_icon',
        },
    }, trigger15MinutesAdvance)

    await notifee.createTriggerNotification({
        title: `1 hora para ${service.name}.`,
        body: `${SUMMARY}hoje.\nÉ bom começar a se arrumar!`,
        id: `${service.id}_1h`,
        android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
            pressAction: {
                id: service.id!,
                launchActivity: 'default',
            },
            smallIcon: 'notification_icon',
        },
    }, trigger1HourAdvance)

    console.log("Notificações criadas/atualizadas.")
}

export async function removeNotification(notificationId: string) {
    await notifee.cancelNotification(notificationId);
    await notifee.cancelNotification(`${notificationId}_15m`);
    await notifee.cancelNotification(`${notificationId}_1h`);
}