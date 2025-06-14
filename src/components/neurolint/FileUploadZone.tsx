
import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  onFile: (code: string) => void;
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
        onFile(ev.target.result);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg bg-white/50 py-12 flex flex-col items-center justify-center text-center shadow hover:bg-white/70 transition-all cursor-pointer ${
        processing ? "opacity-50 pointer-events-none" : ""
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={e => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      tabIndex={0}
      role="button"
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
      <div className="text-2xl font-semibold mb-2 select-none">Drag & Drop your file here</div>
      <div className="text-sm text-muted-foreground mb-4 select-none">
        or click to browse ({processing ? "Processing..." : ".js, .jsx, .ts, .tsx supported"})
      </div>
      <Button variant="outline" disabled={processing}>
        Select File
      </Button>
    </div>
  );
}
