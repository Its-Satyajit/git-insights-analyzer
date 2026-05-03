import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Contributor } from "@git-insights/api";
import { Badge, Card, Skeleton, Stat } from "~/components/ui";
import { ActivityHeatmap, ContributorChart } from "~/components/viz";
import { useContributors, useDashboard, useTopRepos } from "~/hooks";
import { BorderRadius, Colors, FontSizes, Spacing } from "~/utils/theme";

export default function AnalyticsScreen() {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const params = useLocalSearchParams();
	const repoId = (params.id as string) || undefined;

	const { data: allRepos } = useTopRepos(10);
	const selectedRepoId = repoId || allRepos?.[0]?.id;

	const { data: dashboard, isFetching } = useDashboard(selectedRepoId ?? "");
	const { data: contributors } = useContributors(
		selectedRepoId ?? "contributions",
		"contributions",
		8,
	);

	const [activeTab, setActiveTab] = useState<
		"overview" | "contributors" | "activity"
	>("overview");

	if (!selectedRepoId) {
		return (
			<View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
				<Text style={styles.emptyText}>
					Select a repository to view analytics
				</Text>
			</View>
		);
	}

	const chartWidth = width - Spacing.lg * 2;

	return (
		<ScrollView
			contentContainerStyle={{
				paddingTop: insets.top + Spacing.lg,
				paddingBottom: insets.bottom + Spacing["4xl"],
			}}
			refreshControl={
				<RefreshControl
					onRefresh={() => {}}
					refreshing={isFetching}
					tintColor={Colors.accent.primary}
				/>
			}
		>
			<View style={styles.header}>
				<Text style={styles.title}>
					{dashboard?.owner}/{dashboard?.name ?? "Analytics"}
				</Text>
			</View>

			{isFetching ? (
				<View style={styles.content}>
					<Skeleton height={120} style={{ marginBottom: Spacing.md }} />
					<Skeleton height={200} style={{ marginBottom: Spacing.md }} />
					<Skeleton height={150} />
				</View>
			) : (
				<>
					<View style={styles.tabs}>
						{(["overview", "contributors", "activity"] as const).map((tab) => (
							<TouchableOpacity
								key={tab}
								onPress={() => {
									void Haptics.selectionAsync();
									setActiveTab(tab);
								}}
								style={[styles.tab, activeTab === tab && styles.tabActive]}
							>
								<Text
									style={[
										styles.tabText,
										activeTab === tab && styles.tabTextActive,
									]}
								>
									{tab.charAt(0).toUpperCase() + tab.slice(1)}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					<View style={styles.content}>
						{activeTab === "overview" && (
							<>
								<Card style={styles.card}>
									<View style={styles.statsRow}>
										<Stat
											label="Files"
											value={dashboard?.totalFiles ?? 0}
										/>
										<Stat
											label="Dirs"
											value={dashboard?.totalDirectories ?? 0}
										/>
										<Stat
											label="Lines"
											value={dashboard?.totalLines ?? 0}
										/>
									</View>
								</Card>

								<Card style={styles.card}>
									<View style={styles.statsRow}>
										<Stat label="Stars" value={dashboard?.stars ?? 0} />
										<Stat label="Forks" value={dashboard?.forks ?? 0} />
										<Stat
											label="Contributors"
											value={dashboard?.contributorCount ?? 0}
										/>
									</View>
								</Card>

								{dashboard?.fileTypeBreakdown && (
									<Card style={styles.card} title="File Types">
										{Object.entries(dashboard.fileTypeBreakdown)
											.sort(
												(
													[, a]: [string, number],
													[, b]: [string, number],
												) => b - a,
											)
											.slice(0, 8)
											.map(([ext, count]: [string, number]) => (
												<View key={ext} style={styles.fileTypeRow}>
													<Text style={styles.fileTypeExt}>
														.{ext}
													</Text>
													<View style={styles.fileTypeBar}>
														<View
															style={[
																styles.fileTypeFill,
																{
																	width: `${(count / (dashboard.totalFiles ?? 1)) * 100}%`,
																},
															]}
														/>
													</View>
													<Text style={styles.fileTypeCount}>
														{count}
													</Text>
												</View>
											))}
									</Card>
								)}
							</>
						)}

						{activeTab === "contributors" && (
							<Card style={styles.card} title="Top Contributors">
								{contributors && contributors.length > 0 ? (
									<>
										<ContributorChart
											contributors={contributors}
											size={chartWidth - Spacing.lg * 2}
										/>
										<View style={styles.contribList}>
											{contributors.slice(0, 5).map((c: Contributor, i: number) => (
												<View key={c.id} style={styles.contribRow}>
													<Text style={styles.contribRank}>{i + 1}</Text>
													<View style={styles.contribInfo}>
														<Text style={styles.contribName}>
															{c.githubLogin}
														</Text>
														<Text style={styles.contribDate}>
															{c.lastContributionAt
																? `Last: ${new Date(c.lastContributionAt).toLocaleDateString()}`
																: "No recent activity"}
														</Text>
													</View>
													<Badge
														label={`${c.contributions}`}
														variant="info"
													/>
												</View>
											))}
										</View>
									</>
								) : (
									<Text style={styles.emptyText}>
										No contributor data available
									</Text>
								)}
							</Card>
						)}

						{activeTab === "activity" && (
							<Card style={styles.card} title="Commit Activity">
								{dashboard?.commits && dashboard.commits.length > 0 ? (
									<>
										<ActivityHeatmap
											data={generateActivityData(dashboard.commits)}
											cellSize={12}
											gap={3}
										/>
										<View style={styles.activityLegend}>
											<View style={styles.legendItem}>
												<View
													style={[
														styles.legendDot,
														{ backgroundColor: Colors.surfaceElevated },
													]}
												/>
												<Text style={styles.legendText}>None</Text>
											</View>
											<View style={styles.legendItem}>
												<View
													style={[
														styles.legendDot,
														{ backgroundColor: "#0e4429" },
													]}
												/>
												<Text style={styles.legendText}>Low</Text>
											</View>
											<View style={styles.legendItem}>
												<View
													style={[
														styles.legendDot,
														{ backgroundColor: "#166534" },
													]}
												/>
												<Text style={styles.legendText}>Medium</Text>
											</View>
											<View style={styles.legendItem}>
												<View
													style={[
														styles.legendDot,
														{ backgroundColor: "#22c55e" },
													]}
												/>
												<Text style={styles.legendText}>High</Text>
											</View>
										</View>
									</>
								) : (
									<Text style={styles.emptyText}>
										No commit activity data available
									</Text>
								)}
							</Card>
						)}
					</View>
				</>
			)}
		</ScrollView>
	);
}

function generateActivityData(commits: { date: string }[]): number[] {
	const data = new Array(84).fill(0);
	const now = new Date();

	for (const commit of commits) {
		const date = new Date(commit.date);
		const daysAgo = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
		);
		if (daysAgo < 84 && daysAgo >= 0) {
			data[83 - daysAgo]++;
		}
	}

	return data;
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
	title: {
		fontSize: FontSizes["2xl"],
		fontWeight: "700",
		color: Colors.text.primary,
	},
	tabs: {
		flexDirection: "row",
		paddingHorizontal: Spacing.lg,
		marginBottom: Spacing.lg,
		gap: Spacing.sm,
	},
	tab: {
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: BorderRadius.full,
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	tabActive: {
		backgroundColor: Colors.accent.primary,
		borderColor: Colors.accent.primary,
	},
	tabText: {
		fontSize: FontSizes.sm,
		color: Colors.text.secondary,
		fontWeight: "500",
	},
	tabTextActive: {
		color: "#000",
		fontWeight: "600",
	},
	content: {
		paddingHorizontal: Spacing.lg,
		gap: Spacing.lg,
	},
	card: {
		marginBottom: 0,
	},
	statsRow: {
		flexDirection: "row",
		gap: Spacing.md,
	},
	fileTypeRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.sm,
	},
	fileTypeExt: {
		fontSize: FontSizes.sm,
		color: Colors.text.primary,
		width: 50,
		fontWeight: "500",
	},
	fileTypeBar: {
		flex: 1,
		height: 8,
		backgroundColor: Colors.surfaceElevated,
		borderRadius: 4,
		marginHorizontal: Spacing.sm,
	},
	fileTypeFill: {
		height: "100%",
		backgroundColor: Colors.accent.primary,
		borderRadius: 4,
	},
	fileTypeCount: {
		fontSize: FontSizes.sm,
		color: Colors.text.secondary,
		width: 30,
		textAlign: "right",
	},
	contribList: {
		marginTop: Spacing.lg,
	},
	contribRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: Spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: Colors.border,
	},
	contribRank: {
		fontSize: FontSizes.md,
		fontWeight: "700",
		color: Colors.accent.primary,
		width: 24,
		textAlign: "center",
	},
	contribInfo: {
		flex: 1,
		marginLeft: Spacing.sm,
	},
	contribName: {
		fontSize: FontSizes.md,
		color: Colors.text.primary,
		fontWeight: "500",
	},
	contribDate: {
		fontSize: FontSizes.xs,
		color: Colors.text.muted,
	},
	activityLegend: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Spacing.lg,
		marginTop: Spacing.lg,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	legendDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	legendText: {
		fontSize: FontSizes.xs,
		color: Colors.text.secondary,
	},
	emptyText: {
		fontSize: FontSizes.md,
		color: Colors.text.muted,
		textAlign: "center",
		paddingVertical: Spacing["4xl"],
	},
});
