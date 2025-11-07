'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import opdService, { CreateOPDVisitDto, OPDVisitStatus } from '../../services/opd.service';
import patientsService from '../../services/patients.service';
import departmentService from '../../services/department.service';

interface AddVisitFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PatientOption {
  value: string;
  label: string;
}

interface DepartmentOption {
  value: string;
  label: string;
}

const AddVisitForm: React.FC<AddVisitFormProps> = ({ opened, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const form = useForm<CreateOPDVisitDto>({
    initialValues: {
      patientId: '',
      departmentId: '',
      visitDate: new Date().toISOString(),
      complaint: '',
      diagnosis: '',
      treatmentPlan: '',
      notes: '',
      status: 'PENDING' as OPDVisitStatus,
    },
    validate: {
      patientId: (value) => (!value ? 'Patient is required' : null),
    },
  });

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const response = await patientsService.getPatients({ page: 1, limit: 100 });
        if (response.success && response.data) {
          const patientOptions = response.data.patients.map((patient: any) => ({
            value: patient.id,
            label: `${patient.firstName} ${patient.lastName} - ${patient.medicalRecordNumber || 'N/A'}`,
          }));
          setPatients(patientOptions);
        }
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to load patients',
          color: 'red',
        });
      } finally {
        setLoadingPatients(false);
      }
    };

    if (opened) {
      fetchPatients();
    }
  }, [opened]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await departmentService.getDepartments();
        if (response.success && response.data) {
          const deptOptions = response.data.map((dept: any) => ({
            value: dept.id,
            label: dept.name,
          }));
          setDepartments(deptOptions);
        }
      } catch (error: any) {
        notifications.show({
          title: 'Error',
          message: error.message || 'Failed to load departments',
          color: 'red',
        });
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (opened) {
      fetchDepartments();
    }
  }, [opened]);

  const handleSubmit = async (values: CreateOPDVisitDto) => {
    setLoading(true);
    try {
      const response = await opdService.createVisit(values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'OPD visit created successfully',
          color: 'green',
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create OPD visit',
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
      title="Add OPD Visit"
      size="lg"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Patient"
            placeholder="Select patient"
            data={patients}
            searchable
            required
            disabled={loadingPatients}
            {...form.getInputProps('patientId')}
          />

          <Select
            label="Department"
            placeholder="Select department (optional)"
            data={departments}
            searchable
            clearable
            disabled={loadingDepartments}
            {...form.getInputProps('departmentId')}
          />

          <DateTimePicker
            label="Visit Date & Time"
            placeholder="Select date and time"
            valueFormat="DD MMM YYYY hh:mm A"
            value={form.values.visitDate ? new Date(form.values.visitDate) : null}
            onChange={(date: any) => {
              try {
                const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
                form.setFieldValue('visitDate', isoDate);
              } catch {
                form.setFieldValue('visitDate', new Date().toISOString());
              }
            }}
          />

          <Textarea
            label="Chief Complaint"
            placeholder="Enter patient's chief complaint"
            minRows={2}
            {...form.getInputProps('complaint')}
          />

          <Textarea
            label="Diagnosis"
            placeholder="Enter diagnosis (optional)"
            minRows={2}
            {...form.getInputProps('diagnosis')}
          />

          <Textarea
            label="Treatment Plan"
            placeholder="Enter treatment plan (optional)"
            minRows={2}
            {...form.getInputProps('treatmentPlan')}
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            minRows={2}
            {...form.getInputProps('notes')}
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            {...form.getInputProps('status')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Visit
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddVisitForm;
