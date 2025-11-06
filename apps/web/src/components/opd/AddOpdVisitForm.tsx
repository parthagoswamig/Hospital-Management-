'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  TextInput,
  Select,
  Button,
  Group,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import opdService, { CreateOpdVisitDto } from '../../services/opd.service';

interface AddOpdVisitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  patients?: Array<{ value: string; label: string }>;
  doctors?: Array<{ value: string; label: string }>;
  departments?: Array<{ value: string; label: string }>;
}

const AddOpdVisitForm: React.FC<AddOpdVisitFormProps> = ({
  onSuccess,
  onCancel,
  patients = [],
  doctors = [],
  departments = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOpdVisitDto>({
    patientId: '',
    doctorId: '',
    departmentId: '',
    chiefComplaint: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpDate: '',
    status: 'WAITING',
  });

  const handleChange = (field: keyof CreateOpdVisitDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.patientId || !formData.doctorId || !formData.chiefComplaint) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields (Patient, Doctor, Chief Complaint)',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await opdService.createVisit(formData);

      notifications.show({
        title: 'Success',
        message: 'OPD visit created successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating OPD visit:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create OPD visit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Patient and Doctor Selection */}
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

        {/* Department and Status */}
        <SimpleGrid cols={2}>
          <Select
            label="Department (Optional)"
            placeholder="Select department"
            value={formData.departmentId}
            onChange={(value) => handleChange('departmentId', value || '')}
            data={departments}
            searchable
          />
          <Select
            label="Status"
            placeholder="Select status"
            value={formData.status}
            onChange={(value) => handleChange('status', value as any)}
            data={[
              { value: 'WAITING', label: 'Waiting' },
              { value: 'ARRIVED', label: 'Arrived' },
              { value: 'IN_CONSULTATION', label: 'In Consultation' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </SimpleGrid>

        {/* Chief Complaint */}
        <Textarea
          label="Chief Complaint"
          placeholder="Enter main reason for visit"
          value={formData.chiefComplaint}
          onChange={(e) => handleChange('chiefComplaint', e.target.value)}
          required
          minRows={2}
        />

        {/* Symptoms */}
        <Textarea
          label="Symptoms (Optional)"
          placeholder="Enter symptoms"
          value={formData.symptoms}
          onChange={(e) => handleChange('symptoms', e.target.value)}
          minRows={2}
        />

        {/* Diagnosis and Treatment */}
        <SimpleGrid cols={2}>
          <Textarea
            label="Diagnosis (Optional)"
            placeholder="Enter diagnosis"
            value={formData.diagnosis}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            minRows={2}
          />
          <Textarea
            label="Treatment (Optional)"
            placeholder="Enter treatment plan"
            value={formData.treatment}
            onChange={(e) => handleChange('treatment', e.target.value)}
            minRows={2}
          />
        </SimpleGrid>

        {/* Notes */}
        <Textarea
          label="Notes (Optional)"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={2}
        />

        {/* Follow-up Date */}
        <TextInput
          label="Follow-up Date (Optional)"
          type="datetime-local"
          value={formData.followUpDate}
          onChange={(e) => handleChange('followUpDate', e.target.value)}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Visit
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default AddOpdVisitForm;
