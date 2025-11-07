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
import ipdService, { CreateIPDTreatmentDto } from '../../services/ipd.service';

interface TreatmentFormProps {
  opened: boolean;
  onClose: () => void;
  admissionId: string;
  onSuccess: () => void;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({ opened, onClose, admissionId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<Omit<CreateIPDTreatmentDto, 'admissionId'>>({
    initialValues: {
      treatmentDate: new Date().toISOString(),
      notes: '',
      treatmentPlan: '',
    },
  });

  const handleSubmit = async (values: Omit<CreateIPDTreatmentDto, 'admissionId'>) => {
    setLoading(true);
    try {
      const data: CreateIPDTreatmentDto = {
        ...values,
        admissionId,
      };
      const response = await ipdService.addTreatment(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Treatment note added successfully',
          color: 'green',
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to add treatment note',
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
      title="Add Treatment Note"
      size="md"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <DateTimePicker
            label="Treatment Date & Time"
            placeholder="Select date and time"
            valueFormat="DD MMM YYYY hh:mm A"
            value={form.values.treatmentDate ? new Date(form.values.treatmentDate) : null}
            onChange={(date: any) => {
              try {
                const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
                form.setFieldValue('treatmentDate', isoDate);
              } catch {
                form.setFieldValue('treatmentDate', new Date().toISOString());
              }
            }}
          />

          <Textarea
            label="Treatment Notes"
            placeholder="Enter treatment observations and notes"
            minRows={3}
            {...form.getInputProps('notes')}
          />

          <Textarea
            label="Treatment Plan"
            placeholder="Enter treatment plan and next steps"
            minRows={3}
            {...form.getInputProps('treatmentPlan')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Treatment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TreatmentForm;
