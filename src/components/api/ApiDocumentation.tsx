import React from 'react'
export const ApiDocumentation: React.FC = () => {
  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="text-lg font-medium text-card-foreground mb-4">API Documentation</h3>
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-card-foreground font-medium mb-2">Base URL</h4>
        <code className="text-blue-400 bg-muted px-2 py-1 rounded text-sm">
          https://fgdoogejjvoovxbtnnxk.supabase.co/functions/v1/api
        </code>

        <h4 className="text-card-foreground font-medium mb-2 mt-4">Authentication</h4>
        <p className="text-muted-foreground text-sm mb-2">Include your API key in the Authorization header:</p>
        <code className="text-green-400 bg-muted px-2 py-1 rounded text-sm block">
          Authorization: Bearer YOUR_API_KEY
        </code>

        <h4 className="text-card-foreground font-medium mb-2 mt-4">Available Endpoints</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">POST</span>
            <code className="text-blue-400">/analyze</code>
            <span className="text-muted-foreground">- Analyze React code files</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">GET</span>
            <code className="text-blue-400">/projects</code>
            <span className="text-muted-foreground">- List your analysis projects</span>
          </div>
          <div className="flex items-center space-x-2"><span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">GET</span>
            <code className="text-blue-400">/projects/:id</code>
            <span className="text-muted-foreground">- Get specific project details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
