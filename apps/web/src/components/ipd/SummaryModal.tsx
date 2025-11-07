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
  Timeline,
} from '@mantine/core';
import { IconPrinter, IconPill, IconStethoscope } from '@tabler/icons-react';
import { IPDAdmission } from '../../services/ipd.service';
import { format } from 'date-fns';

interface SummaryModalProps {
  opened: boolean;
  onClose: () => void;
  admission: IPDAdmission | null;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ opened, onClose, admission }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>IPD Admission Summary</title>');
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

  if (!admission) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Admission Summary"
      size="xl"
      padding="lg"
    >
      <div ref={printRef}>
        <Stack gap="md">
          <div className="header">
            <Title order={2}>IPD Admission Summary</Title>
            <Text size="sm" c="dimmed">
              Admission Date: {format(new Date(admission.admissionDate), 'dd MMMM yyyy, hh:mm a')}
            </Text>
            {admission.dischargeDate && (
              <Text size="sm" c="dimmed">
                Discharge Date: {format(new Date(admission.dischargeDate), 'dd MMMM yyyy, hh:mm a')}
              </Text>
            )}
          </div>

          <Divider />

          <div className="section">
            <Title order={3}>Patient Information</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Name:</span>{' '}
                  {admission.patient
                    ? `${admission.patient.firstName} ${admission.patient.lastName}`
                    : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">MRN:</span>{' '}
                  {admission.patient?.medicalRecordNumber || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Phone:</span> {admission.patient?.phone || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Email:</span> {admission.patient?.email || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Gender:</span> {admission.patient?.gender || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Blood Type:</span>{' '}
                  {admission.patient?.bloodType || 'N/A'}
                </Text>
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          <div className="section">
            <Title order={3}>Admission Details</Title>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Doctor:</span>{' '}
                  {admission.doctor
                    ? `Dr. ${admission.doctor.firstName} ${admission.doctor.lastName}`
                    : 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Specialization:</span>{' '}
                  {admission.doctor?.specialization || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Department:</span>{' '}
                  {admission.department?.name || 'N/A'}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Ward:</span> {admission.ward?.name || 'N/A'}
                </Text>
              </Grid.Col>
              {admission.bed && (
                <Grid.Col span={6}>
                  <Text size="sm">
                    <span className="label">Bed:</span> {admission.bed.bedNumber}
                  </Text>
                </Grid.Col>
              )}
              <Grid.Col span={6}>
                <Text size="sm">
                  <span className="label">Status:</span> {admission.status}
                </Text>
              </Grid.Col>
            </Grid>

            <Stack gap="sm" mt="md">
              <Paper p="sm" withBorder>
                <Text size="sm" fw={500}>
                  Admission Reason:
                </Text>
                <Text size="sm">{admission.admissionReason || 'N/A'}</Text>
              </Paper>

              <Paper p="sm" withBorder>
                <Text size="sm" fw={500}>
                  Initial Diagnosis:
                </Text>
                <Text size="sm">{admission.diagnosis || 'N/A'}</Text>
              </Paper>

              {admission.notes && (
                <Paper p="sm" withBorder>
                  <Text size="sm" fw={500}>
                    Notes:
                  </Text>
                  <Text size="sm">{admission.notes}</Text>
                </Paper>
              )}
            </Stack>
          </div>

          {admission.treatments && admission.treatments.length > 0 && (
            <>
              <Divider />
              <div className="section">
                <Title order={3}>Treatment History</Title>
                <Timeline active={admission.treatments.length} bulletSize={24} lineWidth={2}>
                  {admission.treatments.map((treatment) => (
                    <Timeline.Item
                      key={treatment.id}
                      bullet={<IconStethoscope size={12} />}
                      title={format(new Date(treatment.treatmentDate), 'dd MMM yyyy, hh:mm a')}
                    >
                      <Text size="sm" mt={4}>
                        <strong>Doctor:</strong>{' '}
                        {treatment.doctor
                          ? `Dr. ${treatment.doctor.firstName} ${treatment.doctor.lastName}`
                          : 'N/A'}
                      </Text>
                      {treatment.notes && (
                        <Text size="sm" mt={4}>
                          <strong>Notes:</strong> {treatment.notes}
                        </Text>
                      )}
                      {treatment.treatmentPlan && (
                        <Text size="sm" mt={4}>
                          <strong>Plan:</strong> {treatment.treatmentPlan}
                        </Text>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </>
          )}

          {admission.dischargeSummary && (
            <>
              <Divider />
              <div className="section">
                <Title order={3}>Discharge Summary</Title>
                <Stack gap="sm">
                  <Paper p="sm" withBorder>
                    <Text size="sm" fw={500}>
                      Final Diagnosis:
                    </Text>
                    <Text size="sm">{admission.dischargeSummary.finalDiagnosis || 'N/A'}</Text>
                  </Paper>

                  <Paper p="sm" withBorder>
                    <Text size="sm" fw={500}>
                      Treatment Given:
                    </Text>
                    <Text size="sm">{admission.dischargeSummary.treatmentGiven || 'N/A'}</Text>
                  </Paper>

                  <Paper p="sm" withBorder>
                    <Text size="sm" fw={500}>
                      Condition at Discharge:
                    </Text>
                    <Text size="sm">
                      {admission.dischargeSummary.conditionAtDischarge || 'N/A'}
                    </Text>
                  </Paper>

                  <Paper p="sm" withBorder>
                    <Text size="sm" fw={500}>
                      Follow-up Advice:
                    </Text>
                    <Text size="sm">{admission.dischargeSummary.followUpAdvice || 'N/A'}</Text>
                  </Paper>
                </Stack>
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

export default SummaryModal;
