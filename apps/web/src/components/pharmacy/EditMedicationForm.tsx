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
  NumberInput,
  Switch,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import pharmacyService, { UpdateMedicationDto } from '../../services/pharmacy.service';

interface EditMedicationFormProps {
  medicationId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditMedicationForm: React.FC<EditMedicationFormProps> = ({
  medicationId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateMedicationDto>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        genericName: initialData.genericName || '',
        description: initialData.description || '',
        dosageForm: initialData.dosageForm || '',
        strength: initialData.strength || '',
        manufacturer: initialData.manufacturer || '',
        category: initialData.category || '',
        unitPrice: initialData.unitPrice || 0,
        quantityInStock: initialData.quantityInStock || 0,
        minimumStockLevel: initialData.minimumStockLevel || 10,
        reorderLevel: initialData.reorderLevel || 20,
        expiryDate: initialData.expiryDate || '',
        batchNumber: initialData.batchNumber || '',
        barcode: initialData.barcode || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof UpdateMedicationDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await pharmacyService.updateMedication(medicationId, formData);

      notifications.show({
        title: 'Success',
        message: 'Medication updated successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating medication:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update medication',
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
          <TextInput
            label="Drug Name"
            placeholder="Enter drug name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <TextInput
            label="Generic Name"
            placeholder="Enter generic name"
            value={formData.genericName}
            onChange={(e) => handleChange('genericName', e.target.value)}
          />
        </SimpleGrid>

        <Textarea
          label="Description"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          minRows={2}
        />

        <SimpleGrid cols={3}>
          <Select
            label="Category"
            placeholder="Select category"
            value={formData.category}
            onChange={(value) => handleChange('category', value || '')}
            data={[
              { value: 'ANTIBIOTIC', label: 'Antibiotic' },
              { value: 'ANALGESIC', label: 'Analgesic' },
              { value: 'ANTIPYRETIC', label: 'Antipyretic' },
              { value: 'ANTIVIRAL', label: 'Antiviral' },
              { value: 'ANTIFUNGAL', label: 'Antifungal' },
              { value: 'VITAMIN', label: 'Vitamin' },
              { value: 'SUPPLEMENT', label: 'Supplement' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
          <Select
            label="Dosage Form"
            placeholder="Select form"
            value={formData.dosageForm}
            onChange={(value) => handleChange('dosageForm', value || '')}
            data={[
              { value: 'TABLET', label: 'Tablet' },
              { value: 'CAPSULE', label: 'Capsule' },
              { value: 'SYRUP', label: 'Syrup' },
              { value: 'INJECTION', label: 'Injection' },
              { value: 'CREAM', label: 'Cream' },
              { value: 'DROPS', label: 'Drops' },
              { value: 'INHALER', label: 'Inhaler' },
            ]}
          />
          <TextInput
            label="Strength"
            placeholder="e.g., 500mg"
            value={formData.strength}
            onChange={(e) => handleChange('strength', e.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <TextInput
            label="Manufacturer"
            placeholder="Enter manufacturer"
            value={formData.manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
          />
          <TextInput
            label="Batch Number"
            placeholder="Enter batch number"
            value={formData.batchNumber}
            onChange={(e) => handleChange('batchNumber', e.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid cols={3}>
          <NumberInput
            label="Unit Price"
            placeholder="Enter price"
            value={formData.unitPrice}
            onChange={(value) => handleChange('unitPrice', value)}
            min={0}
            decimalScale={2}
            prefix="₹"
          />
          <NumberInput
            label="Quantity in Stock"
            placeholder="Enter quantity"
            value={formData.quantityInStock}
            onChange={(value) => handleChange('quantityInStock', value)}
            min={0}
          />
          <NumberInput
            label="Minimum Stock Level"
            placeholder="Min stock"
            value={formData.minimumStockLevel}
            onChange={(value) => handleChange('minimumStockLevel', value)}
            min={0}
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <NumberInput
            label="Reorder Level"
            placeholder="Reorder level"
            value={formData.reorderLevel}
            onChange={(value) => handleChange('reorderLevel', value)}
            min={0}
          />
          <DateInput
            label="Expiry Date"
            placeholder="Select expiry date"
            value={formData.expiryDate ? new Date(formData.expiryDate) : null}
            onChange={(value) => handleChange('expiryDate', value ? (value as unknown as Date).toISOString() : '')}
            minDate={new Date()}
          />
        </SimpleGrid>

        <TextInput
          label="Barcode"
          placeholder="Enter barcode"
          value={formData.barcode}
          onChange={(e) => handleChange('barcode', e.target.value)}
        />

        <Switch
          label="Active"
          checked={formData.isActive}
          onChange={(e) => handleChange('isActive', e.currentTarget.checked)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Medication
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default EditMedicationForm;
