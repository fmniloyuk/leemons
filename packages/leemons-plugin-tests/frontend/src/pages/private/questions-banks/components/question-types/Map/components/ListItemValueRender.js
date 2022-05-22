import React from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Title } from '@bubbles-ui/components';
import { ViewOffIcon } from '@bubbles-ui/icons/outline';
import { numberToEncodedLetter } from '@common';

// eslint-disable-next-line import/prefer-default-export
export function ListItemValueRender({ item, toggleHideOnHelp, markers, showEye, index }) {
  return (
    <Box sx={() => ({ width: '100%' })}>
      <Stack fullWidth alignItems="start" justifyContent="start">
        <Box
          sx={(theme) => ({
            marginRight: theme.spacing[5],
            marginTop: theme.spacing[1],
          })}
        >
          <Title order={6}>
            {markers.type === 'letter' ? numberToEncodedLetter(index + 1) : index + 1}
          </Title>
        </Box>
        {showEye ? (
          <Box
            sx={(theme) => ({
              marginRight: theme.spacing[5],
              marginTop: theme.spacing[1],
              fontSize: theme.fontSizes[4],
              cursor: 'pointer',
              color: item.hideOnHelp ? theme.colors.interactive01 : theme.colors.text06,
            })}
            onClick={() => toggleHideOnHelp(item)}
          >
            <ViewOffIcon />
          </Box>
        ) : null}

        <Box>{item.response}</Box>
      </Stack>
    </Box>
  );
}

ListItemValueRender.propTypes = {
  item: PropTypes.object,
  toggleHideOnHelp: PropTypes.func,
  index: PropTypes.number,
  markers: PropTypes.object,
  showEye: PropTypes.bool,
};
