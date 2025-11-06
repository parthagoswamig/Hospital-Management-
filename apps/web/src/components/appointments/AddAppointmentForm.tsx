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
import appointmentsService, { CreateAppointmentDto } from '../../services/appointments.service';

interface AddAppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  patients?: Array<{ value: string; label: string }>;
  doctors?: Array<{ value: string; label: string }>;
  departments?: Array<{ value: string; label: string }>;
}

const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({
  onSuccess,
  onCancel,
  patients = [],
  doctors = [],
  departments = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    patientId: '',
    doctorId: '',
    departmentId: '',
    appointmentDateTime: new Date().toISOString(),
    reason: '',
    notes: '',
    status: 'SCHEDULED',
  });

  const handleChange = (field: keyof CreateAppointmentDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId || !formData.appointmentDateTime) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields (Patient, Doctor, Date/Time)',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await appointmentsService.createAppointment(formData);

      notifications.show({
        title: 'Success',
        message: 'Appointment scheduled successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to schedule appointment',
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
          required
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
          onChange={(value) => handleChange('status', value || 'SCHEDULED')}
          data={[
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PENDING', label: 'Pending' },
          ]}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Schedule Appointment
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default AddAppointmentForm;
