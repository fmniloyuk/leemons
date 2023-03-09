import { useQuery } from '@tanstack/react-query';
import { useVariantForQueryKey } from '@common/queries';
import { head } from 'lodash';
import getAssignablesRequest from '@assignables/requests/assignables/getAssignables';
import { assignablesGetKey } from '../keys/assignables';

export default function useAssignables({ id, ids, withFiles, deleted, ...options }) {
  const idsToUse = id ?? ids;

  const queryKey = assignablesGetKey({
    ids: idsToUse,
    withFiles: !!withFiles,
    deleted: !!deleted,
  });

  const queryFn = id
    ? () =>
      getAssignablesRequest(idsToUse, {
        withFiles,
        deleted,
      }).then(head)
    : () => getAssignablesRequest(idsToUse, { withFiles, deleted });

  useVariantForQueryKey(queryKey, {
    modificationTrend: 'frequently',
  });

  const queryData = useQuery({
    queryKey,
    queryFn,
    ...options,
  });

  return queryData;
}
