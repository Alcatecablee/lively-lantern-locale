import React, { useRef } from "react";
import DiffViewer from "react-diff-viewer";
import { Button } from "@/components/ui/button";
import { FileText, FilePlus, Copy as CopyIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/lib/neurolint/clipboard";

interface CodeDiffViewerProps {
  original: string;
  transformed: string;
  loading?: boolean;
}

export function CodeDiffViewer({ original, transformed, loading }: CodeDiffViewerProps) {
  const originalRef = useRef<HTMLDivElement>(null);
  const transformedRef = useRef<HTMLDivElement>(null);

  if (!original && !loading)
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border border-[#292939] rounded-lg bg-[#191B22]/90 shadow-cursor-glass">
        <FileText className="mb-2 opacity-40" />
        <div>
          No file selected.<br />
          <span className="text-xs text-muted-foreground">Choose or drop a file to begin diffing!</span>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center animate-pulse text-muted-foreground border border-[#292939] rounded-lg bg-[#191B22]/90 shadow-cursor-glass">
        <FilePlus className="mr-2 animate-bounce" />
        <span>Processing...</span>
      </div>
    );

  const handleCopy = async () => {
    const diffText = `--- Original ---\n${original}\n\n--- Transformed ---\n${transformed}`;
    await copyToClipboard(diffText);
    toast({
      title: "Diff copied!",
      description: "The code diff is now in your clipboard.",
    });
  };

  return (
    <div className="min-h-[300px] bg-[#16171c]/90 border border-[#292939] rounded-lg py-2 px-0 overflow-auto max-h-[60vh] shadow-cursor-glass group transition-all font-mono backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#232339] bg-[#1a1c22]/95 rounded-t-lg backdrop-blur font-sans">
        <div className="flex gap-2 items-center">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Code Diff</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-accent/30 text-muted-foreground"
          aria-label="Copy code diff"
          onClick={handleCopy}
        >
          <CopyIcon className="w-4 h-4" />
        </Button>
      </div>
      <DiffViewer
        oldValue={original}
        newValue={transformed}
        splitView={true}
        hideLineNumbers={false}
        showDiffOnly={false}
        useDarkTheme={true}
        renderContent={highlighted}
        styles={{
          diffContainer: {
            background: "rgba(22, 23, 28, 0.94)",
            borderRadius: "0 0 12px 12px",
          },
          contentText: { fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#d6e3ff" },
          gutter: { background: "rgba(30,34,48,0.93)", color: "#565b7c" },
        }}
      />
    </div>
  );
}

// Simple syntax highlighter (basic)
function highlighted(str: string | undefined) {
  if (typeof str !== "string") {
    return <span />;
  }
  // rudimentary: keywords in JS/TS colored, strings/nums bolded
  const keywords = [
    "const", "let", "var", "export", "import", "function", "async", "await",
    "return", "if", "else", "for", "while", "switch", "case", "default", "new",
    "class", "extends", "super", "try", "catch", "typeof", "in", "instanceof", "this",
  ];
  let html = str
    .replace(/(".*?"|'.*?'|`.*?`)/g, m => `<span style="color:#9bfaff;">${m}</span>`)
    .replace(/\b\d+(\.\d+)?\b/g, '<span style="color:#ffc587;">$&</span>')
    .replace(new RegExp("\\b(" + keywords.join("|") + ")\\b", "g"), '<span style="color:#76ffd7;">$1</span>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
