'use client';

import React, { useRef } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Divider,
  Grid,
  Table,
  Paper,
  Title,
} from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { OPDVisit } from '../../services/opd.service';
import { format } from 'date-fns';

interface VisitSummaryModalProps {
  opened: boolean;
  onClose: () => void;
  visit: OPDVisit | null;
}

const VisitSummaryModal: React.FC<VisitSummaryModalProps> = ({ opened, onClose, visit }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>OPD Visit Summary</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #228be6; }
          h2 { color: #495057; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
          th { background-color: #f1f3f5; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!visit) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Visit Summary"
      size="xl"
      padding="lg"
    >
      <div ref={printRef}>
        <Stack gap="md">
          <div className="header">
            <Title order={2}>OPD Visit Summary</Title>
            <Text size="sm" c="dimmed">
              Visit Date: {format(new Date(visit.visitDate), 'dd MMMM yyyy, hh:mm a')}
            </Text>
          </div>

          <Divider />

          <div className="section">
            <Title order={3}>Patient Information</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Name:</span>{' '}
                  {visit.patient
                    ? `${visit.patient.firstName} ${visit.patient.lastName}`
                    : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">MRN:</span>{' '}
                  {visit.patient?.medicalRecordNumber || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Phone:</span> {visit.patient?.phone || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Email:</span> {visit.patient?.email || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Gender:</span> {visit.patient?.gender || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Blood Type:</span>{' '}
                  {visit.patient?.bloodType || 'N/A'}
                </Text>
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          <div className="section">
            <Title order={3}>Doctor Information</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Doctor:</span>{' '}
                  {visit.doctor
                    ? `Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}`
                    : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Specialization:</span>{' '}
                  {visit.doctor?.specialization || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">License Number:</span>{' '}
                  {visit.doctor?.licenseNumber || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Department:</span>{' '}
                  {visit.department?.name || 'N/A'}
                </Text>
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          <div className="section">
            <Title order={3}>Visit Details</Title>
            <Stack gap="sm">
              <Paper p="sm" withBorder>
                <Text size="sm" fw={500}>
                  Chief Complaint:
                </Text>
                <Text size="sm">{visit.complaint || 'N/A'}</Text>
              </Paper>

              <Paper p="sm" withBorder>
                <Text size="sm" fw={500}>
                  Diagnosis:
                </Text>
                <Text size="sm">{visit.diagnosis || 'N/A'}</Text>
              </Paper>

              <Paper p="sm" withBorder>
                <Text size="sm" fw={500}>
                  Treatment Plan:
                </Text>
                <Text size="sm">{visit.treatmentPlan || 'N/A'}</Text>
              </Paper>

              {visit.notes && (
                <Paper p="sm" withBorder>
                  <Text size="sm" fw={500}>
                    Notes:
                  </Text>
                  <Text size="sm">{visit.notes}</Text>
                </Paper>
              )}
            </Stack>
          </div>

          {visit.vitals && visit.vitals.length > 0 && (
            <>
              <Divider />
              <div className="section">
                <Title order={3}>Vital Signs</Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Parameter</Table.Th>
                      <Table.Th>Value</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visit.vitals[0].height && (
                      <Table.Tr>
                        <Table.Td>Height</Table.Td>
                        <Table.Td>{visit.vitals[0].height} cm</Table.Td>
                      </Table.Tr>
                    )}
                    {visit.vitals[0].weight && (
                      <Table.Tr>
                        <Table.Td>Weight</Table.Td>
                        <Table.Td>{visit.vitals[0].weight} kg</Table.Td>
                      </Table.Tr>
                    )}
                    {visit.vitals[0].bp && (
                      <Table.Tr>
                        <Table.Td>Blood Pressure</Table.Td>
                        <Table.Td>{visit.vitals[0].bp}</Table.Td>
                      </Table.Tr>
                    )}
                    {visit.vitals[0].pulse && (
                      <Table.Tr>
                        <Table.Td>Pulse</Table.Td>
                        <Table.Td>{visit.vitals[0].pulse} bpm</Table.Td>
                      </Table.Tr>
                    )}
                    {visit.vitals[0].temperature && (
                      <Table.Tr>
                        <Table.Td>Temperature</Table.Td>
                        <Table.Td>{visit.vitals[0].temperature} °F</Table.Td>
                      </Table.Tr>
                    )}
                    {visit.vitals[0].respirationRate && (
                      <Table.Tr>
                        <Table.Td>Respiration Rate</Table.Td>
                        <Table.Td>{visit.vitals[0].respirationRate} /min</Table.Td>
                      </Table.Tr>
                    )}
                    {visit.vitals[0].spo2 && (
                      <Table.Tr>
                        <Table.Td>SpO2</Table.Td>
                        <Table.Td>{visit.vitals[0].spo2}%</Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </div>
            </>
          )}

          {visit.prescriptions && visit.prescriptions.length > 0 && (
            <>
              <Divider />
              <div className="section">
                <Title order={3}>Prescriptions</Title>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Medication</Table.Th>
                      <Table.Th>Dosage</Table.Th>
                      <Table.Th>Frequency</Table.Th>
                      <Table.Th>Duration</Table.Th>
                      <Table.Th>Instructions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visit.prescriptions.map((prescription) => (
                      <Table.Tr key={prescription.id}>
                        <Table.Td>{prescription.medicationName}</Table.Td>
                        <Table.Td>{prescription.dosage}</Table.Td>
                        <Table.Td>{prescription.frequency}</Table.Td>
                        <Table.Td>{prescription.duration}</Table.Td>
                        <Table.Td>{prescription.notes || '-'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </>
          )}
        </Stack>
      </div>

      <Group justify="space-between" mt="xl">
        <Button variant="subtle" onClick={onClose}>
          Close
        </Button>
        <Button leftSection={<IconPrinter size={18} />} onClick={handlePrint}>
          Print Summary
        </Button>
      </Group>
    </Modal>
  );
};

export default VisitSummaryModal;
