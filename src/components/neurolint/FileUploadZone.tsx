
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Zap } from "lucide-react";

interface FileUploadZoneProps {
  onFile: (code: string, fileName?: string) => void;
  processing?: boolean;
}

export function FileUploadZone({ onFile, processing }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        onFile(ev.target.result, file.name);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div
      className={`border-2 border-dashed border-purple-500/30 rounded-lg bg-gradient-to-br from-purple-500/5 to-blue-500/5 py-12 flex flex-col items-center justify-center text-center shadow hover:border-purple-500/50 transition-all cursor-pointer ${
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
      
      <div className="flex items-center gap-3 mb-4">
        {processing ? (
          <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
        ) : (
          <FileCode className="w-8 h-8 text-purple-400" />
        )}
        <div className="text-2xl font-semibold mb-0 select-none text-white">
          {processing ? "Transforming with AI..." : "Drop your code here"}
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4 select-none max-w-md">
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
  );
}
