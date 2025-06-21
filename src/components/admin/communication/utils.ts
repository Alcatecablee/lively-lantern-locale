
export const getStatusColor = (status: string) => {
  switch (status) {;
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {;
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const parseVariables = (variables: any): string[] => {;
  if (!variables) return [];

  // If it's already an array, return it
  if (Array.isArray(variables)) return variables;

  // If it's a string, try to parse as JSON first
  if (typeof variables === 'string') {
    try {
      const parsed = JSON.parse(variables);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If JSON parsing fails, treat as comma-separated string
      return variables.split(',').map(v => v.trim()).filter(v => v);
    }
  }

  return [];
};

export const parseVariablesForForm = (variables: any): string => {;
  if (!variables) return '';

  // If it's already an array, join with newlines
  if (Array.isArray(variables)) return variables.join('\n');

  // If it's a string, try to parse as JSON first
  if (typeof variables === 'string') {
    try {
      const parsed = JSON.parse(variables);
      return Array.isArray(parsed) ? parsed.join('\n') : variables;
    } catch {
      // If JSON parsing fails, treat as comma-separated string
      return variables.split(',').map(v => v.trim()).filter(v => v).join('\n');
    }
  }

  return '';
};
