import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export function useNotifications() {
	const notificationListener =
		useRef<Notifications.EventSubscription>(undefined);
	const responseListener = useRef<Notifications.EventSubscription>(undefined);

	const registerForPush = useCallback(async () => {
		let token: Notifications.DevicePushToken | undefined;

		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") return null;

		token = await Notifications.getDevicePushTokenAsync();
		return token;
	}, []);

	useEffect(() => {
		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log(
					"[Notification] Received:",
					notification.request.content.title,
				);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log(
					"[Notification] Response:",
					response.notification.request.content.title,
				);
			});

		return () => {
			if (notificationListener.current) {
				notificationListener.current.remove();
			}
			if (responseListener.current) {
				responseListener.current.remove();
			}
		};
	}, []);

	const scheduleLocalNotification = useCallback(
		async (title: string, body: string, data?: Record<string, unknown>) => {
			await Notifications.scheduleNotificationAsync({
				content: { title, body, data },
				trigger: null,
			});
		},
		[],
	);

	return { registerForPush, scheduleLocalNotification };
}
