
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FilePlus, Copy as CopyIcon, ArrowDown, Download } from "lucide-react";
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

  const handleCopyOriginal = async () => {
    await copyToClipboard(original);
    toast({
      title: "Original code copied!",
      description: "The original code is now in your clipboard.",
    });
  };

  const handleCopyTransformed = async () => {
    await copyToClipboard(transformed);
    toast({
      title: "Transformed code copied!",
      description: "The transformed code is now in your clipboard.",
    });
  };

  const handleDownloadOriginal = () => {
    const blob = new Blob([original], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'original-code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Original code downloaded!",
      description: "The original code has been saved to your downloads.",
    });
  };

  const handleDownloadTransformed = () => {
    const blob = new Blob([transformed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed-code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Fixed code downloaded!",
      description: "The transformed code has been saved to your downloads.",
    });
  };

  return (
    <div className="h-[85vh] bg-[#16171c]/90 border border-[#292939] rounded-lg overflow-hidden shadow-cursor-glass group transition-all font-mono backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#232339] bg-[#1a1c22]/95 rounded-t-lg backdrop-blur font-sans flex-shrink-0">
        <div className="flex gap-2 items-center">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Code Comparison</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Transformed Code Panel (Top Half) */}
        <div className="flex-1 border-b border-[#232339] flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1f2a1f] border-b border-[#2f3a2f] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-green-200">Transformed</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-green-500/20 text-green-300 h-6 w-6"
                aria-label="Copy transformed code"
                onClick={handleCopyTransformed}
              >
                <CopyIcon className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-green-500/20 text-green-300 h-6 w-6"
                aria-label="Download transformed code"
                onClick={handleDownloadTransformed}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-[#141a14] min-h-0">
            <pre className="text-sm text-green-100 whitespace-pre-wrap">
              <code>{highlighted(transformed)}</code>
            </pre>
          </div>
        </div>

        {/* Transformation Arrow */}
        <div className="flex justify-center py-2 bg-[#1a1c22]/95 flex-shrink-0">
          <div className="bg-purple-500/90 rounded-full p-2 shadow-lg backdrop-blur">
            <ArrowDown className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Original Code Panel (Bottom Half) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-[#2a1f1f] border-b border-[#3a2f2f] flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm font-medium text-red-200">Original</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-500/20 text-red-300 h-6 w-6"
                aria-label="Copy original code"
                onClick={handleCopyOriginal}
              >
                <CopyIcon className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-500/20 text-red-300 h-6 w-6"
                aria-label="Download original code"
                onClick={handleDownloadOriginal}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-[#1a1416] min-h-0">
            <pre className="text-sm text-red-100 whitespace-pre-wrap">
              <code>{highlighted(original)}</code>
            </pre>
          </div>
        </div>
      </div>
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
