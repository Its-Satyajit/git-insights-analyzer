import React from "react";
import {
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import { BorderRadius, Colors, FontSizes, Spacing } from "../../utils/theme";

interface BadgeProps {
	label: string;
	variant?: "default" | "success" | "warning" | "error" | "info";
	style?: ViewStyle;
}

const variantConfig = {
	default: { bg: Colors.surfaceElevated, text: Colors.text.secondary },
	success: { bg: "#166534", text: Colors.status.success },
	warning: { bg: "#422006", text: Colors.status.warning },
	error: { bg: "#450a0a", text: Colors.status.error },
	info: { bg: "#172554", text: Colors.status.info },
};

export function Badge({ label, variant = "default", style }: BadgeProps) {
	const config = variantConfig[variant];

	return (
		<View style={[styles.badge, { backgroundColor: config.bg }, style]}>
			<Text style={[styles.text, { color: config.text }]}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs,
		borderRadius: BorderRadius.full,
		alignSelf: "flex-start",
	},
	text: {
		fontSize: FontSizes.xs,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
