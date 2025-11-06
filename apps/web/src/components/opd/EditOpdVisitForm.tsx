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
import opdService, { UpdateOpdVisitDto } from '../../services/opd.service';

interface EditOpdVisitFormProps {
  visitId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
  doctors?: Array<{ value: string; label: string }>;
  departments?: Array<{ value: string; label: string }>;
}

const EditOpdVisitForm: React.FC<EditOpdVisitFormProps> = ({
  visitId,
  initialData,
  onSuccess,
  onCancel,
  doctors = [],
  departments = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateOpdVisitDto>({
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        doctorId: initialData.doctorId || '',
        departmentId: initialData.departmentId || '',
        chiefComplaint: initialData.reason || initialData.chiefComplaint || '',
        symptoms: initialData.symptoms || '',
        diagnosis: initialData.diagnosis || '',
        treatment: initialData.treatment || '',
        notes: initialData.notes || '',
        followUpDate: initialData.followUpDate || '',
        status: initialData.status || 'WAITING',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof UpdateOpdVisitDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await opdService.updateVisit(visitId, formData);

      notifications.show({
        title: 'Success',
        message: 'OPD visit updated successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating OPD visit:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update OPD visit',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Doctor and Department */}
        <SimpleGrid cols={2}>
          <Select
            label="Doctor"
            placeholder="Select doctor"
            value={formData.doctorId}
            onChange={(value) => handleChange('doctorId', value || '')}
            data={doctors}
            searchable
          />
          <Select
            label="Department"
            placeholder="Select department"
            value={formData.departmentId}
            onChange={(value) => handleChange('departmentId', value || '')}
            data={departments}
            searchable
          />
        </SimpleGrid>

        {/* Status */}
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
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'NO_SHOW', label: 'No Show' },
          ]}
        />

        {/* Chief Complaint */}
        <Textarea
          label="Chief Complaint"
          placeholder="Enter main reason for visit"
          value={formData.chiefComplaint}
          onChange={(e) => handleChange('chiefComplaint', e.target.value)}
          minRows={2}
        />

        {/* Symptoms */}
        <Textarea
          label="Symptoms"
          placeholder="Enter symptoms"
          value={formData.symptoms}
          onChange={(e) => handleChange('symptoms', e.target.value)}
          minRows={2}
        />

        {/* Diagnosis and Treatment */}
        <SimpleGrid cols={2}>
          <Textarea
            label="Diagnosis"
            placeholder="Enter diagnosis"
            value={formData.diagnosis}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            minRows={2}
          />
          <Textarea
            label="Treatment"
            placeholder="Enter treatment plan"
            value={formData.treatment}
            onChange={(e) => handleChange('treatment', e.target.value)}
            minRows={2}
          />
        </SimpleGrid>

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={2}
        />

        {/* Follow-up Date */}
        <TextInput
          label="Follow-up Date"
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
            Update Visit
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default EditOpdVisitForm;
