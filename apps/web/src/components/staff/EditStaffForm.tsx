'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  TextInput,
  Button,
  Group,
  Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import staffService, { UpdateStaffDto } from '../../services/staff.service';

interface EditStaffFormProps {
  staffId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditStaffForm: React.FC<EditStaffFormProps> = ({
  staffId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateStaffDto>({
    firstName: '',
    lastName: '',
    designation: '',
    specialization: '',
    licenseNumber: '',
    qualification: '',
    experience: '',
    joiningDate: '',
    employeeId: '',
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.user?.firstName || initialData.firstName || '',
        lastName: initialData.user?.lastName || initialData.lastName || '',
        designation: initialData.designation || '',
        specialization: initialData.user?.specialization || initialData.specialization || '',
        licenseNumber: initialData.user?.licenseNumber || initialData.licenseNumber || '',
        qualification: initialData.qualification || '',
        experience: initialData.experience || '',
        joiningDate: initialData.joiningDate
          ? new Date(initialData.joiningDate).toISOString().split('T')[0]
          : '',
        employeeId: initialData.employeeId || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof UpdateStaffDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName) {
      notifications.show({
        title: 'Validation Error',
        message: 'First name and last name are required',
        color: 'red',
      });
      return;
    }

    // Name validation
    if (formData.firstName.length < 2 || formData.lastName.length < 2) {
      notifications.show({
        title: 'Validation Error',
        message: 'First name and last name must be at least 2 characters long',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await staffService.updateStaff(staffId, formData);
      
      notifications.show({
        title: 'Success',
        message: 'Staff member updated successfully',
        color: 'green',
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error updating staff:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update staff member';
      notifications.show({
        title: 'Error',
        message: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Basic Information */}
        <SimpleGrid cols={2}>
          <TextInput
            label="First Name"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
          <TextInput
            label="Last Name"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </SimpleGrid>

        {/* Professional Information */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Designation"
            placeholder="e.g., Senior Doctor"
            value={formData.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
          <TextInput
            label="Specialization"
            placeholder="e.g., Cardiology"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
          />
        </SimpleGrid>

        {/* License and Qualification */}
        <SimpleGrid cols={2}>
          <TextInput
            label="License Number"
            placeholder="Enter license number"
            value={formData.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
          />
          <TextInput
            label="Qualification"
            placeholder="e.g., MBBS, MD"
            value={formData.qualification}
            onChange={(e) => handleChange('qualification', e.target.value)}
          />
        </SimpleGrid>

        {/* Experience and Employee ID */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Experience"
            placeholder="e.g., 5 years in Cardiology"
            value={formData.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
          />
          <TextInput
            label="Employee ID"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
          />
        </SimpleGrid>

        {/* Joining Date */}
        <TextInput
          label="Joining Date"
          type="date"
          value={formData.joiningDate}
          onChange={(e) => handleChange('joiningDate', e.target.value)}
        />

        {/* Active Status */}
        <Switch
          label="Active Status"
          checked={formData.isActive}
          onChange={(e) => handleChange('isActive', e.currentTarget.checked)}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Staff
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default EditStaffForm;
