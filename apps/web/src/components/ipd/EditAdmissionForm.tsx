'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  Select,
  Button,
  Group,
  Textarea,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ipdService, { UpdateAdmissionDto } from '../../services/ipd.service';

interface EditAdmissionFormProps {
  admissionId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
  doctors?: Array<{ value: string; label: string }>;
}

const EditAdmissionForm: React.FC<EditAdmissionFormProps> = ({
  admissionId,
  initialData,
  onSuccess,
  onCancel,
  doctors = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateAdmissionDto>({
    doctorId: '',
    diagnosis: '',
    notes: '',
    expectedDischargeDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        doctorId: initialData.doctorId || '',
        diagnosis: initialData.title || initialData.diagnosis || '',
        notes: initialData.description || initialData.notes || '',
        expectedDischargeDate: initialData.expectedDischargeDate || '',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof UpdateAdmissionDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await ipdService.updateAdmission(admissionId, formData);

      notifications.show({
        title: 'Success',
        message: 'Admission updated successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating admission:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update admission',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Select
          label="Doctor"
          placeholder="Select doctor"
          value={formData.doctorId}
          onChange={(value) => handleChange('doctorId', value || '')}
          data={doctors}
          searchable
        />

        <Textarea
          label="Diagnosis"
          placeholder="Enter or update diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleChange('diagnosis', e.target.value)}
          minRows={2}
        />

        <Textarea
          label="Notes"
          placeholder="Update notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={3}
        />

        <TextInput
          label="Expected Discharge Date"
          type="date"
          value={formData.expectedDischargeDate}
          onChange={(e) => handleChange('expectedDischargeDate', e.target.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Admission
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default EditAdmissionForm;
