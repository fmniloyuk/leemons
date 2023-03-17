import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Box, HtmlText, Loader, Text, Title, createStyles } from '@bubbles-ui/components';
import { capitalize, get, map } from 'lodash';

import { useIsStudent } from '@academic-portfolio/hooks';
import useAssignationsByProfile from '@assignables/hooks/assignations/useAssignationsByProfile';
import useInstances from '@assignables/requests/hooks/queries/useInstances';
import { unflatten } from '@common';
import { addErrorAlert } from '@layout/alert';
import { prefixPN } from '@learning-paths/helpers';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import { ActivityContainer } from '@bubbles-ui/leemons';
import prepareAsset from '@leebrary/helpers/prepareAsset';
import useRolesLocalizations from '@assignables/hooks/useRolesLocalizations';
import useClassData from '@assignables/hooks/useClassDataQuery';
import { getMultiClassData } from '@assignables/helpers/getClassData';
import { DashboardCard } from './components/DashboardCard';

export function useModuleDashboardLocalizations() {
  // key is string
  const key = prefixPN('dashboard');
  const [, translations] = useTranslateLoader(key);

  return useMemo(() => {
    if (translations && translations.items) {
      const res = unflatten(translations.items);

      return get(res, key);
    }

    return {};
  });
}

export const useModuleDashboardStyles = createStyles((theme) => {
  const globalTheme = theme.other.global;

  return {
    root: {
      minHeight: '100vh',
      background: globalTheme.background.color.surface.subtle,
    },
    rootContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: globalTheme.spacing.padding.xlg,

      paddingTop: globalTheme.spacing.padding.xlg,
      paddingBottom: globalTheme.spacing.padding.xlg,
      paddingLeft: globalTheme.spacing.padding['3xlg'],
      paddingRight: globalTheme.spacing.padding['3xlg'],
    },
    sectionHeader: {
      ...globalTheme.content.typo.heading.sm,
      color: globalTheme.content.color.text.default,
    },
    activitiesList: {
      display: 'flex',
      flexDirection: 'row',
      gap: globalTheme.spacing.gap.xlg,
      flexWrap: 'wrap',
    },
  };
});

export function useModuleData(id) {
  const {
    data: module,
    isLoading: isLoadingModule,
    error: moduleError,
    isError: isModuleError,
  } = useInstances({ id });

  const activitiesIds = useMemo(
    () => map(module?.metadata?.module?.activities, 'id'),
    [module?.metadata?.module?.activities]
  );

  const {
    data: activitiesByProfile,
    isLoading: isLoadingActivities,
    error: activitiesError,
    isError: isActivitiesError,
  } = useAssignationsByProfile(activitiesIds, { enabled: !!activitiesIds?.length });

  const isStudent = useIsStudent();

  const { assignations, activities } = useMemo(() => {
    if (isStudent) {
      return {
        assignations: activitiesByProfile,
        activities: map(activitiesByProfile, 'instance'),
      };
    }

    return { assignations: [], activities: activitiesByProfile };
  }, [activitiesByProfile, isStudent]);

  const activitiesById = useMemo(() => {
    const object = {};

    activities?.forEach((activity) => {
      object[activity.id] = activity;
    });

    return object;
  }, [activities]);

  const assignationsById = useMemo(() => {
    const object = {};

    assignations?.forEach((assignation) => {
      object[assignation.instance.id] = assignation;
    });

    return object;
  }, [assignations]);

  const errors = useMemo(
    () => [moduleError, activitiesError].filter(Boolean),
    [moduleError, activitiesError]
  );

  useEffect(() => {
    if (moduleError) {
      addErrorAlert(moduleError);
    }
  }, [moduleError]);

  useEffect(() => {
    if (activitiesError) {
      addErrorAlert(activitiesError);
    }
  }, [activitiesError]);

  return {
    module,
    activitiesById,
    assignationsById,
    activities: module?.metadata?.module?.activities ?? [],

    isLoading: isLoadingActivities || isLoadingModule,
    isError: isModuleError || isActivitiesError,
    errors,
  };
}

function useHeaderData(module) {
  const { assignable, dates, alwaysAvailable } = module ?? {};
  const { asset, roleDetails, role } = assignable ?? {};
  const { name } = asset ?? {};

  const preparedAsset = prepareAsset(asset ?? {});
  const roleLocalizations = useRolesLocalizations([role]);

  const { data: classesData } = useClassData(module, {}, { multiSubject: true });
  const { icon, color } = getMultiClassData({});

  return {
    header: {
      title: name,

      icon: classesData?.length > 1 ? icon : classesData?.[0]?.icon,
      color: classesData?.length > 1 ? color : classesData?.[0]?.color,
      image: preparedAsset?.cover ?? null,
      subjects: classesData,
      activityType: {
        icon: roleDetails?.icon,
        type: capitalize(get(roleLocalizations, `${role}.singular`)),
      },
      activityDates: alwaysAvailable
        ? null
        : {
          startLabel: 'Desde',
          endLabel: 'Hasta',
          hourLabel: 'Hora',
          startDate: dates?.startDate,
          endDate: dates?.deadline,
        },
    },
  };
}

export function ModuleDashboard({ id }) {
  const { module, activities, activitiesById, assignationsById, isLoading } = useModuleData(id);
  const localizations = useModuleDashboardLocalizations();
  const headersData = useHeaderData(module);

  const { classes } = useModuleDashboardStyles();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box className={classes.root}>
      <ActivityContainer {...headersData} collapseOnScroll>
        <Box className={classes.rootContainer}>
          <Text className={classes.sectionHeader}>{localizations?.activities}</Text>
          {!!module?.metadata?.statement && <HtmlText>{module?.metadata?.statement}</HtmlText>}
          <Box className={classes.activitiesList}>
            {activities?.map((activity) => (
              <DashboardCard
                localizations={localizations}
                activity={activitiesById[activity?.id]}
                assignation={assignationsById[activity?.id]}
                key={activity?.id}
              />
            ))}
          </Box>
        </Box>
      </ActivityContainer>
    </Box>
  );
}

ModuleDashboard.propTypes = {
  id: PropTypes.any,
};