import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionButton,
  Box,
  Button,
  ContextContainer,
  createStyles,
  HtmlText,
  Stack,
  Table,
  TableInput,
  TAGIFY_TAG_REGEX,
  Text,
  TextInput,
} from '@bubbles-ui/components';
import _, { forEach, isArray, isNumber } from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import { TextEditorInput } from '@bubbles-ui/editors';
import { htmlToText, numberToEncodedLetter, useStore } from '@common';
import { EditWriteIcon } from '@bubbles-ui/icons/solid';
import { TagRelation } from '@curriculum/components/FormTheme/TagRelation';
import { StartNumbering } from '@curriculum/components/FormTheme/StartNumbering';
import { getItemTitleNumberedWithParents } from '@curriculum/helpers/getItemTitleNumberedWithParents';

const useStyle = createStyles((theme) => ({
  card: {
    border: `1px solid ${theme.colors.ui01}`,
    borderRadius: '8px',
    overflow: 'hidden',
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    right: theme.spacing[2],
    top: theme.spacing[2],
  },
}));

function CurriculumGroupItem({
  defaultValues,
  curriculum,
  parentRelated,
  id,
  isEditMode = true,
  blockData,
  onSave,
  onCancel,
  onEdit,
  preview,
  item,
  t,
}) {
  const { classes } = useStyle();
  const [store, render] = useStore();
  const form = useForm({ defaultValues });
  const values = form.watch();
  const initNumber = form.watch('metadata.initNumber');

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [preview, blockData, defaultValues]);

  function _onSave() {
    form.handleSubmit((formValues) => {
      onSave(formValues);
    })();
  }

  function getTitle(index, text = 'showAs') {
    let finalText = blockData[text];
    let array;
    while ((array = TAGIFY_TAG_REGEX.exec(blockData[text])) !== null) {
      const json = JSON.parse(array[0])[0][0];
      if (json.numberingStyle && isNumber(index)) {
        if (json.numberingStyle === 'style-1') {
          finalText = finalText.replace(
            array[0],
            (initNumber + index).toString().padStart(json.numberingDigits, '0')
          );
        }
        if (json.numberingStyle === 'style-2') {
          finalText = finalText.replace(array[0], numberToEncodedLetter(initNumber + index));
        }
      } else {
        finalText = finalText.replace(array[0], item[json.id]);
      }
    }
    return finalText;
  }

  const customNumberingStyle = React.useMemo(() => {
    let result = null;
    if (blockData.listOrderedText) {
      let array;
      // eslint-disable-next-line no-cond-assign
      while ((array = TAGIFY_TAG_REGEX.exec(blockData.listOrderedText)) !== null) {
        const json = JSON.parse(array[0])[0][0];
        if (json.numberingStyle) {
          result = json;
        }
      }
    }
    return result;
  }, [blockData]);

  const useOrder = React.useMemo(() => {
    if (blockData.groupListOrdered === 'style-1') {
      return 'numbers';
    }
    if (blockData.groupListOrdered === 'style-2') {
      return 'vocals';
    }
    if (blockData.groupListOrdered === 'custom' && customNumberingStyle) {
      if (customNumberingStyle.numberingStyle === 'style-1') {
        return 'numbers';
      }
      if (customNumberingStyle.numberingStyle === 'style-2') {
        return 'vocals';
      }
    }
    return null;
  }, [blockData, customNumberingStyle]);

  const columns = React.useMemo(() => {
    const rules = { required: t('fieldRequired') };
    if (blockData.groupMax) {
      rules.validate = (e) => {
        const text = htmlToText(e);
        if (text.length > blockData.groupMax) {
          return t('maxLength', { max: blockData.groupMax });
        }
      };
    }
    const result = [];

    if (blockData.groupListOrdered && blockData.groupListOrdered !== 'not-ordered') {
      result.push({
        Header: ' ',
        accessor: 'order',
        input: {
          node: <Box />,
        },
      });
    }

    result.push({
      Header: t('newItemList'),
      accessor: 'value',
      input: {
        node:
          blockData.groupListType === 'field' ? (
            <TextInput required />
          ) : (
            <TextEditorInput required />
          ),
        rules,
      },
    });

    return result;
  }, []);

  function getNumbering(index) {
    return getItemTitleNumberedWithParents(
      curriculum,
      blockData,
      id,
      {
        ...values,
        metadata: { ...values?.metadata, parentRelated },
      },
      index,
      item
    );
  }

  if (preview) {
    const tag = (
      <Controller
        control={form.control}
        name="metadata.tagRelated"
        render={({ field }) => (
          <TagRelation
            {...field}
            curriculum={curriculum}
            blockData={blockData}
            isShow={(e) => {
              store.showSaveButton = e;
              render();
            }}
            readonly
            id={id}
            t={t}
          />
        )}
      />
    );
    return (
      <Box className={classes.card}>
        <Box sx={(theme) => ({ marginBottom: theme.spacing[3] })}>
          <Text color="primary" role="productive" size="md" strong>
            {getTitle()}
          </Text>
          {isEditMode ? (
            <Box className={classes.editButton}>
              <ActionButton tooltip={t('edit')} icon={<EditWriteIcon />} onClick={onEdit} />
            </Box>
          ) : null}
        </Box>
        {!isEditMode ? <Box sx={(theme) => ({ marginBottom: theme.spacing[3] })}>{tag}</Box> : null}
        <Box sx={() => ({ maxHeight: 200, overflow: 'auto' })}>
          {blockData.groupTypeOfContents === 'field' ? (
            <Text color="primary" role="productive">
              {defaultValues.value}
            </Text>
          ) : null}
          {blockData.groupTypeOfContents === 'textarea' ? (
            <HtmlText>{defaultValues.value}</HtmlText>
          ) : null}
          {blockData.groupTypeOfContents === 'list' && defaultValues.value?.length ? (
            <Table
              data={defaultValues.value}
              columns={columns.map((col) => ({ ...col, Header: ' ' }))}
            />
          ) : null}
        </Box>
        {isEditMode ? <Box sx={(theme) => ({ marginTop: theme.spacing[3] })}>{tag}</Box> : null}
      </Box>
    );
  }

  return (
    <ContextContainer className={classes.card}>
      <Box sx={(theme) => ({ marginBottom: theme.spacing[3] })}>
        <Text color="primary" role="productive" size="md" strong>
          {getTitle()}
        </Text>
      </Box>

      {useOrder && isEditMode ? (
        <Controller
          control={form.control}
          name="metadata.initNumber"
          render={({ field }) => (
            <StartNumbering
              t={t}
              custom={customNumberingStyle}
              type={useOrder}
              value={values}
              onChange={(e) => {
                field.onChange(e.metadata.initNumber);
              }}
            />
          )}
        />
      ) : null}

      <Controller
        control={form.control}
        name="value"
        rules={{
          required: t('fieldRequired'),
        }}
        render={({ field }) => {
          if (blockData.groupTypeOfContents === 'field') {
            return <TextInput {...field} error={form.formState.errors.value} />;
          }
          if (blockData.groupTypeOfContents === 'textarea') {
            return <TextEditorInput {...field} error={form.formState.errors.value} />;
          }
          if (blockData.groupTypeOfContents === 'list') {
            const val = isArray(field.value) ? field.value : [];
            forEach(val, (v, i) => {
              v.order = getNumbering(i);
            });
            return (
              <TableInput
                data={_.cloneDeep(val)}
                onChange={(e) => {
                  field.onChange(e);
                }}
                columns={columns}
                editable
                resetOnAdd
                sortable
                removable
                labels={{
                  add: t('add'),
                  remove: t('remove'),
                  edit: t('edit'),
                  accept: t('accept'),
                  cancel: t('cancel'),
                }}
              />
            );
          }
        }}
      />
      <Controller
        control={form.control}
        name="metadata.tagRelated"
        render={({ field }) => (
          <TagRelation
            {...field}
            curriculum={curriculum}
            blockData={blockData}
            isShow={(e) => {
              store.showSaveButton = e;
              render();
            }}
            id={id}
            t={t}
          />
        )}
      />
      <Stack justifyContent="space-between" fullWidth>
        <Button variant="link" onClick={onCancel} loading={store.loading}>
          {t('cancel')}
        </Button>
        <Button variant="outline" onClick={_onSave} loading={store.loading}>
          {defaultValues?.value ? t('update') : t('add')}
        </Button>
      </Stack>
    </ContextContainer>
  );
}

CurriculumGroupItem.defaultProps = {
  defaultValues: {},
};

CurriculumGroupItem.propTypes = {
  t: PropTypes.func,
  id: PropTypes.string,
  item: PropTypes.any,
  onEdit: PropTypes.func,
  onSave: PropTypes.func,
  onRemove: PropTypes.func,
  onCancel: PropTypes.func,
  curriculum: PropTypes.any,
  schema: PropTypes.any,
  preview: PropTypes.bool,
  blockData: PropTypes.any,
  defaultValues: PropTypes.any,
  isEditMode: PropTypes.bool,
  parentRelated: PropTypes.string,
};

export default CurriculumGroupItem;