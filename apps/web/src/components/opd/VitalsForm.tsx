'use client';

import React, { useState } from 'react';
import {
  Modal,
  NumberInput,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  LoadingOverlay,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import opdService, { CreateOPDVitalsDto } from '../../services/opd.service';

interface VitalsFormProps {
  opened: boolean;
  onClose: () => void;
  visitId: string;
  onSuccess: () => void;
}

const VitalsForm: React.FC<VitalsFormProps> = ({ opened, onClose, visitId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<Omit<CreateOPDVitalsDto, 'visitId'>>({
    initialValues: {
      height: undefined,
      weight: undefined,
      bp: '',
      pulse: undefined,
      temperature: undefined,
      respirationRate: undefined,
      spo2: undefined,
      notes: '',
      recordedBy: '',
    },
  });

  const handleSubmit = async (values: Omit<CreateOPDVitalsDto, 'visitId'>) => {
    setLoading(true);
    try {
      const data: CreateOPDVitalsDto = {
        ...values,
        visitId,
      };
      const response = await opdService.addVitals(data);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Vitals recorded successfully',
          color: 'green',
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to record vitals',
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
      title="Record Vitals"
      size="lg"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Height (cm)"
                placeholder="Enter height"
                min={0}
                max={300}
                decimalScale={1}
                {...form.getInputProps('height')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Weight (kg)"
                placeholder="Enter weight"
                min={0}
                max={500}
                decimalScale={1}
                {...form.getInputProps('weight')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Blood Pressure"
                placeholder="e.g., 120/80"
                {...form.getInputProps('bp')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Pulse (bpm)"
                placeholder="Enter pulse rate"
                min={0}
                max={300}
                {...form.getInputProps('pulse')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Temperature (°F)"
                placeholder="Enter temperature"
                min={90}
                max={110}
                decimalScale={1}
                {...form.getInputProps('temperature')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Respiration Rate (breaths/min)"
                placeholder="Enter respiration rate"
                min={0}
                max={100}
                {...form.getInputProps('respirationRate')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="SpO2 (%)"
                placeholder="Enter oxygen saturation"
                min={0}
                max={100}
                {...form.getInputProps('spo2')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Recorded By"
                placeholder="Enter name (optional)"
                {...form.getInputProps('recordedBy')}
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            minRows={2}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Vitals
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default VitalsForm;
