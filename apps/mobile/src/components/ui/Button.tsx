import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	type ViewStyle,
} from "react-native";
import { BorderRadius, Colors, FontSizes, Spacing } from "../../utils/theme";

interface ButtonProps {
	onPress: () => void;
	title: string;
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	loading?: boolean;
	style?: ViewStyle;
}

export function Button({
	onPress,
	title,
	variant = "primary",
	size = "md",
	disabled = false,
	loading = false,
	style,
}: ButtonProps) {
	const variantStyles = {
		primary: {
			container: styles.primaryContainer,
			text: styles.primaryText,
		},
		secondary: {
			container: styles.secondaryContainer,
			text: styles.secondaryText,
		},
		ghost: {
			container: styles.ghostContainer,
			text: styles.ghostText,
		},
	};

	const sizeStyles = {
		sm: { container: styles.smContainer, text: styles.smText },
		md: { container: styles.mdContainer, text: styles.mdText },
		lg: { container: styles.lgContainer, text: styles.lgText },
	};

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			disabled={disabled || loading}
			onPress={onPress}
			style={[
				styles.button,
				variantStyles[variant].container,
				sizeStyles[size].container,
				disabled && styles.disabled,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator
					color={variant === "primary" ? "#000" : Colors.accent.primary}
				/>
			) : (
				<Text
					style={[
						styles.text,
						variantStyles[variant].text,
						sizeStyles[size].text,
					]}
				>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryContainer: {
		backgroundColor: Colors.accent.primary,
	},
	secondaryContainer: {
		backgroundColor: Colors.surfaceElevated,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	ghostContainer: {
		backgroundColor: "transparent",
	},
	primaryText: {
		color: "#000",
	},
	secondaryText: {
		color: Colors.text.primary,
	},
	ghostText: {
		color: Colors.accent.primary,
	},
	smContainer: {
		paddingVertical: Spacing.xs,
		paddingHorizontal: Spacing.md,
	},
	mdContainer: {
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.lg,
	},
	lgContainer: {
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xl,
	},
	smText: {
		fontSize: FontSizes.sm,
	},
	mdText: {
		fontSize: FontSizes.md,
	},
	lgText: {
		fontSize: FontSizes.lg,
	},
	text: {
		fontWeight: "600",
	},
	disabled: {
		opacity: 0.5,
	},
});
