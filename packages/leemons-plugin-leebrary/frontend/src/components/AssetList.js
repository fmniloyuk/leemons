import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { find, isEmpty, isFunction, isNil, isString } from 'lodash';
import {
  Box,
  LoadingOverlay,
  PaginatedList,
  RadioGroup,
  SearchInput,
  Select,
  Stack,
  Switch,
  Title,
  useDebouncedValue,
  useResizeObserver,
} from '@bubbles-ui/components';
import { LibraryItem } from '@bubbles-ui/leemons';
import { CommonFileSearchIcon } from '@bubbles-ui/icons/outline';
import { LayoutHeadlineIcon, LayoutModuleIcon } from '@bubbles-ui/icons/solid';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import { LocaleDate, unflatten, useRequestErrorMessage } from '@common';
import { addErrorAlert, addSuccessAlert } from '@layout/alert';
import { useLayout } from '@layout/context';
import prefixPN from '../helpers/prefixPN';
import {
  deleteAssetRequest,
  duplicateAssetRequest,
  getAssetsByIdsRequest,
  getAssetsRequest,
  getAssetTypesRequest,
  listCategoriesRequest,
  pinAssetRequest,
  unpinAssetRequest,
} from '../request';
import { getPageItems } from '../helpers/getPageItems';
import { CardWrapper } from './CardWrapper';
import { CardDetailWrapper } from './CardDetailWrapper';
import { AssetThumbnail } from './AssetThumbnail';
import { prepareAsset } from '../helpers/prepareAsset';
import { prepareAssetType } from '../helpers/prepareAssetType';
import { PermissionsData } from './AssetSetup/PermissionsData';

function getOwner(asset) {
  const owner = (asset?.canAccess || []).filter((person) =>
    person.permissions.includes('owner')
  )[0];
  return `${owner.name} ${owner.surnames}`;
}

const AssetList = ({
  category: categoryProp,
  categories: categoriesProp,
  asset: assetProp,
  assetType: assetTypeProp,
  search: searchProp,
  layout: layoutProp,
  showPublic: showPublicProp,
  canShowPublicToggle,
  itemMinWidth,
  canChangeLayout,
  canChangeType,
  canSearch,
  variant,
  onlyThumbnails,
  page: pageProp,
  pageSize,
  published,
  onSearch,
  pinned,
  onSelectItem = () => {},
  onEditItem = () => {},
  onTypeChange = () => {},
  onShowPublic = () => {},
}) => {
  const [t, translations] = useTranslateLoader(prefixPN('list'));
  const [category, setCategory] = useState(categoryProp);
  const [categories, setCategories] = useState(categoriesProp);
  const [layout, setLayout] = useState(layoutProp);
  const [asset, setAsset] = useState(assetProp);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageProp);
  const [size, setSize] = useState(pageSize);
  const [assets, setAssets] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetType, setAssetType] = useState(assetTypeProp);
  const [openDetail, setOpenDetail] = useState(true);
  const [serverData, setServerData] = useState({});
  const [showPublic, setShowPublic] = useState(showPublicProp);
  const [searchCriteria, setSearhCriteria] = useState(searchProp);
  const [, , , getErrorMessage] = useRequestErrorMessage();
  const [containerRef, containerRect] = useResizeObserver();
  const [childRef, childRect] = useResizeObserver();
  const [drawerRef, drawerRect] = useResizeObserver();
  const {
    openConfirmationModal,
    openDeleteConfirmationModal,
    setLoading: setAppLoading,
    openModal,
    closeModal,
  } = useLayout();
  const [searchDebounced] = useDebouncedValue(searchCriteria, 300);

  // ·········································································
  // DATA PROCESSING

  const loadCategories = async (selectedCategoryKey) => {
    const result = await listCategoriesRequest();
    const items = result.map((data) => ({
      ...data,
      icon: data.menuItem.iconSvg,
      name: data.menuItem.label,
    }));
    setCategories(items);
    if (!isEmpty(selectedCategoryKey)) {
      setCategory(find(items, { key: selectedCategoryKey }));
    }
  };

  const loadAssetTypes = async (categoryId) => {
    try {
      const response = await getAssetTypesRequest(categoryId);
      const types = response.types.map((type) => ({
        label: prepareAssetType(type),
        value: prepareAssetType(type, false),
      }));
      setAssetTypes(types);
    } catch (err) {
      addErrorAlert(getErrorMessage(err));
    }
  };

  const loadAssets = async (categoryId, criteria = '', type = '') => {
    // console.log('loadAssets > categoryId:', categoryId);
    try {
      setLoading(true);
      setAsset(null);
      const response = await getAssetsRequest({
        category: categoryId,
        criteria,
        type,
        published,
        showPublic: !pinned ? showPublic : true,
        pinned,
      });
      // console.log('assets:', response.assets);
      setAssets(response?.assets || []);
      setTimeout(() => setLoading(false), 500);
    } catch (err) {
      setLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  const loadAssetsData = async () => {
    // console.log('loadAssetsData');
    try {
      setLoading(true);
      if (!isEmpty(assets)) {
        const paginated = getPageItems({ data: assets, page: page - 1, size });
        const assetIds = paginated.items.map((item) => item.asset);
        const response = await getAssetsByIdsRequest(assetIds, {
          published,
          showPublic: !pinned ? showPublic : true,
        });
        paginated.items = response.assets || [];
        setServerData(paginated);
      } else {
        setServerData([]);
      }
      setTimeout(() => setLoading(false), 1000);
    } catch (err) {
      setLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  const loadAsset = async (id, forceLoad) => {
    try {
      const item = find(serverData.items, { id });

      if (item && !forceLoad) {
        setAsset(prepareAsset(item, published));
      } else {
        // console.log('loadAsset > id:', id);
        const response = await getAssetsByIdsRequest([id]);
        if (!isEmpty(response?.assets)) {
          const value = response.assets[0];
          // console.log('asset:', value);
          setAsset(prepareAsset(value, published));

          if (forceLoad && item) {
            const index = serverData.items.findIndex((i) => i.id === id);
            serverData.items[index] = value;
            setServerData(serverData);
          }
        } else {
          setAsset(null);
        }
      }
    } catch (err) {
      addErrorAlert(getErrorMessage(err));
    }
  };

  const reloadAssets = () => {
    loadAssets(category.id);
  };

  const duplicateAsset = async (id) => {
    setAppLoading(true);
    try {
      const response = await duplicateAssetRequest(id);
      if (response?.asset) {
        setAppLoading(false);
        addSuccessAlert(t('labels.duplicateSuccess'));
        reloadAssets();
      }
    } catch (err) {
      setAppLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  const deleteAsset = async (id) => {
    setAppLoading(true);
    try {
      await deleteAssetRequest(id);
      setAppLoading(false);
      addSuccessAlert(t('labels.removeSuccess'));
      setAsset(null);
      reloadAssets();
    } catch (err) {
      setAppLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  const pinAsset = async (item) => {
    setAppLoading(true);
    try {
      await pinAssetRequest(item.id);
      setAppLoading(false);
      addSuccessAlert(t('labels.pinnedSuccess'));
      loadAsset(item.id, true);
    } catch (err) {
      setAppLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  const unpinAsset = async (item) => {
    setAppLoading(true);
    try {
      await unpinAssetRequest(item.id);
      setAppLoading(false);
      addSuccessAlert(t('labels.unpinnedSuccess'));
      loadAsset(item.id, true);
    } catch (err) {
      setAppLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  // ·········································································
  // EFFECTS

  useEffect(() => setSize(pageSize), [pageSize]);
  useEffect(() => setPage(pageProp), [pageProp]);
  useEffect(() => setLayout(layoutProp), [layoutProp]);
  useEffect(() => setCategories(categoriesProp), [categoriesProp]);
  useEffect(() => setAssetType(assetTypeProp), [assetTypeProp]);
  useEffect(() => setShowPublic(showPublicProp), [showPublicProp]);

  useEffect(() => {
    if (!isEmpty(assetProp?.id) && assetProp.id !== asset?.id) {
      setAsset(assetProp);
    } else if (isString(assetProp) && assetProp !== asset?.id) {
      loadAsset(assetProp);
    } else {
      setAsset(null);
    }
  }, [assetProp]);

  useEffect(() => {
    if (!isEmpty(categoryProp?.id)) {
      setCategory(categoryProp);
    } else if (isString(categoryProp) && isEmpty(categories)) {
      loadCategories(categoryProp);
    } else if (isString(categoryProp) && !isEmpty(categories)) {
      setCategory(find(categories, { key: categoryProp }));
    }
  }, [categoryProp, categories]);

  useEffect(() => {
    if (!isEmpty(category?.id)) {
      // loadAssets(category.id);
      loadAssetTypes(category.id);
    } else {
      setAssetTypes(null);
    }
  }, [category]);

  useEffect(() => {
    loadAssetsData();
  }, [assets, page, size]);

  useEffect(() => {
    if (isFunction(onSearch)) {
      onSearch(searchDebounced);
    } else {
      loadAssets(category.id, searchDebounced, assetType);
    }
  }, [searchDebounced]);

  useEffect(() => {
    if (!isEmpty(category?.id) || pinned) {
      loadAssets(category.id, searchProp, assetType);
    }
  }, [searchProp, category, assetType, showPublic, pinned]);

  // ·········································································
  // HANDLERS

  const handleOnSelect = (item) => {
    setOpenDetail(true);
    onSelectItem(item);
  };

  const handleOnDelete = (item) => {
    openDeleteConfirmationModal({
      onConfirm: () => deleteAsset(item.id),
    })();
  };

  const handleOnDuplicate = (item) => {
    openConfirmationModal({
      onConfirm: () => duplicateAsset(item.id),
    })();
  };

  const handleOnEdit = (item) => {
    setAsset(item);
    onEditItem(item);
  };

  const handleOnShare = (item) => {
    const id = openModal({
      children: (
        <PermissionsData
          asset={item}
          sharing={true}
          onNext={() => {
            closeModal(id);
            loadAsset(item.id, true);
          }}
        />
      ),
      size: 'lg',
      withCloseButton: true,
    });
  };

  const handleOnShowPublic = (value) => {
    setShowPublic(value);
    onShowPublic(value);
  };

  const handleOnPin = (item) => {
    pinAsset(item);
  };

  const handleOnUnpin = (item) => {
    openConfirmationModal({
      onConfirm: () => unpinAsset(item),
    })();
  };

  // ·········································································
  // LABELS & STATIC

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      valueRender: (_, row) => <LibraryItem asset={prepareAsset(row, published)} />,
    },
    {
      Header: 'Owner',
      accessor: 'owner',
      valueRender: (_, row) => getOwner(row),
    },
    {
      Header: 'Last change',
      accessor: 'updated',
      valueRender: (_, row) => <LocaleDate date={row.updated_at} />,
    },
  ];

  const cardVariant = useMemo(() => {
    let option = 'media';
    switch (category?.key) {
      case 'bookmarks':
        option = 'bookmark';
        break;
      default:
        break;
    }
    return option;
  }, [category]);

  const showDrawer = useMemo(() => !loading && !isNil(asset) && !isEmpty(asset), [loading, asset]);
  const headerOffset = useMemo(() => Math.round(childRect.bottom + childRect.top), [childRect]);
  const isEmbedded = useMemo(() => variant === 'embedded', [variant]);
  const listProps = useMemo(() => {
    const paperProps = { shadow: 'none', padding: 0 };

    if (!onlyThumbnails && layout === 'grid') {
      return {
        itemRender: (p) => (
          <CardWrapper
            {...p}
            variant={cardVariant}
            category={category}
            published={published}
            isEmbedded={isEmbedded}
            onRefresh={reloadAssets}
          />
        ),
        itemMinWidth,
        margin: 16,
        spacing: 4,
        paperProps,
      };
    }

    if (onlyThumbnails && layout === 'grid') {
      return {
        itemRender: (p) => <AssetThumbnail {...p} />,
        itemMinWidth,
        margin: 16,
        spacing: 4,
        paperProps: { shadow: 'none', padding: 4 },
      };
    }

    return { paperProps };
  }, [layout, category, isEmbedded]);

  const listLayouts = useMemo(
    () => [
      { value: 'grid', icon: <LayoutModuleIcon /> },
      { value: 'table', icon: <LayoutHeadlineIcon /> },
    ],
    []
  );

  const toolbarItems = useMemo(
    () => ({
      edit: asset?.editable ? 'Edit' : false,
      duplicate: asset?.duplicable ? 'Duplicate' : false,
      download: asset?.downloadable ? 'Download' : false,
      delete: asset?.deleteable ? 'Delete' : false,
      share: asset?.shareable ? 'Share' : false,
      assign: asset?.assignable ? 'Assign' : false,
      // eslint-disable-next-line no-nested-ternary
      pin: asset?.pinned ? false : asset?.pinneable && published ? 'Pin' : false,
      unpin: asset?.pinned ? 'Unpin' : false,
      toggle: 'Toggle',
    }),
    [asset]
  );

  const detailLabels = useMemo(() => {
    if (!isEmpty(translations)) {
      const items = unflatten(translations.items);
      const data = items.plugins.leebrary.list.labels;
      return data;
    }
    return {};
  }, [translations]);

  // ·········································································
  // RENDER

  return (
    <Stack ref={containerRef} direction="column" fullHeight style={{ position: 'relative' }}>
      <Stack
        ref={childRef}
        fullWidth
        spacing={5}
        padding={isEmbedded ? 0 : 5}
        style={
          isEmbedded
            ? { flex: 0 }
            : {
                flex: 0,
                width: containerRect.width,
                top: containerRect.top,
                position: 'fixed',
                zIndex: 101,
                backgroundColor: '#fff',
              }
        }
      >
        <Stack fullWidth spacing={5}>
          {canSearch && (
            <SearchInput
              variant={isEmbedded ? 'default' : 'filled'}
              onChange={setSearhCriteria}
              value={searchCriteria}
            />
          )}
          {!isEmpty(assetTypes) && canChangeType && (
            <Select
              skipFlex
              data={assetTypes}
              value={assetType}
              onChange={onTypeChange}
              placeholder="Type of resource"
            />
          )}
        </Stack>
        {canChangeLayout && (
          <Box skipFlex>
            <RadioGroup
              data={listLayouts}
              variant="icon"
              size="xs"
              value={layout}
              onChange={setLayout}
            />
          </Box>
        )}
      </Stack>

      <Stack
        fullHeight
        style={
          isEmbedded
            ? {}
            : {
                marginTop: headerOffset,
                marginRight: drawerRect.width,
              }
        }
      >
        <Box
          sx={(theme) => ({
            flex: 1,
            position: 'relative',
            marginTop: isEmbedded && theme.spacing[5],
            paddingRight: !isEmbedded && theme.spacing[5],
            paddingLeft: !isEmbedded && theme.spacing[5],
          })}
        >
          <LoadingOverlay visible={loading} />
          {!loading && !pinned && canShowPublicToggle && (
            <Switch label="Show public assets" checked={showPublic} onChange={handleOnShowPublic} />
          )}
          {!loading && !isEmpty(serverData?.items) && (
            <Box
              sx={(theme) => ({
                paddingBottom: theme.spacing[5],
              })}
            >
              <PaginatedList
                {...serverData}
                {...listProps}
                selectable
                selected={asset}
                columns={columns}
                loading={loading}
                layout={layout}
                page={page}
                size={size}
                onSelect={handleOnSelect}
                onPageChange={setPage}
                onSizeChange={setSize}
              />
            </Box>
          )}
          {!loading && isEmpty(serverData?.items) && (
            <Stack justifyContent="center" alignItems="center" fullWidth fullHeight>
              <Stack
                alignItems="center"
                direction="column"
                spacing={2}
                sx={(theme) => ({ color: theme.colors.text05 })}
              >
                <CommonFileSearchIcon style={{ fontSize: 24 }} />
                <Title order={4} color="soft">
                  No assets found
                </Title>
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>
      <Box
        ref={drawerRef}
        style={{
          position: 'fixed',
          height: `calc(100% - ${headerOffset}px)`,
          right: 0,
          top: headerOffset,
          zIndex: 99,
        }}
      >
        {showDrawer && (
          <Box style={{ background: '#FFF', width: openDetail ? 360 : 'auto', height: '100%' }}>
            <CardDetailWrapper
              category={category}
              asset={asset}
              labels={detailLabels}
              variant={cardVariant}
              open={openDetail}
              toolbarItems={toolbarItems}
              onToggle={() => setOpenDetail(!openDetail)}
              onDuplicate={handleOnDuplicate}
              onDelete={handleOnDelete}
              onEdit={handleOnEdit}
              onShare={handleOnShare}
              onPin={handleOnPin}
              onUnpin={handleOnUnpin}
              onRefresh={reloadAssets}
            />
          </Box>
        )}
      </Box>
    </Stack>
  );
};

AssetList.defaultProps = {
  layout: 'grid',
  searchable: true,
  category: 'media-files',
  categories: [],
  itemMinWidth: 340,
  search: '',
  page: 1,
  pageSize: 6,
  canChangeLayout: true,
  canChangeType: true,
  canSearch: true,
  variant: 'full',
  published: true,
  showPublic: false,
  pinned: false,
  canShowPublicToggle: true,
};
AssetList.propTypes = {
  category: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  layout: PropTypes.oneOf(['grid', 'table']),
  searchable: PropTypes.bool,
  asset: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  categories: PropTypes.arrayOf(PropTypes.object),
  search: PropTypes.string,
  assetType: PropTypes.string,
  onSelectItem: PropTypes.func,
  onEditItem: PropTypes.func,
  onSearch: PropTypes.func,
  onTypeChange: PropTypes.func,
  onShowPublic: PropTypes.func,
  showPublic: PropTypes.bool,
  itemMinWidth: PropTypes.number,
  canChangeLayout: PropTypes.bool,
  canChangeType: PropTypes.bool,
  canSearch: PropTypes.bool,
  onlyThumbnails: PropTypes.bool,
  variant: PropTypes.oneOf(['full', 'embedded']),
  page: PropTypes.number,
  pageSize: PropTypes.number,
  published: PropTypes.bool,
  pinned: PropTypes.bool,
  canShowPublicToggle: PropTypes.bool,
};

export { AssetList };
export default AssetList;