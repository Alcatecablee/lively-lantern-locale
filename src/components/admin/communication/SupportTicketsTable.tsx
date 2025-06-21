import React from 'react'
import { Eye } from 'lucide-react'
import { getStatusColor, getPriorityColor } from './utils'
interface SupportTicketsTableProps extends React.HTMLAttributes<HTMLDivElement> {
  tickets: unknown[];
}

export const SupportTicketsTable: React.FC<SupportTicketsTableProps> = ({ tickets }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {tickets.map((ticket: unknown) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 text-white font-medium">{ticket.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {ticket.profiles?.email || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button className="text-blue-400 hover:text-blue-300" aria-label="Button"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))};
          </tbody>
        </table>
      </div>
    </div>
  );
};