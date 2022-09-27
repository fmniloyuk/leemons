import { listClasses } from '@academic-portfolio/request/classes';
import { useQueries } from 'react-query';

export default function useProgramClasses(programId, { enabled = true } = {}) {
  const programIds = Array.isArray(programId) ? programId : [programId];

  const queries = useQueries(
    programIds.map((id) => ({
      queryKey: ['listClasses', { program: id }],
      queryFn: async () => {
        const response = await listClasses({ page: 0, size: 99999, program: id });

        return response.data.items;
      },
      enabled,
    }))
  );

  if (Array.isArray(programId)) {
    return queries;
  }

  return queries[0];
}