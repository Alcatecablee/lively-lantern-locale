import { useState } from 'react';

export const useAnalyzer = () => {
  const [analysis] = useState(null);
  const [isAnalyzing] = useState(false);
  const [uploadedFiles] = useState([]);
  const [fixedFiles] = useState(new Map());

  return {
    analysis,
    isAnalyzing,
    uploadedFiles,
    fixedFiles,
    handleFilesSelected: () => {},
    handleFixIssue: () => {},
    handleFixAll: () => {},
    downloadFixedFiles: () => {},
    resetAnalysis: () => {}
  };
};
