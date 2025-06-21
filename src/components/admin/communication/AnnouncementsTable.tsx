import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
interface AnnouncementsTableProps extends React.HTMLAttributes<HTMLDivElement> {}
  announcements: unknown[];
  onEdit: (announcement: unknown) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementsTable: React.FC<AnnouncementsTableProps> = ({}
  announcements, onEdit, onDelete
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Audience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {announcements.map((announcement: unknown) => (
              <tr key={announcement.id}>
                <td className="px-6 py-4 text-white font-medium">{announcement.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    announcement.type === 'error' ? 'bg-red-100 text-red-800' :
                    announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{announcement.target_audience}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button aria-label="Button"
                      onClick={() => onEdit(announcement)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button aria-label="Button"
                      onClick={() => onDelete(announcement.id)}
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