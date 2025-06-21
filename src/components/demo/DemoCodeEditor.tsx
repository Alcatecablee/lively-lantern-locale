import React from 'react';
import Editor from '@monaco-editor/react';

interface DemoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export const DemoCodeEditor: React.FC<DemoCodeEditorProps> = ({
  value,
  onChange,
  language = 'typescript'
}) => {
  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height="400px"
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  );
};