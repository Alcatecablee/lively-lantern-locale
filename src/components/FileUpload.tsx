import { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = ".js,.jsx,.ts,.tsx",
  multiple = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    const allowedTypes = ['.js', '.jsx', '.ts', '.tsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return { isValid: false, error: 'Invalid file type. Only JS, JSX, TS, TSX files are allowed.' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return { isValid: false, error: 'File size exceeds 5MB limit.' };
    }

    return { isValid: true };
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);

    try {
      const validatedFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validatedFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (errors.length > 0) {
        toast({
          title: "File Validation Error",
          description: errors.join('\n'),
          variant: "destructive",
        });
      }

      if (validatedFiles.length > 0) {
        setSelectedFiles(validatedFiles);
        onFilesSelected(validatedFiles);

        toast({
          title: "Files Uploaded",
          description: `${validatedFiles.length} files uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to process files",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, []);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200",
          dragActive 
            ? "border-blue-400 bg-blue-500/10" 
            : "border-gray-700 hover:border-gray-600 bg-gray-900/50 backdrop-blur-sm",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        role="button"
        aria-label="File upload area"
        tabIndex={0}
      >
        <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" aria-hidden="true" />
        <p className="text-2xl font-semibold text-white mb-3">
          {isProcessing ? 'Processing files...' : 'Drop React files here'}
        </p>
        <p className="text-gray-400 mb-6 text-lg">
          or click to browse (.js, .jsx, .ts, .tsx files)
        </p>
        <input
          type="file"
          accept={acceptedFileTypes}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
          aria-label="Select files for upload"
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          Select Files
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center text-white text-lg">
            <File className="h-5 w-5 mr-2 text-blue-400" />
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto" role="list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3" role="listitem">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
                  <span className="text-white font-medium">{file.name}</span>
                  <span className="text-gray-400 text-sm">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  disabled={isProcessing}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};