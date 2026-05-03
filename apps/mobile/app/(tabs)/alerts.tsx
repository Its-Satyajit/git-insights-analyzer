import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Card, EmptyState } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { BorderRadius, Colors, FontSizes, Spacing } from "~/utils/theme";

interface Alert {
	id: string;
	type: "ci_failure" | "pr_update" | "analysis_complete" | "hotspot_detected";
	title: string;
	message: string;
	timestamp: string;
	repo?: string;
	read: boolean;
}

const MOCK_ALERTS: Alert[] = [
	{
		id: "1",
		type: "analysis_complete",
		title: "Analysis Complete",
		message: "Repository facebook/react has been fully analyzed",
		timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
		repo: "facebook/react",
		read: false,
	},
	{
		id: "2",
		type: "hotspot_detected",
		title: "Hotspot Detected",
		message: "src/core/renderer.ts has a critical risk score of 85",
		timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
		repo: "facebook/react",
		read: false,
	},
	{
		id: "3",
		type: "ci_failure",
		title: "CI Pipeline Failed",
		message: "Build #1234 failed on main branch",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		repo: "vercel/next.js",
		read: true,
	},
	{
		id: "4",
		type: "pr_update",
		title: "Pull Request Updated",
		message: "PR #567 has new commits from @contributor",
		timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
		repo: "vercel/next.js",
		read: true,
	},
	{
		id: "5",
		type: "ci_failure",
		title: "Test Suite Failed",
		message: "3 tests failing in the latest push",
		timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
		repo: "microsoft/vscode",
		read: true,
	},
	{
		id: "6",
		type: "pr_update",
		title: "PR Merged",
		message: "Feature branch has been merged into main",
		timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		repo: "denoland/deno",
		read: true,
	},
];

export default function AlertsScreen() {
	const insets = useSafeAreaInsets();
	const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
	const [filter, setFilter] = useState<
		"all" | "unread" | "ci" | "pr" | "hotspot"
	>("all");
	const { registerForPush, scheduleLocalNotification } = useNotifications();

	const handleRegisterPush = async () => {
		void Haptics.selectionAsync();
		const token = await registerForPush();
		if (token) {
			await scheduleLocalNotification(
				"Push Enabled",
				"You will receive real-time alerts",
			);
		}
	};

	const markAsRead = (id: string) => {
		void Haptics.selectionAsync();
		setAlerts((prev) =>
			prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
		);
	};

	const filtered = alerts.filter((a: Alert) => {
		if (filter === "unread") return !a.read;
		if (filter === "ci") return a.type === "ci_failure";
		if (filter === "pr") return a.type === "pr_update";
		if (filter === "hotspot") return a.type === "hotspot_detected";
		return true;
	});

	const unreadCount = alerts.filter((a: Alert) => !a.read).length;

	return (
		<ScrollView
			contentContainerStyle={{
				paddingTop: insets.top + Spacing.lg,
				paddingBottom: insets.bottom + Spacing["4xl"],
			}}
			style={styles.container}
		>
			<View style={styles.header}>
				<View style={styles.titleRow}>
					<Text style={styles.title}>Alerts</Text>
					{unreadCount > 0 && (
						<View style={styles.unreadBadge}>
							<Text style={styles.unreadText}>{unreadCount}</Text>
						</View>
					)}
				</View>
				<Text style={styles.subtitle}>Real-time repository notifications</Text>
			</View>

			<TouchableOpacity onPress={handleRegisterPush} style={styles.pushCard}>
				<Text style={styles.pushIcon}>🔔</Text>
				<View style={styles.pushContent}>
					<Text style={styles.pushTitle}>Enable Push Notifications</Text>
					<Text style={styles.pushDesc}>
						Get instant alerts for CI failures, PR updates, and hotspots
					</Text>
				</View>
				<Text style={styles.pushArrow}>→</Text>
			</TouchableOpacity>

			<View style={styles.filters}>
				{(
					[
						{ key: "all", label: "All" },
						{ key: "unread", label: "Unread" },
						{ key: "ci", label: "CI/CD" },
						{ key: "pr", label: "PRs" },
						{ key: "hotspot", label: "Hotspots" },
					] as const
				).map(({ key, label }) => (
					<TouchableOpacity
						key={key}
						onPress={() => {
							void Haptics.selectionAsync();
							setFilter(key);
						}}
						style={[styles.filterBtn, filter === key && styles.filterBtnActive]}
					>
						<Text
							style={[
								styles.filterText,
								filter === key && styles.filterTextActive,
							]}
						>
							{label}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{filtered.length === 0 ? (
				<EmptyState
					description="You're all caught up!"
					icon="🔔"
					title="No alerts"
				/>
			) : (
				<View style={styles.list}>
					{filtered.map((alert) => (
						<TouchableOpacity
							activeOpacity={0.7}
							key={alert.id}
							onPress={() => markAsRead(alert.id)}
						>
							<Card
								style={[
									styles.alertCard,
									!alert.read && styles.alertCardUnread,
								]}
							>
								<View style={styles.alertHeader}>
									<AlertIcon type={alert.type} />
									<View style={styles.alertInfo}>
										<Text style={styles.alertTitle}>{alert.title}</Text>
										<Text style={styles.alertRepo}>{alert.repo}</Text>
									</View>
									<AlertTypeBadge type={alert.type} />
								</View>
								<Text style={styles.alertMessage}>{alert.message}</Text>
								<Text style={styles.alertTime}>
									{formatTime(alert.timestamp)}
								</Text>
							</Card>
						</TouchableOpacity>
					))}
				</View>
			)}
		</ScrollView>
	);
}

function AlertIcon({ type }: { type: Alert["type"] }) {
	const icons = {
		ci_failure: "🚨",
		pr_update: "🔀",
		analysis_complete: "✅",
		hotspot_detected: "🔥",
	};
	return <Text style={styles.alertIcon}>{icons[type]}</Text>;
}

function AlertTypeBadge({ type }: { type: Alert["type"] }) {
	const config = {
		ci_failure: { label: "CI Fail", variant: "error" as const },
		pr_update: { label: "PR Update", variant: "info" as const },
		analysis_complete: { label: "Complete", variant: "success" as const },
		hotspot_detected: { label: "Hotspot", variant: "warning" as const },
	};
	const { label, variant } = config[type];
	return <Badge label={label} variant={variant} />;
}

function formatTime(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	return date.toLocaleDateString();
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	header: {
		paddingHorizontal: Spacing.lg,
		marginBottom: Spacing.lg,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	title: {
		fontSize: FontSizes["3xl"],
		fontWeight: "700",
		color: Colors.text.primary,
	},
	unreadBadge: {
		backgroundColor: Colors.status.error,
		borderRadius: BorderRadius.full,
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs,
	},
	unreadText: {
		fontSize: FontSizes.sm,
		fontWeight: "700",
		color: "#fff",
	},
	subtitle: {
		fontSize: FontSizes.md,
		color: Colors.text.muted,
		marginTop: Spacing.xs,
	},
	pushCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.accent.muted,
		marginHorizontal: Spacing.lg,
		marginBottom: Spacing.lg,
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		borderWidth: 1,
		borderColor: Colors.accent.secondary,
	},
	pushIcon: {
		fontSize: 24,
		marginRight: Spacing.md,
	},
	pushContent: {
		flex: 1,
	},
	pushTitle: {
		fontSize: FontSizes.md,
		fontWeight: "600",
		color: Colors.text.primary,
	},
	pushDesc: {
		fontSize: FontSizes.sm,
		color: Colors.text.secondary,
		marginTop: Spacing.xs,
	},
	pushArrow: {
		fontSize: FontSizes.lg,
		color: Colors.accent.primary,
	},
	filters: {
		flexDirection: "row",
		paddingHorizontal: Spacing.lg,
		marginBottom: Spacing.lg,
		gap: Spacing.sm,
		flexWrap: "wrap",
	},
	filterBtn: {
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: BorderRadius.full,
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	filterBtnActive: {
		backgroundColor: Colors.accent.primary,
		borderColor: Colors.accent.primary,
	},
	filterText: {
		fontSize: FontSizes.sm,
		color: Colors.text.secondary,
		fontWeight: "500",
	},
	filterTextActive: {
		color: "#000",
		fontWeight: "600",
	},
	list: {
		paddingHorizontal: Spacing.lg,
		gap: Spacing.md,
	},
	alertCard: {
		marginBottom: 0,
		opacity: 0.7,
	},
	alertCardUnread: {
		opacity: 1,
		borderLeftWidth: 3,
		borderLeftColor: Colors.accent.primary,
	},
	alertHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.sm,
	},
	alertIcon: {
		fontSize: FontSizes.xl,
		marginRight: Spacing.sm,
	},
	alertInfo: {
		flex: 1,
	},
	alertTitle: {
		fontSize: FontSizes.md,
		fontWeight: "600",
		color: Colors.text.primary,
	},
	alertRepo: {
		fontSize: FontSizes.xs,
		color: Colors.text.muted,
	},
	alertMessage: {
		fontSize: FontSizes.sm,
		color: Colors.text.secondary,
		marginBottom: Spacing.sm,
	},
	alertTime: {
		fontSize: FontSizes.xs,
		color: Colors.text.muted,
	},
});
