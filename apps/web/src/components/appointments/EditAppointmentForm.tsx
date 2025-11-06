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
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import appointmentsService, { UpdateAppointmentDto } from '../../services/appointments.service';

interface EditAppointmentFormProps {
  appointmentId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
  patients?: Array<{ value: string; label: string }>;
  doctors?: Array<{ value: string; label: string }>;
  departments?: Array<{ value: string; label: string }>;
}

const EditAppointmentForm: React.FC<EditAppointmentFormProps> = ({
  appointmentId,
  initialData,
  onSuccess,
  onCancel,
  patients = [],
  doctors = [],
  departments = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateAppointmentDto>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        patientId: initialData.patientId || '',
        doctorId: initialData.doctorId || '',
        departmentId: initialData.departmentId || '',
        appointmentDateTime: initialData.appointmentDateTime || '',
        reason: initialData.reason || '',
        notes: initialData.notes || '',
        status: initialData.status || 'SCHEDULED',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof UpdateAppointmentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await appointmentsService.updateAppointment(appointmentId, formData);

      notifications.show({
        title: 'Success',
        message: 'Appointment updated successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update appointment',
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
          />
          <Select
            label="Doctor"
            placeholder="Select doctor"
            value={formData.doctorId}
            onChange={(value) => handleChange('doctorId', value || '')}
            data={doctors}
            searchable
          />
        </SimpleGrid>

        <Select
          label="Department (Optional)"
          placeholder="Select department"
          value={formData.departmentId}
          onChange={(value) => handleChange('departmentId', value || '')}
          data={departments}
          searchable
        />

        <DateTimePicker
          label="Appointment Date & Time"
          placeholder="Select date and time"
          value={formData.appointmentDateTime ? new Date(formData.appointmentDateTime) : null}
          onChange={(value) =>
            handleChange('appointmentDateTime', value ? (value as unknown as Date).toISOString() : '')
          }
          minDate={new Date()}
        />

        <TextInput
          label="Reason for Visit"
          placeholder="e.g., Regular checkup, Follow-up"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
        />

        <Textarea
          label="Additional Notes"
          placeholder="Any special instructions or notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={3}
        />

        <Select
          label="Status"
          placeholder="Select status"
          value={formData.status}
          onChange={(value) => handleChange('status', value || '')}
          data={[
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
            { value: 'NO_SHOW', label: 'No Show' },
          ]}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Appointment
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default EditAppointmentForm;
