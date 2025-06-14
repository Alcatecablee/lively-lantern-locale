
import React from "react";
import DiffViewer from "react-diff-viewer";

interface CodeDiffViewerProps {
  original: string;
  transformed: string;
  loading?: boolean;
}

export function CodeDiffViewer({ original, transformed, loading }: CodeDiffViewerProps) {
  if (!original && !loading)
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg bg-white/60">
        No file selected.
      </div>
    );
  if (loading)
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center animate-pulse text-muted-foreground border rounded-lg bg-white/60">
        Processing...
      </div>
    );
  return (
    <div className="min-h-[300px] border rounded-lg bg-white/60 p-2 overflow-auto max-h-[60vh]">
      <DiffViewer
        oldValue={original}
        newValue={transformed}
        splitView={true}
        hideLineNumbers={false}
        showDiffOnly={false}
        styles={{
          diffViewer: { background: "transparent", fontSize: 14 },
          lineNumber: { minWidth: 30, color: "#888" },
        }}
      />
    </div>
  );
}
