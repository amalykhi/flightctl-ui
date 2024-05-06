import { Form, FormGroup, Grid } from '@patternfly/react-core';
import * as React from 'react';
import { FleetFormValues } from '../types';
import { FormikErrors, useFormikContext } from 'formik';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import ConfigTemplateForm from './ConfigTemplateForm';

export const deviceTemplateStepId = 'device-template';

export const isDeviceTemplateStepValid = (errors: FormikErrors<FleetFormValues>) => {
  return !errors.osImage && !errors.configTemplates;
};

const DeviceTemplateStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();

  return (
    <Grid span={8}>
      <Form>
        <FormGroup label={t('System image')}>
          <TextField
            name="osImage"
            aria-label={t('System image')}
            value={values.osImage}
            helperText={t(
              'Must be either an OCI image ref (e.g. "quay.io/redhat/rhde:9.3") or ostree ref (e.g. "https://ostree.fedoraproject.org/iot?ref=fedora/stable/x86_64/iot"). Keep this empty if you do not want to manage your OS from fleet.',
            )}
          />
        </FormGroup>
        <FormGroup>
          <ConfigTemplateForm />
        </FormGroup>
      </Form>
    </Grid>
  );
};

export default DeviceTemplateStep;
