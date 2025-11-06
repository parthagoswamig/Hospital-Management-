'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  Select,
  Button,
  Group,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ipdService, { TransferPatientDto } from '../../services/ipd.service';

interface TransferPatientFormProps {
  admissionId: string;
  patientName?: string;
  currentBedId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  availableBeds?: Array<{ value: string; label: string }>;
}

const TransferPatientForm: React.FC<TransferPatientFormProps> = ({
  admissionId,
  patientName,
  currentBedId,
  onSuccess,
  onCancel,
  availableBeds = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [beds, setBeds] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState<TransferPatientDto>({
    newBedId: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (availableBeds.length === 0) {
      fetchAvailableBeds();
    } else {
      // Filter out current bed
      const filtered = availableBeds.filter((bed) => bed.value !== currentBedId);
      setBeds(filtered);
    }
  }, [availableBeds, currentBedId]);

  const fetchAvailableBeds = async () => {
    try {
      const response = await ipdService.getAvailableBeds();
      const bedOptions = response.data
        .filter((bed) => bed.id !== currentBedId)
        .map((bed) => ({
          value: bed.id,
          label: `${bed.bedNumber} - ${bed.ward?.name || 'Unknown Ward'}`,
        }));
      setBeds(bedOptions);
    } catch (error) {
      console.error('Error fetching beds:', error);
      notifications.show({
        title: 'Warning',
        message: 'Could not load available beds',
        color: 'yellow',
      });
    }
  };

  const handleChange = (field: keyof TransferPatientDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newBedId || !formData.reason) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a bed and provide a reason for transfer',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await ipdService.transferPatient(admissionId, formData);

      notifications.show({
        title: 'Success',
        message: `${patientName || 'Patient'} transferred successfully`,
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error transferring patient:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to transfer patient',
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
          label="New Bed"
          placeholder="Select available bed"
          value={formData.newBedId}
          onChange={(value) => handleChange('newBedId', value || '')}
          data={beds}
          searchable
          required
        />

        <Textarea
          label="Reason for Transfer"
          placeholder="Enter reason for transfer (required)"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          required
          minRows={2}
        />

        <Textarea
          label="Notes (Optional)"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={2}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} color="blue">
            Transfer Patient
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default TransferPatientForm;
