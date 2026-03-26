"use client";

import { Check, Circle, Loader2, X } from "lucide-react";
import React from "react";
import { type AnalysisStatus, useRepoStatus } from "~/hooks/useRepoStatus";

const PHASES = [
	{ key: "queued", label: "Queued" },
	{ key: "fetching", label: "Fetching" },
	{ key: "basic-analysis", label: "Basic" },
	{ key: "dependency-analysis", label: "Dependencies" },
	{ key: "complete", label: "Complete" },
];

const STATUS_ORDER = [
	"queued",
	"fetching",
	"basic-analysis",
	"dependency-analysis",
	"complete",
];

function getPhaseIndex(status: AnalysisStatus): number {
	const idx = STATUS_ORDER.indexOf(status);
	return idx === -1 ? 0 : idx;
}

const PhaseItem = React.memo(function PhaseItem({
	phase,
	isActive,
	isComplete,
	isFailed,
	index,
}: {
	phase: (typeof PHASES)[number];
	isActive: boolean;
	isComplete: boolean;
	isFailed: boolean;
	index: number;
}) {
	return (
		<div className="flex items-center gap-0">
			{index > 0 && (
				<div className={`h-px w-6 ${isComplete ? "bg-accent" : "bg-border"}`} />
			)}
			<div className="flex items-center gap-1.5 py-1.5">
				{isComplete ? (
					<Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
				) : isFailed ? (
					<X className="h-3 w-3 text-destructive" strokeWidth={2.5} />
				) : isActive ? (
					<Loader2 className="h-3 w-3 animate-spin text-foreground" />
				) : (
					<Circle className="h-2.5 w-2.5 text-border" />
				)}
				<span
					className={`font-mono text-[10px] uppercase tracking-wider ${
						isActive
							? "text-foreground"
							: isComplete
								? "text-accent"
								: "text-muted-foreground"
					}`}
				>
					{phase.label}
				</span>
			</div>
		</div>
	);
});

export const AnalysisProgress = React.memo(function AnalysisProgress({
	repoId,
}: {
	repoId: string;
}) {
	const { data: status, isLoading, error } = useRepoStatus(repoId);

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-muted-foreground">
				<Loader2 className="h-3 w-3 animate-spin" />
				<span className="font-mono text-[10px] uppercase tracking-wider">
					Checking...
				</span>
			</div>
		);
	}

	if (error || !status) {
		return (
			<div className="flex items-center gap-2 text-destructive">
				<X className="h-3 w-3" />
				<span className="font-mono text-[10px] uppercase tracking-wider">
					Status check failed
				</span>
			</div>
		);
	}

	if (status.status === "failed") {
		return (
			<div className="flex items-center gap-2 text-destructive">
				<X className="h-3 w-3" />
				<span className="font-mono text-[10px] uppercase tracking-wider">
					Failed: {status.phase}
				</span>
			</div>
		);
	}

	if (status.status === "complete") {
		return (
			<div className="flex items-center gap-2">
				<Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
				<span className="font-mono text-[10px] text-accent uppercase tracking-wider">
					Analysis complete
				</span>
			</div>
		);
	}

	const currentPhaseIndex = getPhaseIndex(status.status);

	return (
		<div className="flex flex-wrap items-center gap-1">
			{PHASES.slice(0, -1).map((phase, idx) => (
				<PhaseItem
					index={idx}
					isActive={idx === currentPhaseIndex}
					isComplete={idx < currentPhaseIndex}
					isFailed={false}
					key={phase.key}
					phase={phase}
				/>
			))}
		</div>
	);
});
