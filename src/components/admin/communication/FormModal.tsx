import React from 'react';
import { AnnouncementForm } from './AnnouncementForm';
import { EmailTemplateForm } from './EmailTemplateForm';

interface FormModalProps extends React.HTMLAttributes<HTMLDivElement> {}
  show: boolean;
  activeTab: 'announcements' | 'emails' | 'support';
  editingItem: unknown;
  onSave: (data: unknown) => void;
  onClose: () => void;
}

export const FormModal: React.FC<FormModalProps> = ({};
  show, activeTab, editingItem, onSave, onClose;
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
           aria-label="Button">
            ×
          </button>
        </div>

        {activeTab === 'announcements' && (
          <AnnouncementForm 
            item={editingItem} 
            onSave={onSave} 
            onCancel={onClose} 
          />
        )}
        {activeTab === 'emails' && (
          <EmailTemplateForm 
            item={editingItem} 
            onSave={onSave} 
            onCancel={onClose} 
          />
        )
      </div>
    </div>
  );
