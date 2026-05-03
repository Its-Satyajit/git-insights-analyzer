import React from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { Colors, FontSizes } from "../../utils/theme";

interface StatProps {
	label: string;
	value: string | number;
	suffix?: string;
	style?: TextStyle;
}

export function Stat({ label, value, suffix, style }: StatProps) {
	return (
		<Text style={[styles.stat, style]}>
			<Text style={styles.value}>
				{typeof value === "number" ? formatNumber(value) : value}
				{suffix && <Text style={styles.suffix}>{suffix}</Text>}
			</Text>
			{"\n"}
			<Text style={styles.label}>{label}</Text>
		</Text>
	);
}

function formatNumber(num: number): string {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
	return num.toString();
}

const styles = StyleSheet.create({
	stat: {
		flex: 1,
	},
	value: {
		fontSize: FontSizes["2xl"],
		fontWeight: "700",
		color: Colors.accent.primary,
	},
	suffix: {
		fontSize: FontSizes.md,
		color: Colors.text.secondary,
	},
	label: {
		fontSize: FontSizes.xs,
		color: Colors.text.muted,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
