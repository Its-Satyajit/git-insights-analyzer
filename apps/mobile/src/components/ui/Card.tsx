import type React from "react";
import {
	type StyleProp,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import { BorderRadius, Colors, FontSizes, Spacing } from "../../utils/theme";

interface CardProps {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	title?: string;
	subtitle?: string;
	action?: React.ReactNode;
}

export function Card({ children, style, title, subtitle, action }: CardProps) {
	return (
		<View style={[styles.card, style]}>
			{(title || subtitle || action) && (
				<View style={styles.header}>
					<View style={styles.titleRow}>
						{title && <Text style={styles.title}>{title}</Text>}
						{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
					</View>
					{action && <View>{action}</View>}
				</View>
			)}
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.surface,
		borderRadius: BorderRadius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		padding: Spacing.lg,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: Spacing.md,
	},
	titleRow: {
		flex: 1,
	},
	title: {
		fontSize: FontSizes.lg,
		fontWeight: "600",
		color: Colors.text.primary,
	},
	subtitle: {
		fontSize: FontSizes.sm,
		color: Colors.text.muted,
		marginTop: Spacing.xs,
	},
});
