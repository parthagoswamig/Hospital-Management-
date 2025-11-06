'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  SimpleGrid,
  Select,
  Button,
  Group,
  Textarea,
  NumberInput,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import pharmacyService, { CreatePharmacyOrderDto } from '../../services/pharmacy.service';

interface DispenseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  patients?: Array<{ value: string; label: string }>;
  doctors?: Array<{ value: string; label: string }>;
  medications?: Array<{ value: string; label: string; stock?: number }>;
}

const DispenseForm: React.FC<DispenseFormProps> = ({
  onSuccess,
  onCancel,
  patients = [],
  doctors = [],
  medications = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [availableMedications, setAvailableMedications] = useState<Array<{ value: string; label: string; stock?: number }>>([]);
  const [formData, setFormData] = useState<CreatePharmacyOrderDto>({
    patientId: '',
    doctorId: '',
    items: [
      {
        medicationId: '',
        quantity: 1,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ],
    notes: '',
  });

  useEffect(() => {
    if (medications.length === 0) {
      fetchMedications();
    } else {
      setAvailableMedications(medications);
    }
  }, [medications]);

  const fetchMedications = async () => {
    try {
      const response = await pharmacyService.getMedications({ isActive: true });
      const medOptions = response.data.items.map((med) => ({
        value: med.id,
        label: `${med.name} (${med.strength || 'N/A'}) - Stock: ${med.quantityInStock || 0}`,
        stock: med.quantityInStock,
      }));
      setAvailableMedications(medOptions);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const handleChange = (field: keyof CreatePharmacyOrderDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          medicationId: '',
          quantity: 1,
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: newItems }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || formData.items.length === 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select a patient and add at least one medication',
        color: 'red',
      });
      return;
    }

    // Validate all items have medication selected
    const invalidItems = formData.items.filter((item) => !item.medicationId || item.quantity <= 0);
    if (invalidItems.length > 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select medication and quantity for all items',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await pharmacyService.createPharmacyOrder(formData);

      notifications.show({
        title: 'Success',
        message: 'Medication dispensed successfully',
        color: 'green',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error dispensing medication:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to dispense medication',
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
            label="Doctor (Optional)"
            placeholder="Select doctor"
            value={formData.doctorId}
            onChange={(value) => handleChange('doctorId', value || '')}
            data={doctors}
            searchable
          />
        </SimpleGrid>

        <Text size="sm" fw={700} mt="md">
          Medications
        </Text>

        {formData.items.map((item, index) => (
          <Stack key={index} gap="sm" p="md" style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Item {index + 1}
              </Text>
              {formData.items.length > 1 && (
                <Button size="xs" variant="light" color="red" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              )}
            </Group>

            <Select
              label="Medication"
              placeholder="Select medication"
              value={item.medicationId}
              onChange={(value) => handleItemChange(index, 'medicationId', value || '')}
              data={availableMedications}
              searchable
              required
            />

            <SimpleGrid cols={3}>
              <NumberInput
                label="Quantity"
                placeholder="Enter quantity"
                value={item.quantity}
                onChange={(value) => handleItemChange(index, 'quantity', value)}
                min={1}
                required
              />
              <TextInput
                label="Dosage"
                placeholder="e.g., 500mg"
                value={item.dosage}
                onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
              />
              <TextInput
                label="Frequency"
                placeholder="e.g., Twice daily"
                value={item.frequency}
                onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
              />
            </SimpleGrid>

            <SimpleGrid cols={2}>
              <TextInput
                label="Duration"
                placeholder="e.g., 7 days"
                value={item.duration}
                onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
              />
              <Textarea
                label="Instructions"
                placeholder="Special instructions"
                value={item.instructions}
                onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                minRows={1}
              />
            </SimpleGrid>
          </Stack>
        ))}

        <Button variant="light" onClick={addItem} fullWidth>
          + Add Another Medication
        </Button>

        <Textarea
          label="Notes (Optional)"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          minRows={2}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Dispense Medications
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default DispenseForm;
