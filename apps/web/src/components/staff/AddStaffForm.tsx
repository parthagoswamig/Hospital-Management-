'use client';

import React, { useState } from 'react';
import {
  Stack,
  SimpleGrid,
  TextInput,
  Select,
  Button,
  Group,
  PasswordInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import staffService, { CreateStaffDto } from '../../services/staff.service';

interface AddStaffFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStaffDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'DOCTOR',
    designation: '',
    specialization: '',
    licenseNumber: '',
    qualification: '',
    experience: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: keyof CreateStaffDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.role) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields (First Name, Last Name, Email, Password, Role)',
        color: 'red',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please enter a valid email address',
        color: 'red',
      });
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      notifications.show({
        title: 'Validation Error',
        message: 'Password must be at least 8 characters long',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Clean up empty optional fields
      const cleanedData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };

      // Only include optional fields if they have values
      if (formData.designation) cleanedData.designation = formData.designation;
      if (formData.specialization) cleanedData.specialization = formData.specialization;
      if (formData.departmentId) cleanedData.departmentId = formData.departmentId;
      if (formData.licenseNumber) cleanedData.licenseNumber = formData.licenseNumber;
      if (formData.qualification) cleanedData.qualification = formData.qualification;
      if (formData.experience) cleanedData.experience = formData.experience;
      if (formData.joiningDate) cleanedData.joiningDate = formData.joiningDate;
      if (formData.employeeId) cleanedData.employeeId = formData.employeeId;

      await staffService.createStaff(cleanedData);
      
      notifications.show({
        title: 'Success',
        message: 'Staff member added successfully',
        color: 'green',
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating staff:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to add staff member';
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

        {/* Contact Information */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />
        </SimpleGrid>

        {/* Role and Department */}
        <SimpleGrid cols={2}>
          <Select
            label="Role"
            placeholder="Select role"
            value={formData.role}
            onChange={(value) => handleChange('role', value as any)}
            data={[
              { value: 'DOCTOR', label: 'Doctor' },
              { value: 'NURSE', label: 'Nurse' },
              { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
              { value: 'PHARMACIST', label: 'Pharmacist' },
              { value: 'RECEPTIONIST', label: 'Receptionist' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
            required
          />
          <TextInput
            label="Designation"
            placeholder="e.g., Senior Doctor"
            value={formData.designation}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </SimpleGrid>

        {/* Professional Information */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Specialization"
            placeholder="e.g., Cardiology"
            value={formData.specialization}
            onChange={(e) => handleChange('specialization', e.target.value)}
          />
          <TextInput
            label="License Number"
            placeholder="Enter license number"
            value={formData.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
          />
        </SimpleGrid>

        {/* Qualification and Experience */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Qualification"
            placeholder="e.g., MBBS, MD"
            value={formData.qualification}
            onChange={(e) => handleChange('qualification', e.target.value)}
          />
          <TextInput
            label="Experience"
            placeholder="e.g., 5 years in Cardiology"
            value={formData.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
          />
        </SimpleGrid>

        {/* Employee ID and Joining Date */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Employee ID (Optional)"
            placeholder="Auto-generated if empty"
            value={formData.employeeId}
            onChange={(e) => handleChange('employeeId', e.target.value)}
          />
          <TextInput
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => handleChange('joiningDate', e.target.value)}
          />
        </SimpleGrid>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Staff
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default AddStaffForm;
