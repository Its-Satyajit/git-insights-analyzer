"use client";

import { CheckCircle, Circle, Loader2, XCircle } from "lucide-react";
import React from "react";
import { type AnalysisStatus, useRepoStatus } from "~/hooks/useRepoStatus";

const PHASES = [
  { key: "queued", label: "Queued" },
  { key: "fetching", label: "Fetching repository data" },
  { key: "basic-analysis", label: "Basic analysis" },
  { key: "dependency-analysis", label: "Dependency analysis" },
  { key: "complete", label: "Complete" },
];

const STATUS_ORDER = ["queued", "fetching", "basic-analysis", "dependency-analysis", "complete"];

function getPhaseIndex(status: AnalysisStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

const PhaseItem = React.memo(function PhaseItem({
  phase,
  isActive,
  isComplete,
  isFailed,
}: {
  phase: (typeof PHASES)[number];
  isActive: boolean;
  isComplete: boolean;
  isFailed: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {isComplete ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : isFailed ? (
        <XCircle className="h-5 w-5 text-red-500" />
      ) : isActive ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      ) : (
        <Circle className="h-5 w-5 text-gray-300" />
      )}
      <span
        className={`text-sm ${
          isActive
            ? "font-medium text-foreground"
            : isComplete
              ? "text-green-600"
              : "text-muted-foreground"
        }`}
      >
        {phase.label}
      </span>
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
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking analysis status...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="h-4 w-4" />
        <span className="text-sm">Unable to check analysis status. Please refresh.</span>
      </div>
    );
  }

  if (status.status === "failed") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">Analysis Failed</span>
        </div>
        <p className="mt-1 text-red-600/80 text-sm">{status.phase}</p>
      </div>
    );
  }

  if (status.status === "complete") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Analysis Complete</span>
        </div>
        {status.analysis && (
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Files</span>
              <p className="font-medium">{status.analysis.totalFiles?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Directories</span>
              <p className="font-medium">{status.analysis.totalDirectories?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Lines</span>
              <p className="font-medium">{status.analysis.totalLines?.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentPhaseIndex = getPhaseIndex(status.status);

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-medium">Analyzing Repository</span>
      </div>
      <p className="mt-1 text-blue-600/80 text-sm">{status.phase}</p>
      <div className="mt-4 space-y-2">
        {PHASES.slice(0, -1).map((phase, idx) => (
          <PhaseItem
            isActive={idx === currentPhaseIndex}
            isComplete={idx < currentPhaseIndex}
            isFailed={false}
            key={phase.key}
            phase={phase}
          />
        ))}
      </div>
    </div>
  );
});
