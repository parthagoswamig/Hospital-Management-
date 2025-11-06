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
import patientsService, { CreatePatientDto } from '../../services/patients.service';

interface EditPatientFormProps {
  patientId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditPatientForm: React.FC<EditPatientFormProps> = ({
  patientId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePatientDto>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        middleName: initialData.middleName || '',
        dateOfBirth: initialData.dateOfBirth || '',
        gender: initialData.gender || '',
        bloodType: initialData.bloodType || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || initialData.pincode || '',
        country: initialData.country || 'India',
        emergencyContactName: initialData.emergencyContactName || '',
        emergencyContactPhone: initialData.emergencyContactPhone || '',
        emergencyContactRelationship: initialData.emergencyContactRelationship || '',
        insuranceProvider: initialData.insuranceProvider || '',
        insurancePolicyNumber: initialData.insurancePolicyNumber || initialData.insuranceId || '',
        maritalStatus: initialData.maritalStatus || '',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof CreatePatientDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await patientsService.updatePatient(patientId, formData);

      notifications.show({
        title: 'Success',
        message: 'Patient updated successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating patient:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update patient',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <SimpleGrid cols={3}>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
          />
          <TextInput
            label="Middle Name"
            placeholder="Enter middle name"
            value={formData.middleName}
            onChange={(e) => handleChange('middleName', e.target.value)}
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid cols={3}>
          <TextInput
            label="Phone"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          <TextInput
            label="Email"
            placeholder="patient@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <DateInput
            label="Date of Birth"
            placeholder="Select date"
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
            onChange={(value) =>
              handleChange('dateOfBirth', value ? (value as unknown as Date).toISOString() : '')
            }
            maxDate={new Date()}
          />
        </SimpleGrid>

        <SimpleGrid cols={3}>
          <Select
            label="Gender"
            placeholder="Select gender"
            value={formData.gender}
            onChange={(value) => handleChange('gender', value || '')}
            data={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
          <Select
            label="Blood Type"
            placeholder="Select blood type"
            value={formData.bloodType}
            onChange={(value) => handleChange('bloodType', value || '')}
            data={[
              { value: 'A_POSITIVE', label: 'A+' },
              { value: 'A_NEGATIVE', label: 'A-' },
              { value: 'B_POSITIVE', label: 'B+' },
              { value: 'B_NEGATIVE', label: 'B-' },
              { value: 'AB_POSITIVE', label: 'AB+' },
              { value: 'AB_NEGATIVE', label: 'AB-' },
              { value: 'O_POSITIVE', label: 'O+' },
              { value: 'O_NEGATIVE', label: 'O-' },
            ]}
          />
          <Select
            label="Marital Status"
            placeholder="Select status"
            value={formData.maritalStatus}
            onChange={(value) => handleChange('maritalStatus', value || '')}
            data={[
              { value: 'SINGLE', label: 'Single' },
              { value: 'MARRIED', label: 'Married' },
              { value: 'DIVORCED', label: 'Divorced' },
              { value: 'WIDOWED', label: 'Widowed' },
            ]}
          />
        </SimpleGrid>

        <Textarea
          label="Address"
          placeholder="Enter full address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          minRows={2}
        />

        <SimpleGrid cols={4}>
          <TextInput
            label="City"
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <TextInput
            label="State"
            placeholder="State"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
          />
          <TextInput
            label="Postal Code"
            placeholder="123456"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
          />
          <TextInput
            label="Country"
            placeholder="Country"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid cols={3}>
          <TextInput
            label="Emergency Contact Name"
            placeholder="Contact name"
            value={formData.emergencyContactName}
            onChange={(e) => handleChange('emergencyContactName', e.target.value)}
          />
          <TextInput
            label="Emergency Contact Phone"
            placeholder="+91 9876543210"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
          />
          <TextInput
            label="Relationship"
            placeholder="e.g., Spouse, Parent"
            value={formData.emergencyContactRelationship}
            onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <TextInput
            label="Insurance Provider"
            placeholder="Insurance company name"
            value={formData.insuranceProvider}
            onChange={(e) => handleChange('insuranceProvider', e.target.value)}
          />
          <TextInput
            label="Insurance Policy Number"
            placeholder="Policy number"
            value={formData.insurancePolicyNumber}
            onChange={(e) => handleChange('insurancePolicyNumber', e.target.value)}
          />
        </SimpleGrid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Patient
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default EditPatientForm;
