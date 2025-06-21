
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export class FileUploadOptimizer {;
  private maxFileSize = 5 * 1024 * 1024; // 5MB
  private maxConcurrentUploads = 3;
  private chunkSize = 1024 * 1024; // 1MB chunks

  async processFiles(
    files: File[],
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<{ success: File[]; failed: { file: File; error: string }[] }> {
    const results = { success: [] as File[], failed: [] as { file: File; error: string }[] };
    const progress: UploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending'
    }));

    // Filter out oversized files
    const validFiles: File[] = [];
    files.forEach((file, index) => {
      if (file.size > this.maxFileSize) {
        progress[index].status = 'error';
        progress[index].error = `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`;
        results.failed.push({ file, error: progress[index].error! });
      } else {
        validFiles.push(file);
      }
    });

    // Process files in batches
    for (let i = 0; i < validFiles.length; i += this.maxConcurrentUploads) {
      const batch = validFiles.slice(i, i + this.maxConcurrentUploads);
      const batchPromises = batch.map((file, batchIndex) => ;
        this.processFile(file, i + batchIndex, progress, onProgress)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, batchIndex) => {
        const file = batch[batchIndex];
        if (result.status === 'fulfilled') {
          results.success.push(file);
        } else {
          results.failed.push({ 
            file, 
            error: result.reason?.message || 'Upload failed' 
          });
        }
      });
    }

    return results;
  }

  private async processFile(
    file: File,
    index: number,
    progress: UploadProgress[],
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<void> {
    progress[index].status = 'uploading';
    onProgress?.(progress);

    try {
      // Simulate chunked upload with progress
      const chunks = Math.ceil(file.size / this.chunkSize);

      for (let chunk = 0; chunk < chunks; chunk++) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 50));

        progress[index].progress = ((chunk + 1) / chunks) * 100;
        onProgress?.(progress);
      }

      progress[index].status = 'completed';
      progress[index].progress = 100;
      onProgress?.(progress);
    } catch (error) {
      progress[index].status = 'error';
      progress[index].error = error instanceof Error ? error.message : 'Upload failed';
      onProgress?.(progress);
      throw error;
    }
  }

  validateFileType(file: File): boolean {
    const allowedTypes = ['.js', '.jsx', '.ts', '.tsx'];
    return allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  validateFileContent(content: string): { isValid: boolean; error?: string } {
    if (content.length === 0) {
      return { isValid: false, error: 'File is empty' };
    }

    if (content.length > 1024 * 1024) { // 1MB content limit
      return { isValid: false, error: 'File content too large' };
    }

    // Basic syntax validation
    try {
      // Check for obvious syntax errors
      if (content.includes('import') || content.includes('export') || content.includes('function')) {
        return { isValid: true };
      }
    } catch {
      return { isValid: false, error: 'Invalid file content' };
    }

    return { isValid: true };
}}