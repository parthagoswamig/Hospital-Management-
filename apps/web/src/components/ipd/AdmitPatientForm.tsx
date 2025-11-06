'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  Select,
  Button,
  Group,
  Textarea,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import ipdService, { CreateAdmissionDto } from '../../services/ipd.service';

interface AdmitPatientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  patients?: Array<{ value: string; label: string }>;
  doctors?: Array<{ value: string; label: string }>;
  beds?: Array<{ value: string; label: string }>;
}

const AdmitPatientForm: React.FC<AdmitPatientFormProps> = ({
  onSuccess,
  onCancel,
  patients = [],
  doctors = [],
  beds = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [availableBeds, setAvailableBeds] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState<CreateAdmissionDto>({
    patientId: '',
    bedId: '',
    doctorId: '',
    reason: '',
    diagnosis: '',
    notes: '',
    expectedDischargeDate: '',
  });

  useEffect(() => {
    if (beds.length === 0) {
      fetchAvailableBeds();
    } else {
      setAvailableBeds(beds);
    }
  }, [beds]);

  const fetchAvailableBeds = async () => {
    try {
      const response = await ipdService.getAvailableBeds();
      const bedOptions = response.data.map((bed) => ({
        value: bed.id,
        label: `${bed.bedNumber} - ${bed.ward?.name || 'Unknown Ward'}`,
      }));
      setAvailableBeds(bedOptions);
    } catch (error) {
      console.error('Error fetching beds:', error);
      notifications.show({
        title: 'Warning',
        message: 'Could not load available beds',
        color: 'yellow',
      });
    }
  };

  const handleChange = (field: keyof CreateAdmissionDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.bedId || !formData.doctorId || !formData.reason) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields (Patient, Bed, Doctor, Reason)',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await ipdService.admitPatient(formData);

      notifications.show({
        title: 'Success',
        message: 'Patient admitted successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error admitting patient:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to admit patient',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <SimpleGrid cols={2}>
          <Select
            label="Patient"
            placeholder="Select patient"
            value={formData.patientId}
            onChange={(value) => handleChange('patientId', value || '')}
            data={patients}
            searchable
            required
          />
          <Select
            label="Doctor"
            placeholder="Select doctor"
            value={formData.doctorId}
            onChange={(value) => handleChange('doctorId', value || '')}
            data={doctors}
            searchable
            required
          />
        </SimpleGrid>

        <Select
          label="Bed"
          placeholder="Select available bed"
          value={formData.bedId}
          onChange={(value) => handleChange('bedId', value || '')}
          data={availableBeds}
          searchable
          required
        />

        <Textarea
          label="Reason for Admission"
          placeholder="Enter reason for admission"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          required
          minRows={2}
        />

        <Textarea
          label="Diagnosis (Optional)"
          placeholder="Enter initial diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleChange('diagnosis', e.target.value)}
          minRows={2}
        />

        <Textarea
          label="Notes (Optional)"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={2}
        />

        <TextInput
          label="Expected Discharge Date (Optional)"
          type="date"
          value={formData.expectedDischargeDate}
          onChange={(e) => handleChange('expectedDischargeDate', e.target.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Admit Patient
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default AdmitPatientForm;
