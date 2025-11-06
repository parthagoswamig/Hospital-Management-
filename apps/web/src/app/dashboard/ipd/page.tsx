'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Table,
  Modal,
  Text,
  Card,
  ActionIcon,
  SimpleGrid,
  ThemeIcon,
  Stack,
  Loader,
  Pagination,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import ipdService from '../../../services/ipd.service';
import AdmitPatientForm from '../../../components/ipd/AdmitPatientForm';
import EditAdmissionForm from '../../../components/ipd/EditAdmissionForm';
import DischargePatientForm from '../../../components/ipd/DischargePatientForm';
import TransferPatientForm from '../../../components/ipd/TransferPatientForm';
import {
  IconBed,
  IconChartBar,
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconBedOff,
  IconTransferOut,
  IconLogout,
} from '@tabler/icons-react';

// Types
interface Admission {
  id: string;
  patientId: string;
  doctorId: string;
  bedId?: string;
  recordType: string;
  title: string;
  description?: string;
  date: string;
  status?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    medicalRecordNumber?: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  bed?: {
    id: string;
    bedNumber: string;
    ward: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

const IPDManagement = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API state
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [totalAdmissions, setTotalAdmissions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  // Modals
  const [admitOpened, { open: openAdmit, close: closeAdmit }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [dischargeOpened, { open: openDischarge, close: closeDischarge }] = useDisclosure(false);
  const [transferOpened, { open: openTransfer, close: closeTransfer }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);

  const fetchAdmissions = useCallback(async () => {
    try {
      const response = await ipdService.getAdmissions({
        page,
        limit,
        search: searchQuery || undefined,
        status: (selectedStatus as 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED' | undefined) || undefined,
      });
      setAdmissions(response.data.admissions || []);
      setTotalAdmissions(response.data.pagination.total);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching admissions:', err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to load admissions',
        color: 'red',
      });
      setAdmissions([]);
    }
  }, [page, limit, searchQuery, selectedStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await ipdService.getStats();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setStats(null);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchAdmissions(), fetchStats()]);
    } catch (err: any) {
      console.error('Error loading IPD data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAdmissions, fetchStats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handlers
  const handleView = (admission: Admission) => {
    setSelectedAdmission(admission);
    openView();
  };

  const handleEdit = (admission: Admission) => {
    setSelectedAdmission(admission);
    openEdit();
  };

  const handleDischarge = (admission: Admission) => {
    setSelectedAdmission(admission);
    openDischarge();
  };

  const handleTransfer = (admission: Admission) => {
    setSelectedAdmission(admission);
    openTransfer();
  };

  const handleSuccess = () => {
    fetchAllData();
  };

  // Quick stats
  const ipdStats = {
    totalBeds: stats?.beds?.total || 0,
    occupiedBeds: stats?.beds?.occupied || 0,
    availableBeds: stats?.beds?.available || 0,
    maintenanceBeds: stats?.beds?.maintenance || 0,
    reservedBeds: stats?.beds?.reserved || 0,
    occupancyRate: stats?.occupancyRate || 0,
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>IPD Management</Title>
          <Text c="dimmed" size="sm">
            Inpatient department care and bed management
          </Text>
        </div>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={fetchAllData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openAdmit}>
            Admit Patient
          </Button>
        </Group>
      </Group>

      {/* Quick Stats */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md" mb="xl">
        <Card padding="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Beds
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.totalBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconBed size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Occupied
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.occupiedBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="red">
              <IconBedOff size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Available
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.availableBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconCheck size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Maintenance
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.maintenanceBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
              <IconBed size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Reserved
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.reservedBeds}
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <IconBed size={20} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="md" radius="md" withBorder>
          <Group justify="apart">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Occupancy
              </Text>
              <Text size="xl" fw={700}>
                {ipdStats.occupancyRate.toFixed(1)}%
              </Text>
            </div>
            <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
              <IconChartBar size={20} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Admissions List */}
      <Card padding="lg" radius="md" withBorder>
        {/* Filters */}
        <Group mb="md">
          <TextInput
            placeholder="Search patients..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            data={[
              { value: '', label: 'All Status' },
              { value: 'IPD_ADMISSION', label: 'Admitted' },
              { value: 'IPD_DISCHARGE', label: 'Discharged' },
              { value: 'IPD_TRANSFER', label: 'Transferred' },
            ]}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value || '')}
            clearable
          />
        </Group>

        {/* Table */}
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Patient</Table.Th>
              <Table.Th>Diagnosis</Table.Th>
              <Table.Th>Doctor</Table.Th>
              <Table.Th>Bed/Ward</Table.Th>
              <Table.Th>Admission Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {admissions.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <EmptyState
                    icon={<IconUsers size={48} />}
                    title="No admissions found"
                    description={
                      searchQuery || selectedStatus
                        ? 'No admissions match your search criteria.'
                        : 'No patients admitted yet. Click "Admit Patient" to get started.'
                    }
                  />
                </Table.Td>
              </Table.Tr>
            ) : (
              admissions.map((admission) => (
                <Table.Tr key={admission.id}>
                  <Table.Td>
                    <div>
                      <Text size="sm" fw={500}>
                        {admission.patient
                          ? `${admission.patient.firstName} ${admission.patient.lastName}`
                          : 'Unknown Patient'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {admission.patient?.medicalRecordNumber || 'N/A'}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{admission.title || 'N/A'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {admission.doctor
                        ? `Dr. ${admission.doctor.firstName} ${admission.doctor.lastName}`
                        : 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {admission.bed ? (
                      <div>
                        <Text size="sm">{admission.bed.bedNumber}</Text>
                        <Text size="xs" c="dimmed">
                          {admission.bed.ward.name}
                        </Text>
                      </div>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Not assigned
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{new Date(admission.date).toLocaleDateString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={
                        admission.recordType === 'IPD_ADMISSION'
                          ? 'blue'
                          : admission.recordType === 'IPD_DISCHARGE'
                            ? 'green'
                            : 'yellow'
                      }
                      variant="light"
                    >
                      {admission.recordType?.replace('IPD_', '') || 'UNKNOWN'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue" onClick={() => handleView(admission)}>
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="green" onClick={() => handleEdit(admission)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      {admission.recordType === 'IPD_ADMISSION' && (
                        <>
                          <ActionIcon
                            variant="light"
                            color="violet"
                            onClick={() => handleTransfer(admission)}
                          >
                            <IconTransferOut size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleDischarge(admission)}
                          >
                            <IconLogout size={16} />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}
      </Card>

      {/* Modals */}
      <Modal opened={admitOpened} onClose={closeAdmit} title="Admit Patient" size="lg">
        <AdmitPatientForm
          onSuccess={() => {
            closeAdmit();
            handleSuccess();
          }}
          onCancel={closeAdmit}
        />
      </Modal>

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Admission" size="lg">
        {selectedAdmission && (
          <EditAdmissionForm
            admissionId={selectedAdmission.id}
            initialData={selectedAdmission}
            onSuccess={() => {
              closeEdit();
              handleSuccess();
            }}
            onCancel={closeEdit}
          />
        )}
      </Modal>

      <Modal opened={dischargeOpened} onClose={closeDischarge} title="Discharge Patient" size="lg">
        {selectedAdmission && (
          <DischargePatientForm
            admissionId={selectedAdmission.id}
            patientName={
              selectedAdmission.patient
                ? `${selectedAdmission.patient.firstName} ${selectedAdmission.patient.lastName}`
                : 'Unknown'
            }
            onSuccess={() => {
              closeDischarge();
              handleSuccess();
            }}
            onCancel={closeDischarge}
          />
        )}
      </Modal>

      <Modal opened={transferOpened} onClose={closeTransfer} title="Transfer Patient" size="lg">
        {selectedAdmission && (
          <TransferPatientForm
            admissionId={selectedAdmission.id}
            patientName={
              selectedAdmission.patient
                ? `${selectedAdmission.patient.firstName} ${selectedAdmission.patient.lastName}`
                : 'Unknown'
            }
            currentBedId={selectedAdmission.bedId}
            onSuccess={() => {
              closeTransfer();
              handleSuccess();
            }}
            onCancel={closeTransfer}
          />
        )}
      </Modal>

      <Modal opened={viewOpened} onClose={closeView} title="Admission Details" size="lg">
        {selectedAdmission && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={700} c="dimmed">
                Patient
              </Text>
              <Text size="lg">
                {selectedAdmission.patient
                  ? `${selectedAdmission.patient.firstName} ${selectedAdmission.patient.lastName}`
                  : 'Unknown'}
              </Text>
            </div>
            <div>
              <Text size="sm" fw={700} c="dimmed">
                Diagnosis
              </Text>
              <Text>{selectedAdmission.title}</Text>
            </div>
            <div>
              <Text size="sm" fw={700} c="dimmed">
                Description
              </Text>
              <Text>{selectedAdmission.description || 'N/A'}</Text>
            </div>
            <div>
              <Text size="sm" fw={700} c="dimmed">
                Doctor
              </Text>
              <Text>
                {selectedAdmission.doctor
                  ? `Dr. ${selectedAdmission.doctor.firstName} ${selectedAdmission.doctor.lastName}`
                  : 'N/A'}
              </Text>
            </div>
            <div>
              <Text size="sm" fw={700} c="dimmed">
                Bed/Ward
              </Text>
              <Text>
                {selectedAdmission.bed
                  ? `${selectedAdmission.bed.bedNumber} - ${selectedAdmission.bed.ward.name}`
                  : 'Not assigned'}
              </Text>
            </div>
            <Group justify="flex-end">
              <Button onClick={closeView}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default IPDManagement;
