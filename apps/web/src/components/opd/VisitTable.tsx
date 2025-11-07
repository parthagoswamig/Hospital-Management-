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
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { OPDVisit, OPDVisitStatus } from '../../services/opd.service';
import { format } from 'date-fns';

interface VisitTableProps {
  visits: OPDVisit[];
  loading: boolean;
  onView: (visit: OPDVisit) => void;
  onEdit: (visit: OPDVisit) => void;
  onDelete: (visitId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getStatusColor = (status: OPDVisitStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'IN_PROGRESS':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
};

const VisitTable: React.FC<VisitTableProps> = ({
  visits,
  loading,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (visits.length === 0 && !loading) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No OPD visits found
      </Text>
    );
  }

  return (
    <>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Visit Date</Table.Th>
              <Table.Th>Patient</Table.Th>
              <Table.Th>MRN</Table.Th>
              <Table.Th>Doctor</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Complaint</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visits.map((visit) => (
              <Table.Tr key={visit.id}>
                <Table.Td>
                  <Text size="sm">
                    {format(new Date(visit.visitDate), 'dd MMM yyyy, hh:mm a')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {visit.patient
                      ? `${visit.patient.firstName} ${visit.patient.lastName}`
                      : 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {visit.patient?.medicalRecordNumber || 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {visit.doctor
                      ? `Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}`
                      : 'N/A'}
                  </Text>
                  {visit.doctor?.specialization && (
                    <Text size="xs" c="dimmed">
                      {visit.doctor.specialization}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{visit.department?.name || 'N/A'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {visit.complaint || 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(visit.status)} variant="light">
                    {visit.status.replace('_', ' ')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="View Details">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => onView(visit)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit Visit">
                      <ActionIcon
                        variant="subtle"
                        color="orange"
                        onClick={() => onEdit(visit)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Cancel Visit">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => onDelete(visit.id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
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

export default VisitTable;
