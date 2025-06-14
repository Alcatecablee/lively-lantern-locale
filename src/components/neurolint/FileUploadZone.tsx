
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileCode, Zap, Code } from "lucide-react";

interface FileUploadZoneProps {
  onFile: (code: string, fileName?: string) => void;
  processing?: boolean;
}

export function FileUploadZone({ onFile, processing }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pastedCode, setPastedCode] = useState("");

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        onFile(ev.target.result, file.name);
        setPastedCode(""); // Clear textarea when file is uploaded
      }
    };
    reader.readAsText(file);
  }

  const handlePastedCodeSubmit = () => {
    if (pastedCode.trim()) {
      onFile(pastedCode, "pasted-code.tsx");
      setPastedCode("");
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Zone */}
      <div
        className={`border-2 border-dashed border-purple-500/30 rounded-lg bg-gradient-to-br from-purple-500/5 to-blue-500/5 py-8 flex flex-col items-center justify-center text-center shadow hover:border-purple-500/50 transition-all cursor-pointer ${
          processing ? "opacity-50 pointer-events-none animate-pulse" : ""
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload code file for transformation"
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept=".js,.jsx,.ts,.tsx"
          onChange={e => handleFiles(e.target.files)}
          disabled={processing}
          aria-label="Upload JS, JSX, TS, or TSX file"
        />
        
        <div className="flex items-center gap-3 mb-3">
          {processing ? (
            <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
          ) : (
            <FileCode className="w-6 h-6 text-purple-400" />
          )}
          <div className="text-xl font-semibold mb-0 select-none text-white">
            {processing ? "Transforming with AI..." : "Drop your code file here"}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mb-3 select-none max-w-md">
          {processing ? (
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">Running 6-layer transformation pipeline</span>
            </div>
          ) : (
            <>
              Advanced AI analysis for <strong>React, Next.js, TypeScript</strong> files
              <br />
              <span className="text-xs">(.js, .jsx, .ts, .tsx supported)</span>
            </>
          )}
        </div>
        
        {!processing && (
          <Button variant="outline" className="border-purple-500/50 hover:bg-purple-500/10">
            <Upload className="w-4 h-4 mr-2" />
            Select File
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-purple-500/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#22242B] px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Code Paste Zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Code className="w-5 h-5 text-purple-400" />
          <span className="font-semibold">Paste your code directly</span>
        </div>
        
        <Textarea
          placeholder="Paste your React, TypeScript, or JavaScript code here..."
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          className="min-h-[120px] bg-[#16171c]/90 border-purple-500/30 text-white placeholder:text-muted-foreground font-mono text-sm resize-none focus:border-purple-500/50"
          disabled={processing}
        />
        
        <Button
          onClick={handlePastedCodeSubmit}
          disabled={!pastedCode.trim() || processing}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Zap className="w-4 h-4 mr-2" />
          Transform Code
        </Button>
      </div>
    </div>
  );
}
