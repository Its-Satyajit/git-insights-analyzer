import type React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { BorderRadius, Colors, Spacing } from "../../utils/theme";

interface EmptyStateProps {
	icon?: string;
	title: string;
	description?: string;
	action?: React.ReactNode;
	style?: ViewStyle;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	style,
}: EmptyStateProps) {
	return (
		<View style={[styles.container, style]}>
			{icon && <Text style={styles.icon}>{icon}</Text>}
			<Text style={styles.title}>{title}</Text>
			{description && <Text style={styles.description}>{description}</Text>}
			{action && <View style={styles.action}>{action}</View>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Spacing["4xl"],
		paddingHorizontal: Spacing.xl,
	},
	icon: {
		fontSize: 48,
		marginBottom: Spacing.lg,
		opacity: 0.5,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: Colors.text.primary,
		textAlign: "center",
		marginBottom: Spacing.sm,
	},
	description: {
		fontSize: 14,
		color: Colors.text.secondary,
		textAlign: "center",
		marginBottom: Spacing.lg,
	},
	action: {
		marginTop: Spacing.md,
	},
});
