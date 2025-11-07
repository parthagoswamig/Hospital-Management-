'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  TextInput,
  Select,
  Button,
  Group,
  PasswordInput,
  Modal,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import staffService, { CreateStaffDto } from '../../services/staff.service';

interface AddStaffFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '', description: '' });
  const [formData, setFormData] = useState<CreateStaffDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'DOCTOR',
    // Don't initialize optional fields - they'll be undefined
  });

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // You'll need to create this API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/departments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': localStorage.getItem('tenantId') || '',
        },
      });
      const data = await response.json();
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.name || !newDepartment.code) {
      notifications.show({
        title: 'Validation Error',
        message: 'Department name and code are required',
        color: 'red',
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': localStorage.getItem('tenantId') || '',
        },
        body: JSON.stringify(newDepartment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create department');
      }

      const data = await response.json();
      
      notifications.show({
        title: 'Success',
        message: 'Department created successfully',
        color: 'green',
      });

      // Refresh departments list
      await fetchDepartments();
      
      // Select the newly created department
      setFormData(prev => ({ ...prev, departmentId: data.data.id }));
      
      // Close modal and reset form
      setShowAddDepartment(false);
      setNewDepartment({ name: '', code: '', description: '' });
    } catch (error: any) {
      console.error('Department creation error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create department',
        color: 'red',
      });
    }
  };

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

      // Only include optional fields if they have values (not empty strings)
      if (formData.designation && formData.designation.trim()) {
        cleanedData.designation = formData.designation;
      }
      if (formData.specialization && formData.specialization.trim()) {
        cleanedData.specialization = formData.specialization;
      }
      if (formData.departmentId && formData.departmentId.trim()) {
        cleanedData.departmentId = formData.departmentId;
      }
      if (formData.licenseNumber && formData.licenseNumber.trim()) {
        cleanedData.licenseNumber = formData.licenseNumber;
      }
      if (formData.qualification && formData.qualification.trim()) {
        cleanedData.qualification = formData.qualification;
      }
      if (formData.experience && formData.experience.trim()) {
        cleanedData.experience = formData.experience;
      }
      if (formData.joiningDate && formData.joiningDate.trim()) {
        // Ensure ISO 8601 format (YYYY-MM-DD)
        cleanedData.joiningDate = formData.joiningDate;
      }
      if (formData.employeeId && formData.employeeId.trim()) {
        cleanedData.employeeId = formData.employeeId;
      }

      // Fixed: Filter out empty strings for optional fields
      console.log('📤 Submitting staff data:', cleanedData);

      await staffService.createStaff(cleanedData);
      
      notifications.show({
        title: 'Success',
        message: 'Staff member added successfully',
        color: 'green',
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('❌ Error creating staff:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Full error object:', JSON.stringify(error.response?.data, null, 2));
      
      // Extract detailed error message
      let errorMessage = 'Failed to add staff member';
      
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        console.log('❌ Validation errors:', msg);
        
        if (Array.isArray(msg)) {
          errorMessage = msg.join('\n• ');
          errorMessage = '• ' + errorMessage;
        } else {
          errorMessage = msg;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifications.show({
        title: 'Error Creating Staff',
        message: errorMessage,
        color: 'red',
        autoClose: 15000, // Show for 15 seconds
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
            value={formData.designation || ''}
            onChange={(e) => handleChange('designation', e.target.value)}
          />
        </SimpleGrid>

        {/* Department Selection with Add New Option */}
        <Group align="flex-end" grow>
          <Select
            label="Department"
            placeholder="Select department (optional)"
            value={formData.departmentId || ''}
            onChange={(value) => handleChange('departmentId', value || undefined)}
            data={departments.map(dept => ({
              value: dept.id,
              label: dept.name,
            }))}
            clearable
            searchable
            style={{ flex: 1 }}
          />
          <Tooltip label="Add New Department">
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowAddDepartment(true)}
            >
              Add Department
            </Button>
          </Tooltip>
        </Group>

        {/* Professional Information */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Specialization"
            placeholder="e.g., Cardiology"
            value={formData.specialization || ''}
            onChange={(e) => handleChange('specialization', e.target.value)}
          />
          <TextInput
            label="License Number"
            placeholder="Enter license number"
            value={formData.licenseNumber || ''}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
          />
        </SimpleGrid>

        {/* Qualification and Experience */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Qualification"
            placeholder="e.g., MBBS, MD"
            value={formData.qualification || ''}
            onChange={(e) => handleChange('qualification', e.target.value)}
          />
          <TextInput
            label="Experience"
            placeholder="e.g., 5 years in Cardiology"
            value={formData.experience || ''}
            onChange={(e) => handleChange('experience', e.target.value)}
          />
        </SimpleGrid>

        {/* Employee ID and Joining Date */}
        <SimpleGrid cols={2}>
          <TextInput
            label="Employee ID (Optional)"
            placeholder="Auto-generated if empty"
            value={formData.employeeId || ''}
            onChange={(e) => handleChange('employeeId', e.target.value)}
          />
          <TextInput
            label="Joining Date"
            type="date"
            value={formData.joiningDate || ''}
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

      {/* Add Department Modal */}
      <Modal
        opened={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        title="Add New Department"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Department Name"
            placeholder="e.g., Cardiology"
            value={newDepartment.name}
            onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <TextInput
            label="Department Code"
            placeholder="e.g., CARD"
            value={newDepartment.code}
            onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            required
          />
          <TextInput
            label="Description (Optional)"
            placeholder="e.g., Heart and cardiovascular care"
            value={newDepartment.description}
            onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setShowAddDepartment(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment}>
              Create Department
            </Button>
          </Group>
        </Stack>
      </Modal>
    </form>
  );
};

export default AddStaffForm;
