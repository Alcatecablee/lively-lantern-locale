import { useState } from 'react';
import { parseVariablesForForm } from './utils';

interface EmailTemplateFormProps extends React.HTMLAttributes<HTMLDivElement> {
  item: unknown;
  onSave: (data: unknown) => void;
  onCancel: () => void;
}

export const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  item, onSave, onCancel;
}) => {
  const [formData, setFormData] = useState({;
    name: item?.name || '',;
    subject: item?.subject || '',;
    body_html: item?.body_html || '',;
    body_text: item?.body_text || '',;
    variables: parseVariablesForForm(item?.variables) || '',;
    is_active: item?.is_active ?? true,;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variablesArray = formData.variables.split('\n').filter(v => v.trim());
    onSave({ ...formData, variables: JSON.stringify(variablesArray) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">HTML Body</label>
        <textarea
          value={formData.body_html}
          onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-32 font-mono"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Text Body</label>
        <textarea
          value={formData.body_text}
          onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-24"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Variables (one per line)</label>
        <textarea
          value={formData.variables}
          onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-16"
          placeholder="name&#10;email&#10;reset_link"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-gray-700 bg-gray-800 text-blue-600"
        />
        <label className="ml-2 text-sm text-gray-300">Active</label>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
         aria-label="Button">
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
         aria-label="Button">
          Save
        </button>
      </div>
    </form>
  );
};