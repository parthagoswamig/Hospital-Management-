'use client';

import React, { useState } from 'react';
import {
  Stack,
  Button,
  Group,
  Textarea,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ipdService, { DischargePatientDto } from '../../services/ipd.service';

interface DischargePatientFormProps {
  admissionId: string;
  patientName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DischargePatientForm: React.FC<DischargePatientFormProps> = ({
  admissionId,
  patientName,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DischargePatientDto>({
    dischargeSummary: '',
    dischargeInstructions: '',
    followUpDate: '',
  });

  const handleChange = (field: keyof DischargePatientDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dischargeSummary) {
      notifications.show({
        title: 'Validation Error',
        message: 'Discharge summary is required',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await ipdService.dischargePatient(admissionId, formData);

      notifications.show({
        title: 'Success',
        message: `${patientName || 'Patient'} discharged successfully`,
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error discharging patient:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to discharge patient',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Textarea
          label="Discharge Summary"
          placeholder="Enter discharge summary (required)"
          value={formData.dischargeSummary}
          onChange={(e) => handleChange('dischargeSummary', e.target.value)}
          required
          minRows={4}
        />

        <Textarea
          label="Discharge Instructions"
          placeholder="Enter instructions for patient (optional)"
          value={formData.dischargeInstructions}
          onChange={(e) => handleChange('dischargeInstructions', e.target.value)}
          minRows={3}
        />

        <TextInput
          label="Follow-up Date (Optional)"
          type="datetime-local"
          value={formData.followUpDate}
          onChange={(e) => handleChange('followUpDate', e.target.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} color="green">
            Discharge Patient
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default DischargePatientForm;
