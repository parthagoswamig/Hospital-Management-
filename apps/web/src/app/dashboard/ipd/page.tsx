'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Stack,
  Tabs,
  Card,
  SimpleGrid,
  Text,
  LoadingOverlay,
  Modal,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconSearch,
  IconBed,
  IconUsers,
  IconCheck,
  IconCalendar,
  IconActivity,
} from '@tabler/icons-react';
import ipdService, {
  IPDAdmission,
  IPDAdmissionQueryDto,
  IPDAdmissionStatus,
  UpdateIPDAdmissionDto,
} from '../../../services/ipd.service';
import departmentService from '../../../services/department.service';
import AdmissionForm from '../../../components/ipd/AdmissionForm';
import TreatmentForm from '../../../components/ipd/TreatmentForm';
import DischargeForm from '../../../components/ipd/DischargeForm';
import IPDTable from '../../../components/ipd/IPDTable';
import SummaryModal from '../../../components/ipd/SummaryModal';

const IPDManagementPage = () => {
  // State management
  const [admissions, setAdmissions] = useState<IPDAdmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmissions, setTotalAdmissions] = useState(0);
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<IPDAdmission | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [stats, setStats] = useState({
    totalAdmitted: 0,
    totalDischarged: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    bedOccupancyRate: '0',
  });

  // Modals
  const [admitOpened, { open: openAdmit, close: closeAdmit }] = useDisclosure(false);
  const [treatmentOpened, { open: openTreatment, close: closeTreatment }] = useDisclosure(false);
  const [dischargeOpened, { open: openDischarge, close: closeDischarge }] = useDisclosure(false);
  const [summaryOpened, { open: openSummary, close: closeSummary }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Filters
  const [filters, setFilters] = useState<IPDAdmissionQueryDto>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    departmentId: undefined,
    date: undefined,
  });

  // Edit form
  const editForm = useForm<UpdateIPDAdmissionDto>({
    initialValues: {
      diagnosis: '',
      admissionReason: '',
      notes: '',
    },
  });

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
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
      }
    };
    fetchDepartments();
    fetchStats();
  }, []);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await ipdService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Fetch admissions
  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const query: IPDAdmissionQueryDto = {
        ...filters,
        page: currentPage,
      };

      // Apply tab-based status filter
      if (activeTab !== 'all') {
        query.status = activeTab.toUpperCase() as IPDAdmissionStatus;
      }

      const response = await ipdService.getAdmissions(query);
      if (response.success && response.data) {
        setAdmissions(response.data.admissions);
        setTotalPages(response.data.pagination.pages);
        setTotalAdmissions(response.data.pagination.total);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to load admissions',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, activeTab]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string | null) => {
    setFilters({ ...filters, status: value as IPDAdmissionStatus | undefined });
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (value: string | null) => {
    setFilters({ ...filters, departmentId: value || undefined });
    setCurrentPage(1);
  };

  const handleDateFilter = (value: string) => {
    setFilters({
      ...filters,
      date: value || undefined,
    });
    setCurrentPage(1);
  };

  const handleViewAdmission = async (admission: IPDAdmission) => {
    try {
      const response = await ipdService.getAdmissionSummary(admission.id);
      if (response.success && response.data) {
        setSelectedAdmission(response.data);
        openSummary();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to load admission details',
        color: 'red',
      });
    }
  };

  const handleEditAdmission = (admission: IPDAdmission) => {
    setSelectedAdmission(admission);
    editForm.setValues({
      diagnosis: admission.diagnosis || '',
      admissionReason: admission.admissionReason || '',
      notes: admission.notes || '',
    });
    openEdit();
  };

  const handleUpdateAdmission = async (values: UpdateIPDAdmissionDto) => {
    if (!selectedAdmission) return;

    try {
      const response = await ipdService.updateAdmission(selectedAdmission.id, values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Admission updated successfully',
          color: 'green',
        });
        closeEdit();
        fetchAdmissions();
        fetchStats();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update admission',
        color: 'red',
      });
    }
  };

  const handleAddTreatment = (admission: IPDAdmission) => {
    setSelectedAdmission(admission);
    openTreatment();
  };

  const handleDischarge = (admission: IPDAdmission) => {
    setSelectedAdmission(admission);
    openDischarge();
  };

  const handleSuccess = () => {
    fetchAdmissions();
    fetchStats();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>IPD Management</Title>
            <Text c="dimmed" size="sm">
              Manage inpatient admissions, treatments, and discharges
            </Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={openAdmit}>
            Admit Patient
          </Button>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Card withBorder>
            <Group>
              <IconActivity size={32} color="blue" />
              <div>
                <Text size="xs" c="dimmed">
                  Currently Admitted
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalAdmitted}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <IconCheck size={32} color="green" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Discharged
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalDischarged}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <IconBed size={32} color="teal" />
              <div>
                <Text size="xs" c="dimmed">
                  Available Beds
                </Text>
                <Text size="xl" fw={700}>
                  {stats.availableBeds}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <IconUsers size={32} color="orange" />
              <div>
                <Text size="xs" c="dimmed">
                  Bed Occupancy
                </Text>
                <Text size="xl" fw={700}>
                  {stats.bedOccupancyRate}%
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Paper withBorder p="md">
          <Group>
            <TextInput
              placeholder="Search by patient name, MRN, or diagnosis"
              leftSection={<IconSearch size={18} />}
              style={{ flex: 1 }}
              value={filters.search}
              onChange={(e) => handleSearch(e.currentTarget.value)}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'ADMITTED', label: 'Admitted' },
                { value: 'DISCHARGED', label: 'Discharged' },
              ]}
              clearable
              value={filters.status}
              onChange={handleStatusFilter}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filter by department"
              data={departments}
              clearable
              searchable
              value={filters.departmentId}
              onChange={handleDepartmentFilter}
              style={{ width: 200 }}
            />
            <DateInput
              placeholder="Filter by date"
              leftSection={<IconCalendar size={18} />}
              clearable
              value={filters.date}
              onChange={handleDateFilter}
              style={{ width: 200 }}
            />
          </Group>
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List>
            <Tabs.Tab value="all">All Admissions</Tabs.Tab>
            <Tabs.Tab value="admitted">Currently Admitted</Tabs.Tab>
            <Tabs.Tab value="discharged">Discharged</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={activeTab} pt="md">
            <Paper withBorder>
              <LoadingOverlay visible={loading} />
              <IPDTable
                admissions={admissions}
                loading={loading}
                onView={handleViewAdmission}
                onEdit={handleEditAdmission}
                onAddTreatment={handleAddTreatment}
                onDischarge={handleDischarge}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modals */}
      <AdmissionForm
        opened={admitOpened}
        onClose={closeAdmit}
        onSuccess={handleSuccess}
      />

      {selectedAdmission && (
        <>
          <TreatmentForm
            opened={treatmentOpened}
            onClose={closeTreatment}
            admissionId={selectedAdmission.id}
            onSuccess={handleSuccess}
          />

          <DischargeForm
            opened={dischargeOpened}
            onClose={closeDischarge}
            admissionId={selectedAdmission.id}
            onSuccess={handleSuccess}
          />

          <SummaryModal
            opened={summaryOpened}
            onClose={closeSummary}
            admission={selectedAdmission}
          />

          <Modal
            opened={editOpened}
            onClose={closeEdit}
            title="Edit Admission"
            size="lg"
          >
            <form onSubmit={editForm.onSubmit(handleUpdateAdmission)}>
              <Stack gap="md">
                <Textarea
                  label="Admission Reason"
                  placeholder="Enter reason for admission"
                  minRows={2}
                  {...editForm.getInputProps('admissionReason')}
                />

                <Textarea
                  label="Diagnosis"
                  placeholder="Enter diagnosis"
                  minRows={2}
                  {...editForm.getInputProps('diagnosis')}
                />

                <Textarea
                  label="Notes"
                  placeholder="Additional notes"
                  minRows={2}
                  {...editForm.getInputProps('notes')}
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" onClick={closeEdit}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Admission</Button>
                </Group>
              </Stack>
            </form>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default IPDManagementPage;
