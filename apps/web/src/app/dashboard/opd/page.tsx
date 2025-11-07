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
  IconStethoscope,
  IconPrescription,
  IconActivity,
  IconCalendar,
  IconUsers,
  IconCheck,
  IconX,
  IconClock,
} from '@tabler/icons-react';
import opdService, {
  OPDVisit,
  OPDVisitQueryDto,
  OPDVisitStatus,
  UpdateOPDVisitDto,
} from '../../../services/opd.service';
import departmentService from '../../../services/department.service';
import AddVisitForm from '../../../components/opd/AddVisitForm';
import VitalsForm from '../../../components/opd/VitalsForm';
import PrescriptionForm from '../../../components/opd/PrescriptionForm';
import VisitTable from '../../../components/opd/VisitTable';
import VisitSummaryModal from '../../../components/opd/VisitSummaryModal';

const OPDManagementPage = () => {
  // State management
  const [visits, setVisits] = useState<OPDVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisits, setTotalVisits] = useState(0);
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<OPDVisit | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Modals
  const [addVisitOpened, { open: openAddVisit, close: closeAddVisit }] = useDisclosure(false);
  const [vitalsOpened, { open: openVitals, close: closeVitals }] = useDisclosure(false);
  const [prescriptionOpened, { open: openPrescription, close: closePrescription }] = useDisclosure(false);
  const [summaryOpened, { open: openSummary, close: closeSummary }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  // Filters
  const [filters, setFilters] = useState<OPDVisitQueryDto>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    departmentId: undefined,
    date: undefined,
  });

  // Edit form
  const editForm = useForm<UpdateOPDVisitDto>({
    initialValues: {
      complaint: '',
      diagnosis: '',
      treatmentPlan: '',
      notes: '',
      status: 'PENDING' as OPDVisitStatus,
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
  }, []);

  // Fetch visits
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const query: OPDVisitQueryDto = {
        ...filters,
        page: currentPage,
      };

      // Apply tab-based status filter
      if (activeTab !== 'all') {
        query.status = activeTab.toUpperCase() as OPDVisitStatus;
      }

      const response = await opdService.getVisits(query);
      if (response.success && response.data) {
        setVisits(response.data.visits);
        setTotalPages(response.data.pagination.pages);
        setTotalVisits(response.data.pagination.total);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to load OPD visits',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, activeTab]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Stats calculation
  const stats = {
    total: totalVisits,
    pending: visits.filter((v) => v.status === 'PENDING').length,
    inProgress: visits.filter((v) => v.status === 'IN_PROGRESS').length,
    completed: visits.filter((v) => v.status === 'COMPLETED').length,
  };

  // Handlers
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string | null) => {
    setFilters({ ...filters, status: value as OPDVisitStatus | undefined });
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

  const handleViewVisit = async (visit: OPDVisit) => {
    try {
      const response = await opdService.getVisitSummary(visit.id);
      if (response.success && response.data) {
        setSelectedVisit(response.data);
        openSummary();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to load visit details',
        color: 'red',
      });
    }
  };

  const handleEditVisit = (visit: OPDVisit) => {
    setSelectedVisit(visit);
    editForm.setValues({
      complaint: visit.complaint || '',
      diagnosis: visit.diagnosis || '',
      treatmentPlan: visit.treatmentPlan || '',
      notes: visit.notes || '',
      status: visit.status,
    });
    openEdit();
  };

  const handleUpdateVisit = async (values: UpdateOPDVisitDto) => {
    if (!selectedVisit) return;

    try {
      const response = await opdService.updateVisit(selectedVisit.id, values);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Visit updated successfully',
          color: 'green',
        });
        closeEdit();
        fetchVisits();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to update visit',
        color: 'red',
      });
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm('Are you sure you want to cancel this visit?')) return;

    try {
      const response = await opdService.deleteVisit(visitId);
      if (response.success) {
        notifications.show({
          title: 'Success',
          message: 'Visit cancelled successfully',
          color: 'green',
        });
        fetchVisits();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to cancel visit',
        color: 'red',
      });
    }
  };

  const handleAddVitals = (visit: OPDVisit) => {
    setSelectedVisit(visit);
    openVitals();
  };

  const handleAddPrescription = (visit: OPDVisit) => {
    setSelectedVisit(visit);
    openPrescription();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>OPD Management</Title>
            <Text c="dimmed" size="sm">
              Manage outpatient department visits, vitals, and prescriptions
            </Text>
          </div>
          <Button leftSection={<IconPlus size={18} />} onClick={openAddVisit}>
            Add Visit
          </Button>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Card withBorder>
            <Group>
              <IconUsers size={32} color="blue" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Visits
                </Text>
                <Text size="xl" fw={700}>
                  {stats.total}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <IconClock size={32} color="yellow" />
              <div>
                <Text size="xs" c="dimmed">
                  Pending
                </Text>
                <Text size="xl" fw={700}>
                  {stats.pending}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <IconActivity size={32} color="blue" />
              <div>
                <Text size="xs" c="dimmed">
                  In Progress
                </Text>
                <Text size="xl" fw={700}>
                  {stats.inProgress}
                </Text>
              </div>
            </Group>
          </Card>

          <Card withBorder>
            <Group>
              <IconCheck size={32} color="green" />
              <div>
                <Text size="xs" c="dimmed">
                  Completed
                </Text>
                <Text size="xl" fw={700}>
                  {stats.completed}
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Paper withBorder p="md">
          <Group>
            <TextInput
              placeholder="Search by patient name, MRN, or complaint"
              leftSection={<IconSearch size={18} />}
              style={{ flex: 1 }}
              value={filters.search}
              onChange={(e) => handleSearch(e.currentTarget.value)}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
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
            <Tabs.Tab value="all">All Visits</Tabs.Tab>
            <Tabs.Tab value="pending">Pending</Tabs.Tab>
            <Tabs.Tab value="in_progress">In Progress</Tabs.Tab>
            <Tabs.Tab value="completed">Completed</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={activeTab} pt="md">
            <Paper withBorder>
              <LoadingOverlay visible={loading} />
              <VisitTable
                visits={visits}
                loading={loading}
                onView={handleViewVisit}
                onEdit={handleEditVisit}
                onDelete={handleDeleteVisit}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modals */}
      <AddVisitForm
        opened={addVisitOpened}
        onClose={closeAddVisit}
        onSuccess={fetchVisits}
      />

      {selectedVisit && (
        <>
          <VitalsForm
            opened={vitalsOpened}
            onClose={closeVitals}
            visitId={selectedVisit.id}
            onSuccess={fetchVisits}
          />

          <PrescriptionForm
            opened={prescriptionOpened}
            onClose={closePrescription}
            visitId={selectedVisit.id}
            onSuccess={fetchVisits}
          />

          <VisitSummaryModal
            opened={summaryOpened}
            onClose={closeSummary}
            visit={selectedVisit}
          />

          <Modal
            opened={editOpened}
            onClose={closeEdit}
            title="Edit Visit"
            size="lg"
          >
            <form onSubmit={editForm.onSubmit(handleUpdateVisit)}>
              <Stack gap="md">
                <Textarea
                  label="Chief Complaint"
                  placeholder="Enter patient's chief complaint"
                  minRows={2}
                  {...editForm.getInputProps('complaint')}
                />

                <Textarea
                  label="Diagnosis"
                  placeholder="Enter diagnosis"
                  minRows={2}
                  {...editForm.getInputProps('diagnosis')}
                />

                <Textarea
                  label="Treatment Plan"
                  placeholder="Enter treatment plan"
                  minRows={2}
                  {...editForm.getInputProps('treatmentPlan')}
                />

                <Textarea
                  label="Notes"
                  placeholder="Additional notes"
                  minRows={2}
                  {...editForm.getInputProps('notes')}
                />

                <Select
                  label="Status"
                  data={[
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                  {...editForm.getInputProps('status')}
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" onClick={closeEdit}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Visit</Button>
                </Group>
              </Stack>
            </form>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default OPDManagementPage;
