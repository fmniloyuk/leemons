import React from 'react';
import { ContextContainer, PageContainer, Stepper } from '@bubbles-ui/components';
import { AdminPageHeader } from '@bubbles-ui/leemons';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import prefixPN from '@tests/helpers/prefixPN';
import { useStore } from '@common';
import { useHistory, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { addErrorAlert, addSuccessAlert } from '@layout/alert';
import DetailConfig from './components/DetailConfig';
import { getQuestionBankRequest, saveQuestionBankRequest } from '../../../request';
import DetailDesign from './components/DetailDesign';
import DetailQuestionsBanks from './components/DetailQuestionsBanks';
import DetailQuestions from './components/DetailQuestions';

export default function Detail() {
  const [t] = useTranslateLoader(prefixPN('testsDetail'));

  // ----------------------------------------------------------------------
  // SETTINGS
  const [store, render] = useStore({
    loading: true,
    isNew: false,
  });

  const history = useHistory();
  const params = useParams();

  const form = useForm();
  const formValues = form.watch();

  async function saveAsDraft() {
    try {
      store.saving = 'edit';
      render();
      await saveQuestionBankRequest({ ...formValues, published: false });
      addSuccessAlert(t('savedAsDraft'));
      history.push('/private/tests/questions-banks');
    } catch (error) {
      addErrorAlert(error);
    }
    store.saving = null;
    render();
  }

  async function saveAsPublish() {
    try {
      store.saving = 'duplicate';
      render();
      await saveQuestionBankRequest({ ...formValues, published: true });
      addSuccessAlert(t('published'));
      history.push('/private/tests/questions-banks');
    } catch (error) {
      addErrorAlert(error);
    }
    store.saving = null;
    render();
  }

  async function init() {
    try {
      store.isNew = params.id === 'new';
      render();
      if (!store.isNew) {
        const {
          // eslint-disable-next-line camelcase
          questionBank: { deleted, deleted_at, created_at, updated_at, ...props },
        } = await getQuestionBankRequest(params.id);
        form.reset(props);
      }
    } catch (error) {
      addErrorAlert(error);
    }
  }

  React.useEffect(() => {
    if (params?.id) init();
  }, [params]);

  const steps = [
    {
      label: t('config'),
      content: <DetailConfig t={t} form={form} />,
    },
  ];

  if (formValues.type) {
    steps.push({
      label: t('design'),
      content: <DetailDesign t={t} form={form} />,
    });
  }

  form.register('name', { required: t('nameRequired') });
  form.register('type', { required: t('typeRequired') });
  form.register('tagline', { required: t('taglineRequired') });
  form.register('summary', { required: t('summaryRequired') });

  if (formValues.type === 'learn') {
    form.register('questionBank', { required: t('questionBankRequired') });
    form.register('questions', { required: true });
    steps.push({
      label: t('questionsBank'),
      content: <DetailQuestionsBanks t={t} form={form} />,
    });
    steps.push({
      label: t('questions'),
      content: <DetailQuestions t={t} form={form} />,
    });
  }

  return (
    <ContextContainer fullHeight>
      <AdminPageHeader
        values={{
          title: store.isNew ? t('pageTitleNew') : t('pageTitle', { name: formValues.name }),
        }}
        buttons={{
          edit: formValues.name && !formValues.published ? t('saveDraft') : undefined,
          duplicate:
            // eslint-disable-next-line no-nested-ternary
            store.isNew && form.formState.isValid
              ? t('publish')
              : form.formState.isValid
              ? t('publish')
              : undefined,
        }}
        onDuplicate={() => saveAsPublish()}
        onEdit={() => saveAsDraft()}
        loading={store.saving}
      />

      <PageContainer noFlex>
        <Stepper data={steps} />
      </PageContainer>
    </ContextContainer>
  );
}
