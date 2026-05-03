import React from "react";
import {
	StyleSheet,
	TextInput,
	type TextInputProps,
	View,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import { BorderRadius, Colors, FontSizes, Spacing } from "../../utils/theme";

interface SearchInputProps extends TextInputProps {
	containerStyle?: StyleProp<ViewStyle>;
	onClear?: () => void;
}

export function SearchInput({ containerStyle, onClear, ...props }: SearchInputProps) {
	return (
		<View style={[styles.container, containerStyle]}>
			<TextInput
				clearButtonMode="while-editing"
				placeholder="Search repositories..."
				placeholderTextColor={Colors.text.muted}
				style={styles.input}
				{...props}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.surface,
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	input: {
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.lg,
		fontSize: FontSizes.md,
		color: Colors.text.primary,
	},
});
