'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Table,
  Modal,
  Text,
  Tabs,
  Card,
  Avatar,
  ActionIcon,
  Stack,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconStethoscope,
  IconMedicalCross,
} from '@tabler/icons-react';

// Import API service
import staffService from '../../../services/staff.service';

// Import Forms
import AddStaffForm from '../../../components/staff/AddStaffForm';
import EditStaffForm from '../../../components/staff/EditStaffForm';

const StaffManagement = () => {
  // State management
  const [activeStaffTab, setActiveStaffTab] = useState<'active' | 'inactive'>('active');
  const [staff, setStaff] = useState<any[]>([]);
  const [staffStats, setStaffStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Modal states
  const [addStaffOpened, { open: openAddStaff, close: closeAddStaff }] = useDisclosure(false);
  const [editStaffOpened, { open: openEditStaff, close: closeEditStaff }] = useDisclosure(false);

  // Fetch staff data
  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, [activeStaffTab]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff({
        status: activeStaffTab,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
      });
      setStaff(response.data?.staff || []);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to load staff list',
        color: 'red',
      });
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await staffService.getStaffStats();
      setStaffStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setStaffStats({
        totalStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        byRole: {},
      });
    }
  };

  const handleEditStaff = (staffMember: any) => {
    setSelectedStaff(staffMember);
    openEditStaff();
  };

  const handleDeleteStaff = async (staffMember: any) => {
    const firstName = staffMember.user?.firstName || staffMember.firstName || '';
    const lastName = staffMember.user?.lastName || staffMember.lastName || '';
    
    if (!confirm(`Are you sure you want to ${staffMember.isActive ? 'deactivate' : 'activate'} ${firstName} ${lastName}?`)) {
      return;
    }

    try {
      await staffService.deleteStaff(staffMember.id);
      notifications.show({
        title: 'Success',
        message: `Staff member ${staffMember.isActive ? 'deactivated' : 'activated'} successfully`,
        color: 'green',
      });
      fetchStaff();
      fetchStats();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update staff member',
        color: 'red',
      });
    }
  };

  const handleSearch = () => {
    fetchStaff();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('');
    fetchStaff();
  };

  // Filter staff based on search and role
  const filteredStaff = staff.filter((s) => {
    const firstName = s.user?.firstName || s.firstName || '';
    const lastName = s.user?.lastName || s.lastName || '';
    const email = s.user?.email || s.email || '';
    const employeeId = s.employeeId || '';

    const matchesSearch =
      !searchQuery ||
      firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !selectedRole || s.user?.role === selectedRole || s.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'blue';
      case 'NURSE':
        return 'green';
      case 'LAB_TECHNICIAN':
        return 'purple';
      case 'RADIOLOGIST':
        return 'indigo';
      case 'PHARMACIST':
        return 'cyan';
      case 'RECEPTIONIST':
        return 'orange';
      case 'ACCOUNTANT':
        return 'teal';
      case 'ADMIN':
        return 'red';
      case 'TECHNICIAN':
        return 'violet';
      case 'HR_MANAGER':
        return 'pink';
      default:
        return 'gray';
    }
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Staff',
      value: staffStats?.totalStaff || 0,
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: 'Active Staff',
      value: staffStats?.activeStaff || 0,
      icon: IconUserCheck,
      color: 'green',
    },
    {
      title: 'Deactivated',
      value: staffStats?.inactiveStaff || 0,
      icon: IconUserX,
      color: 'red',
    },
    {
      title: 'Doctors',
      value: staffStats?.byRole?.doctors || 0,
      icon: IconStethoscope,
      color: 'cyan',
    },
  ];

  return (
    <Container size="xl" py="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Staff Management</Title>
          <Text c="dimmed" size="sm">
            Manage hospital staff members
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddStaff}>
          Add Staff
        </Button>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <ThemeIcon color={stat.color} size="xl" radius="md" variant="light">
                  <Icon size={24} />
                </ThemeIcon>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Main Content with Tabs */}
      <Paper p="md" radius="md" withBorder>
        <Tabs value={activeStaffTab} onChange={(value) => setActiveStaffTab(value as 'active' | 'inactive')}>
          <Tabs.List mb="md">
            <Tabs.Tab value="active" leftSection={<IconUserCheck size={16} />}>
              Active Staff ({staffStats?.activeStaff || 0})
            </Tabs.Tab>
            <Tabs.Tab value="inactive" leftSection={<IconUserX size={16} />}>
              Deactivated ({staffStats?.inactiveStaff || 0})
            </Tabs.Tab>
          </Tabs.List>

          {/* Search and Filters */}
          <Group mb="md">
            <TextInput
              placeholder="Search by name, email, or ID..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by Role"
              data={[
                { value: 'DOCTOR', label: 'Doctor' },
                { value: 'NURSE', label: 'Nurse' },
                { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
                { value: 'RADIOLOGIST', label: 'Radiologist' },
                { value: 'PHARMACIST', label: 'Pharmacist' },
                { value: 'RECEPTIONIST', label: 'Receptionist' },
                { value: 'ACCOUNTANT', label: 'Accountant' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'TECHNICIAN', label: 'Technician' },
                { value: 'HR_MANAGER', label: 'HR Manager' },
              ]}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value || '')}
              clearable
              searchable
              style={{ minWidth: 200 }}
            />
            <Button variant="light" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="subtle" onClick={clearFilters}>
              Clear
            </Button>
          </Group>

          {/* Active Staff Tab */}
          <Tabs.Panel value="active">
            {loading ? (
              <Stack align="center" py="xl">
                <Loader size="lg" />
                <Text c="dimmed">Loading staff...</Text>
              </Stack>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Staff Member</Table.Th>
                      <Table.Th>Employee ID</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Department</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredStaff.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Stack align="center" py="xl">
                            <IconUsers size={48} stroke={1.5} color="gray" />
                            <Text c="dimmed">No active staff members found</Text>
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredStaff.map((staffMember) => {
                        const firstName = staffMember.user?.firstName || staffMember.firstName || '';
                        const lastName = staffMember.user?.lastName || staffMember.lastName || '';
                        const email = staffMember.user?.email || staffMember.email || '';
                        const role = staffMember.user?.role || staffMember.role || 'N/A';
                        const departmentName = staffMember.department?.name || 'N/A';

                        return (
                          <Table.Tr key={staffMember.id}>
                            <Table.Td>
                              <Group>
                                <Avatar color="blue" radius="xl">
                                  {firstName[0] || '?'}
                                  {lastName[0] || '?'}
                                </Avatar>
                                <div>
                                  <Text fw={500}>
                                    {firstName} {lastName}
                                  </Text>
                                  <Text size="sm" c="dimmed">
                                    {staffMember.designation || 'No designation'}
                                  </Text>
                                </div>
                              </Group>
                            </Table.Td>
                            <Table.Td>{staffMember.employeeId || 'N/A'}</Table.Td>
                            <Table.Td>
                              <Badge color={getRoleBadgeColor(role)} variant="light">
                                {role.replace('_', ' ')}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{departmentName}</Table.Td>
                            <Table.Td>{email}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="green"
                                  onClick={() => handleEditStaff(staffMember)}
                                  title="Edit"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDeleteStaff(staffMember)}
                                  title="Deactivate"
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Tabs.Panel>

          {/* Deactivated Staff Tab */}
          <Tabs.Panel value="inactive">
            {loading ? (
              <Stack align="center" py="xl">
                <Loader size="lg" />
                <Text c="dimmed">Loading deactivated staff...</Text>
              </Stack>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Staff Member</Table.Th>
                      <Table.Th>Employee ID</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Department</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredStaff.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={6}>
                          <Stack align="center" py="xl">
                            <IconUserX size={48} stroke={1.5} color="gray" />
                            <Text c="dimmed">No deactivated staff members</Text>
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      filteredStaff.map((staffMember) => {
                        const firstName = staffMember.user?.firstName || staffMember.firstName || '';
                        const lastName = staffMember.user?.lastName || staffMember.lastName || '';
                        const email = staffMember.user?.email || staffMember.email || '';
                        const role = staffMember.user?.role || staffMember.role || 'N/A';
                        const departmentName = staffMember.department?.name || 'N/A';

                        return (
                          <Table.Tr key={staffMember.id}>
                            <Table.Td>
                              <Group>
                                <Avatar color="gray" radius="xl">
                                  {firstName[0] || '?'}
                                  {lastName[0] || '?'}
                                </Avatar>
                                <div>
                                  <Text fw={500} c="dimmed">
                                    {firstName} {lastName}
                                  </Text>
                                  <Text size="sm" c="dimmed">
                                    {staffMember.designation || 'No designation'}
                                  </Text>
                                </div>
                              </Group>
                            </Table.Td>
                            <Table.Td>{staffMember.employeeId || 'N/A'}</Table.Td>
                            <Table.Td>
                              <Badge color="gray" variant="light">
                                {role.replace('_', ' ')}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{departmentName}</Table.Td>
                            <Table.Td c="dimmed">{email}</Table.Td>
                            <Table.Td>
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => handleEditStaff(staffMember)}
                                title="View/Edit"
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Add Staff Modal */}
      <Modal opened={addStaffOpened} onClose={closeAddStaff} title="Add New Staff Member" size="lg">
        <AddStaffForm
          onSuccess={() => {
            closeAddStaff();
            fetchStaff();
            fetchStats();
          }}
          onCancel={closeAddStaff}
        />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal opened={editStaffOpened} onClose={closeEditStaff} title="Edit Staff Member" size="lg">
        {selectedStaff && (
          <EditStaffForm
            staffId={selectedStaff.id}
            initialData={selectedStaff}
            onSuccess={() => {
              closeEditStaff();
              fetchStaff();
              fetchStats();
            }}
            onCancel={closeEditStaff}
          />
        )}
      </Modal>
    </Container>
  );
};

export default StaffManagement;
