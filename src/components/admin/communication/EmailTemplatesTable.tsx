import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { parseVariables } from './utils'
interface EmailTemplatesTableProps extends React.HTMLAttributes<HTMLDivElement> {}
  templates: unknown[];
  onEdit: (template: unknown) => void;
  onDelete: (id: string) => void;
}

export const EmailTemplatesTable: React.FC<EmailTemplatesTableProps> = ({}
  templates, onEdit, onDelete
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Variables</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {templates.map((template: unknown) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white font-mono">{template.name}</td>
                <td className="px-6 py-4 text-white">{template.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {parseVariables(template.variables).join(', ') || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(template.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button aria-label="Button"
                      onClick={() => onEdit(template)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button aria-label="Button"
                      onClick={() => onDelete(template.id)}
                      className="text-red-400 hover:text-red-300"
                    ><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ));
          </tbody>
        </table>
      </div>
    </div>
  );

                      </Trash2>