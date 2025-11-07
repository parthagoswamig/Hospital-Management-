'use client';

import React from 'react';
import {
  Table,
  Badge,
  ActionIcon,
  Group,
  Text,
  Tooltip,
  ScrollArea,
  Pagination,
} from '@mantine/core';
import { IconEye, IconEdit, IconNotes, IconFileText } from '@tabler/icons-react';
import { IPDAdmission, IPDAdmissionStatus } from '../../services/ipd.service';
import { format } from 'date-fns';

interface IPDTableProps {
  admissions: IPDAdmission[];
  loading: boolean;
  onView: (admission: IPDAdmission) => void;
  onEdit: (admission: IPDAdmission) => void;
  onAddTreatment: (admission: IPDAdmission) => void;
  onDischarge: (admission: IPDAdmission) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getStatusColor = (status: IPDAdmissionStatus): string => {
  switch (status) {
    case 'ADMITTED':
      return 'blue';
    case 'DISCHARGED':
      return 'green';
    default:
      return 'gray';
  }
};

const IPDTable: React.FC<IPDTableProps> = ({
  admissions,
  loading,
  onView,
  onEdit,
  onAddTreatment,
  onDischarge,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (admissions.length === 0 && !loading) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No admissions found
      </Text>
    );
  }

  return (
    <>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Admission Date</Table.Th>
              <Table.Th>Patient</Table.Th>
              <Table.Th>MRN</Table.Th>
              <Table.Th>Doctor</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Ward/Bed</Table.Th>
              <Table.Th>Diagnosis</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {admissions.map((admission) => (
              <Table.Tr key={admission.id}>
                <Table.Td>
                  <Text size="sm">
                    {format(new Date(admission.admissionDate), 'dd MMM yyyy, hh:mm a')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {admission.patient
                      ? `${admission.patient.firstName} ${admission.patient.lastName}`
                      : 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {admission.patient?.medicalRecordNumber || 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {admission.doctor
                      ? `Dr. ${admission.doctor.firstName} ${admission.doctor.lastName}`
                      : 'N/A'}
                  </Text>
                  {admission.doctor?.specialization && (
                    <Text size="xs" c="dimmed">
                      {admission.doctor.specialization}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{admission.department?.name || 'N/A'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {admission.ward?.name || 'N/A'}
                    {admission.bed && ` / Bed ${admission.bed.bedNumber}`}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {admission.diagnosis || 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(admission.status)} variant="light">
                    {admission.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="View Details">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => onView(admission)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Tooltip>
                    {admission.status === 'ADMITTED' && (
                      <>
                        <Tooltip label="Edit Admission">
                          <ActionIcon
                            variant="subtle"
                            color="orange"
                            onClick={() => onEdit(admission)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Add Treatment">
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            onClick={() => onAddTreatment(admission)}
                          >
                            <IconNotes size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Discharge">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => onDischarge(admission)}
                          >
                            <IconFileText size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
          />
        </Group>
      )}
    </>
  );
};

export default IPDTable;
