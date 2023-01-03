/* eslint-disable no-unreachable */
import React, { useContext, useEffect, useMemo } from 'react';
import { find, isArray, isEmpty } from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import { ActionButton, Box, Col, Grid, Stack } from '@bubbles-ui/components';
import { ChevronLeftIcon } from '@bubbles-ui/icons/outline';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import { useRequestErrorMessage } from '@common';
import { addErrorAlert } from '@layout/alert';
import prefixPN from '../../../helpers/prefixPN';
import LibraryContext from '../../../context/LibraryContext';
import { VIEWS } from '../library/Library.constants';
import {
  BasicData as MediaBasicData,
  BookmarkBasicData,
  PermissionsData,
  Setup,
} from '../../../components/AssetSetup';
import { getAssetsByIdsRequest } from '../../../request';

const EditAssetPage = () => {
  const { file, setView, category, setCategory, categories, setAsset, asset } =
    useContext(LibraryContext);
  const [t] = useTranslateLoader(prefixPN('assetSetup'));
  const [, , , getErrorMessage] = useRequestErrorMessage();
  const history = useHistory();
  const params = useParams();

  // ·········································································
  // DATA PROCESSING

  const loadAsset = async (id) => {
    try {
      const response = await getAssetsByIdsRequest([id]);
      if (!isEmpty(response?.assets)) {
        const value = response.assets[0];
        setAsset(value);
      } else {
        setAsset(null);
      }
    } catch (err) {
      addErrorAlert(getErrorMessage(err));
    }
  };

  // ·········································································
  // EFFECTS

  useEffect(() => setView(VIEWS.EDIT), []);

  useEffect(() => {
    if (!isEmpty(params.id) && asset?.id !== params.id) {
      loadAsset(params.id);
    }
  }, [params, asset]);

  useEffect(() => {
    if (!isEmpty(asset?.category) && !isEmpty(categories) && asset?.category !== category?.id) {
      const item = find(categories, { id: asset.category });
      setCategory(item);
    }
  }, [asset, categories, category]);

  // ·········································································
  // HANDLERS

  const handleOnBack = () => {
    history.goBack();
  };

  const handleOnFinish = () => {
    handleOnBack();
  };

  // ·········································································
  // INIT VALUES

  const setupProps = useMemo(() => {
    if (!isEmpty(asset) && !isEmpty(category)) {
      const labels = {
        basicData: t('basicData.header.stepLabel'),
        permissionsData: t('permissionsData.header.stepLabel'),
      };

      return {
        steps: [
          {
            label: labels.basicData,
            content:
              category.key === 'bookmarks' ? (
                <BookmarkBasicData
                  editing
                  categoryId={asset.category}
                  asset={asset}
                  onSave={setAsset}
                />
              ) : (
                <MediaBasicData
                  advancedConfig={{
                    alwaysOpen: false,
                    program: { show: true, required: false },
                    subjects: { show: true, required: false, showLevel: true, maxOne: false },
                  }}
                  file={asset.file}
                  categoryId={asset.category}
                  asset={asset}
                  onSave={setAsset}
                  editing
                />
              ),
          },
          {
            label: labels.permissionsData,
            content: <PermissionsData asset={asset} />,
          },
        ],
      };
    }
    return null;
  }, [t, asset, category]);

  return (
    <Grid columns={10}>
      <Col span={5}>
        <Box>
          <Box sx={(theme) => ({ padding: `${theme.spacing[3]}px ${theme.spacing[9]}px` })}>
            <Stack fullWidth justifyContent="start">
              <ActionButton
                icon={<ChevronLeftIcon />}
                label={t('header.back')}
                tooltip={t('header.back')}
                onClick={handleOnBack}
              />
            </Stack>
          </Box>
          <Box sx={(theme) => ({ padding: `${theme.spacing[3]}px ${theme.spacing[9]}px` })}>
            {!isEmpty(setupProps) && isArray(setupProps.steps) && (
              <Setup {...setupProps} onFinish={handleOnFinish} />
            )}
          </Box>
        </Box>
      </Col>
    </Grid>
  );
};

export { EditAssetPage };
export default EditAssetPage;
