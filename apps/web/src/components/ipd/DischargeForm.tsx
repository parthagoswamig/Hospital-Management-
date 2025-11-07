'use client';

import React, { useState } from 'react';
import {
  Modal,
  Textarea,
  Button,
  Group,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import ipdService, { CreateIPDDischargeSummaryDto } from '../../services/ipd.service';

interface DischargeFormProps {
  opened: boolean;
  onClose: () => void;
  admissionId: string;
  onSuccess: () => void;
}

const DischargeForm: React.FC<DischargeFormProps> = ({ opened, onClose, admissionId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<Omit<CreateIPDDischargeSummaryDto, 'admissionId'>>({
    initialValues: {
      dischargeDate: new Date().toISOString(),
      finalDiagnosis: '',
      treatmentGiven: '',
      conditionAtDischarge: '',
      followUpAdvice: '',
    },
  });

  const handleSubmit = async (values: Omit<CreateIPDDischargeSummaryDto, 'admissionId'>) => {
    setLoading(true);
    try {
      const data: CreateIPDDischargeSummaryDto = {
        ...values,
        admissionId,
      };
      const response = await ipdService.createDischargeSummary(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Patient discharged successfully',
          color: 'green',
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to discharge patient',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Discharge Patient"
      size="lg"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <DateTimePicker
            label="Discharge Date & Time"
            placeholder="Select date and time"
            valueFormat="DD MMM YYYY hh:mm A"
            value={form.values.dischargeDate ? new Date(form.values.dischargeDate) : null}
            onChange={(date: any) => {
              try {
                const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
                form.setFieldValue('dischargeDate', isoDate);
              } catch {
                form.setFieldValue('dischargeDate', new Date().toISOString());
              }
            }}
          />

          <Textarea
            label="Final Diagnosis"
            placeholder="Enter final diagnosis"
            minRows={2}
            {...form.getInputProps('finalDiagnosis')}
          />

          <Textarea
            label="Treatment Given"
            placeholder="Describe all treatments provided during admission"
            minRows={3}
            {...form.getInputProps('treatmentGiven')}
          />

          <Textarea
            label="Condition at Discharge"
            placeholder="Describe patient's condition at discharge"
            minRows={2}
            {...form.getInputProps('conditionAtDischarge')}
          />

          <Textarea
            label="Follow-up Advice"
            placeholder="Enter follow-up instructions and advice"
            minRows={3}
            {...form.getInputProps('followUpAdvice')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="red">
              Discharge Patient
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default DischargeForm;
