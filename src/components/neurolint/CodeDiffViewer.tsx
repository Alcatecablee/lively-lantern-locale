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
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border rounded-lg bg-white/60">
        <FileText className="mb-2 opacity-40" />
        <div>No file selected.<br /><span className="text-xs text-muted-foreground">Choose or drop a file to begin diffing!</span></div>
      </div>
    );

  if (loading)
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center animate-pulse text-muted-foreground border rounded-lg bg-white/60">
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
    <div className="min-h-[300px] border rounded-lg bg-white/70 p-0 overflow-auto max-h-[60vh] shadow group transition-all">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white/80 backdrop-blur rounded-t-lg">
        <div className="flex gap-2 items-center">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-semibold text-muted-foreground">Code Diff</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-muted"
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
        useDarkTheme={false}
        renderContent={highlighted}
        styles={{
          contentText: { fontFamily: "Menlo, Monaco, monospace", fontSize: 13 },
          // Removed 'removedLine' and 'addedLine' as they're not valid keys
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
  // Could swap with 'prism-react-renderer' for real syntax
  const keywords = [
    "const", "let", "var", "export", "import", "function", "async", "await",
    "return", "if", "else", "for", "while", "switch", "case", "default", "new",
    "class", "extends", "super", "try", "catch", "typeof", "in", "instanceof", "this",
  ];
  let html = str
    .replace(/(".*?"|'.*?'|`.*?`)/g, m => `<span style="color:#999;">${m}</span>`)
    .replace(/\b\d+(\.\d+)?\b/g, '<span style="color:#a67;">$&</span>')
    .replace(new RegExp("\\b(" + keywords.join("|") + ")\\b", "g"), '<span style="color:#076;">$1</span>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
