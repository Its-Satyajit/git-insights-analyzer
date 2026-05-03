import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { Colors } from "~/utils/theme";

function TabIcon({
	focused,
	icon,
	label,
}: {
	focused: boolean;
	icon: string;
	label: string;
}) {
	return (
		<View style={{ alignItems: "center", justifyContent: "center" }}>
			<Text style={{ fontSize: 22 }}>{icon}</Text>
			<Text
				style={{
					fontSize: 10,
					fontWeight: focused ? "600" : "400",
					color: focused ? Colors.accent.primary : Colors.text.muted,
					marginTop: 2,
				}}
			>
				{label}
			</Text>
		</View>
	);
}

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: Colors.surface,
					borderTopColor: Colors.border,
					borderTopWidth: 1,
					height: 60,
					paddingBottom: 8,
					paddingTop: 8,
				},
				tabBarActiveTintColor: Colors.accent.primary,
				tabBarInactiveTintColor: Colors.text.muted,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} icon="🏠" label="Home" />
					),
				}}
			/>
			<Tabs.Screen
				name="repos"
				options={{
					title: "Repos",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} icon="📦" label="Repos" />
					),
				}}
			/>
			<Tabs.Screen
				name="analytics"
				options={{
					title: "Analytics",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} icon="📊" label="Analytics" />
					),
				}}
			/>
			<Tabs.Screen
				name="hotspots"
				options={{
					title: "Hotspots",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} icon="🔥" label="Hotspots" />
					),
				}}
			/>
			<Tabs.Screen
				name="alerts"
				options={{
					title: "Alerts",
					tabBarIcon: ({ focused }) => (
						<TabIcon focused={focused} icon="🔔" label="Alerts" />
					),
				}}
			/>
			<Tabs.Screen
				name="repo"
				options={{
					href: null,
				}}
			/>
		</Tabs>
	);
}
