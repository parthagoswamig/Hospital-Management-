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
import ipdService, { CreateIPDAdmissionDto } from '../../services/ipd.service';
import patientsService from '../../services/patients.service';
import departmentService from '../../services/department.service';

interface AdmissionFormProps {
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

const AdmissionForm: React.FC<AdmissionFormProps> = ({ opened, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const form = useForm<CreateIPDAdmissionDto>({
    initialValues: {
      patientId: '',
      admissionDate: new Date().toISOString(),
      departmentId: '',
      wardId: '',
      bedId: '',
      doctorId: '',
      diagnosis: '',
      admissionReason: '',
      notes: '',
    },
    validate: {
      patientId: (value) => (!value ? 'Patient is required' : null),
    },
  });

  useEffect(() => {
    if (opened) {
      fetchPatients();
      fetchDepartments();
    }
  }, [opened]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      if (response.success && response.data) {
        const patientList = Array.isArray(response.data) ? response.data : response.data.patients || [];
        const patientOptions = patientList.map((patient: any) => ({
          value: patient.id,
          label: `${patient.firstName} ${patient.lastName} (${patient.medicalRecordNumber})`,
        }));
        setPatients(patientOptions);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

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
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleSubmit = async (values: CreateIPDAdmissionDto) => {
    setLoading(true);
    try {
      const response = await ipdService.admitPatient(values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Patient admitted successfully',
          color: 'green',
        });
        form.reset();
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to admit patient',
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
      title="Admit Patient"
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
            placeholder="Select department"
            data={departments}
            searchable
            clearable
            disabled={loadingDepartments}
            {...form.getInputProps('departmentId')}
          />

          <DateTimePicker
            label="Admission Date & Time"
            placeholder="Select date and time"
            valueFormat="DD MMM YYYY hh:mm A"
            value={form.values.admissionDate ? new Date(form.values.admissionDate) : null}
            onChange={(date: any) => {
              try {
                const isoDate = date ? new Date(date).toISOString() : new Date().toISOString();
                form.setFieldValue('admissionDate', isoDate);
              } catch {
                form.setFieldValue('admissionDate', new Date().toISOString());
              }
            }}
          />

          <Textarea
            label="Admission Reason"
            placeholder="Enter reason for admission"
            minRows={2}
            {...form.getInputProps('admissionReason')}
          />

          <Textarea
            label="Initial Diagnosis"
            placeholder="Enter initial diagnosis"
            minRows={2}
            {...form.getInputProps('diagnosis')}
          />

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
              Admit Patient
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AdmissionForm;
