'use client';

import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import opdService, { CreateOPDPrescriptionDto } from '../../services/opd.service';

interface PrescriptionFormProps {
  opened: boolean;
  onClose: () => void;
  visitId: string;
  onSuccess: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ opened, onClose, visitId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<Omit<CreateOPDPrescriptionDto, 'visitId'>>({
    initialValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    },
    validate: {
      medicationName: (value) => (!value ? 'Medication name is required' : null),
      dosage: (value) => (!value ? 'Dosage is required' : null),
      frequency: (value) => (!value ? 'Frequency is required' : null),
      duration: (value) => (!value ? 'Duration is required' : null),
    },
  });

  const handleSubmit = async (values: Omit<CreateOPDPrescriptionDto, 'visitId'>) => {
    setLoading(true);
    try {
      const data: CreateOPDPrescriptionDto = {
        ...values,
        visitId,
      };
      const response = await opdService.addPrescription(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Prescription added successfully',
          color: 'green',
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to add prescription',
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
      title="Add Prescription"
      size="md"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Medication Name"
            placeholder="e.g., Paracetamol 500mg"
            required
            {...form.getInputProps('medicationName')}
          />

          <TextInput
            label="Dosage"
            placeholder="e.g., 500mg"
            required
            {...form.getInputProps('dosage')}
          />

          <TextInput
            label="Frequency"
            placeholder="e.g., Twice daily, After meals"
            required
            {...form.getInputProps('frequency')}
          />

          <TextInput
            label="Duration"
            placeholder="e.g., 5 days, 1 week"
            required
            {...form.getInputProps('duration')}
          />

          <Textarea
            label="Instructions"
            placeholder="Additional instructions (optional)"
            minRows={2}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Prescription
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default PrescriptionForm;
