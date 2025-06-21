import { useState } from 'react';

export const useTeam = () => {
  const [tablesExist] = useState(true);
  return { tablesExist };
};
