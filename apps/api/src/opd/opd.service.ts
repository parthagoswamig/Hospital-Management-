import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateOPDVisitDto,
  UpdateOPDVisitDto,
  CreateOPDVitalsDto,
  CreateOPDPrescriptionDto,
  OPDVisitQueryDto,
  OPDVisitStatus,
} from './dto';

@Injectable()
export class OpdService {
  private readonly logger = new Logger(OpdService.name);

  constructor(private prisma: CustomPrismaService) {}

  // ==================== OPD Visit Methods ====================

  /**
   * Create a new OPD visit
   */
  async createVisit(createDto: CreateOPDVisitDto, tenantId: string, userId: string) {
    try {
      this.logger.log(`Creating OPD visit for patient: ${createDto.patientId}`);

      // Verify patient exists
      const patient = await this.prisma.patient.findFirst({
        where: { id: createDto.patientId, tenantId, isActive: true },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Auto-assign doctor if not provided (use logged-in user if they're a doctor)
      let doctorId = createDto.doctorId;
      if (!doctorId) {
        const user = await this.prisma.user.findFirst({
          where: { id: userId, tenantId },
        });
        if (user && user.role === 'DOCTOR') {
          doctorId = userId;
        } else {
          throw new BadRequestException('Doctor ID is required');
        }
      }

      // Verify doctor exists
      const doctor = await this.prisma.user.findFirst({
        where: { id: doctorId, tenantId, role: 'DOCTOR' },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      // Verify department if provided
      if (createDto.departmentId) {
        const department = await this.prisma.department.findFirst({
          where: { id: createDto.departmentId, tenantId },
        });
        if (!department) {
          throw new NotFoundException('Department not found');
        }
      }

      // Create OPD visit
      const visit = await this.prisma.oPDVisit.create({
        data: {
          patientId: createDto.patientId,
          doctorId,
          departmentId: createDto.departmentId,
          visitDate: createDto.visitDate ? new Date(createDto.visitDate) : new Date(),
          complaint: createDto.complaint,
          diagnosis: createDto.diagnosis,
          treatmentPlan: createDto.treatmentPlan,
          notes: createDto.notes,
          status: createDto.status || OPDVisitStatus.PENDING,
          tenantId,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
              phone: true,
              email: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
              licenseNumber: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      this.logger.log(`Successfully created OPD visit with ID: ${visit.id}`);
      return {
        success: true,
        message: 'OPD visit created successfully',
        data: visit,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating OPD visit:', error.message, error.stack);
      throw new BadRequestException(error.message || 'Failed to create OPD visit');
    }
  }

  /**
   * Get all OPD visits with filters and pagination
   */
  async findAllVisits(tenantId: string, query: OPDVisitQueryDto = {}) {
    try {
      this.logger.log(`Finding OPD visits for tenant: ${tenantId}`);

      const { page = 1, limit = 10, status, doctorId, departmentId, date, patientId, search } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.OPDVisitWhereInput = {
        tenantId,
      };

      if (status) {
        where.status = status;
      }

      if (doctorId) {
        where.doctorId = doctorId;
      }

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (patientId) {
        where.patientId = patientId;
      }

      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        where.visitDate = {
          gte: startDate,
          lte: endDate,
        };
      }

      if (search) {
        where.OR = [
          { complaint: { contains: search, mode: 'insensitive' } },
          { diagnosis: { contains: search, mode: 'insensitive' } },
          { patient: { firstName: { contains: search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: search, mode: 'insensitive' } } },
          { patient: { medicalRecordNumber: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [visits, total] = await Promise.all([
        this.prisma.oPDVisit.findMany({
          where,
          skip,
          take: limit,
          orderBy: { visitDate: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                medicalRecordNumber: true,
                phone: true,
                email: true,
                dateOfBirth: true,
                gender: true,
              },
            },
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialization: true,
                licenseNumber: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            vitals: true,
            prescriptions: true,
          },
        }),
        this.prisma.oPDVisit.count({ where }),
      ]);

      this.logger.log(`Found ${visits.length} OPD visits out of ${total} total`);
      return {
        success: true,
        data: {
          visits,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding OPD visits:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch OPD visits');
    }
  }

  /**
   * Get OPD visit by ID
   */
  async findOneVisit(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding OPD visit with ID: ${id}`);

      const visit = await this.prisma.oPDVisit.findFirst({
        where: { id, tenantId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
              phone: true,
              email: true,
              dateOfBirth: true,
              gender: true,
              bloodType: true,
              allergies: true,
              chronicConditions: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
              licenseNumber: true,
              signature: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          vitals: {
            orderBy: { createdAt: 'desc' },
          },
          prescriptions: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!visit) {
        throw new NotFoundException('OPD visit not found');
      }

      this.logger.log(`Successfully found OPD visit: ${visit.id}`);
      return {
        success: true,
        data: visit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding OPD visit:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch OPD visit');
    }
  }

  /**
   * Update OPD visit
   */
  async updateVisit(id: string, updateDto: UpdateOPDVisitDto, tenantId: string) {
    try {
      this.logger.log(`Updating OPD visit with ID: ${id}`);

      // Check if visit exists
      const existingVisit = await this.prisma.oPDVisit.findFirst({
        where: { id, tenantId },
      });

      if (!existingVisit) {
        throw new NotFoundException('OPD visit not found');
      }

      // Verify doctor if provided
      if (updateDto.doctorId) {
        const doctor = await this.prisma.user.findFirst({
          where: { id: updateDto.doctorId, tenantId, role: 'DOCTOR' },
        });
        if (!doctor) {
          throw new NotFoundException('Doctor not found');
        }
      }

      // Verify department if provided
      if (updateDto.departmentId) {
        const department = await this.prisma.department.findFirst({
          where: { id: updateDto.departmentId, tenantId },
        });
        if (!department) {
          throw new NotFoundException('Department not found');
        }
      }

      const updateData: Prisma.OPDVisitUpdateInput = {};

      if (updateDto.doctorId) {
        updateData.doctor = { connect: { id: updateDto.doctorId } };
      }
      if (updateDto.departmentId) {
        updateData.department = { connect: { id: updateDto.departmentId } };
      }
      if (updateDto.visitDate) updateData.visitDate = new Date(updateDto.visitDate);
      if (updateDto.complaint !== undefined) updateData.complaint = updateDto.complaint;
      if (updateDto.diagnosis !== undefined) updateData.diagnosis = updateDto.diagnosis;
      if (updateDto.treatmentPlan !== undefined) updateData.treatmentPlan = updateDto.treatmentPlan;
      if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;
      if (updateDto.status) updateData.status = updateDto.status;

      const visit = await this.prisma.oPDVisit.update({
        where: { id },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
              phone: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Successfully updated OPD visit: ${visit.id}`);
      return {
        success: true,
        message: 'OPD visit updated successfully',
        data: visit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating OPD visit:', error.message, error.stack);
      throw new BadRequestException('Failed to update OPD visit');
    }
  }

  /**
   * Delete OPD visit (soft delete by setting status to CANCELLED)
   */
  async removeVisit(id: string, tenantId: string) {
    try {
      this.logger.log(`Deleting OPD visit with ID: ${id}`);

      const visit = await this.prisma.oPDVisit.findFirst({
        where: { id, tenantId },
      });

      if (!visit) {
        throw new NotFoundException('OPD visit not found');
      }

      await this.prisma.oPDVisit.update({
        where: { id },
        data: { status: OPDVisitStatus.CANCELLED },
      });

      this.logger.log(`Successfully deleted OPD visit: ${id}`);
      return {
        success: true,
        message: 'OPD visit cancelled successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting OPD visit:', error.message, error.stack);
      throw new BadRequestException('Failed to delete OPD visit');
    }
  }

  // ==================== OPD Vitals Methods ====================

  /**
   * Add vitals to an OPD visit
   */
  async addVitals(createDto: CreateOPDVitalsDto, tenantId: string) {
    try {
      this.logger.log(`Adding vitals for visit: ${createDto.visitId}`);

      // Verify visit exists
      const visit = await this.prisma.oPDVisit.findFirst({
        where: { id: createDto.visitId, tenantId },
      });

      if (!visit) {
        throw new NotFoundException('OPD visit not found');
      }

      const vitals = await this.prisma.oPDVitals.create({
        data: {
          visitId: createDto.visitId,
          height: createDto.height,
          weight: createDto.weight,
          bp: createDto.bp,
          pulse: createDto.pulse,
          temperature: createDto.temperature,
          respirationRate: createDto.respirationRate,
          spo2: createDto.spo2,
          notes: createDto.notes,
          recordedBy: createDto.recordedBy,
          tenantId,
        },
      });

      this.logger.log(`Successfully added vitals with ID: ${vitals.id}`);
      return {
        success: true,
        message: 'Vitals added successfully',
        data: vitals,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding vitals:', error.message, error.stack);
      throw new BadRequestException('Failed to add vitals');
    }
  }

  // ==================== OPD Prescription Methods ====================

  /**
   * Add prescription to an OPD visit
   */
  async addPrescription(createDto: CreateOPDPrescriptionDto, tenantId: string) {
    try {
      this.logger.log(`Adding prescription for visit: ${createDto.visitId}`);

      // Verify visit exists
      const visit = await this.prisma.oPDVisit.findFirst({
        where: { id: createDto.visitId, tenantId },
      });

      if (!visit) {
        throw new NotFoundException('OPD visit not found');
      }

      const prescription = await this.prisma.oPDPrescription.create({
        data: {
          visitId: createDto.visitId,
          medicationName: createDto.medicationName,
          dosage: createDto.dosage,
          frequency: createDto.frequency,
          duration: createDto.duration,
          notes: createDto.notes,
          tenantId,
        },
      });

      this.logger.log(`Successfully added prescription with ID: ${prescription.id}`);
      return {
        success: true,
        message: 'Prescription added successfully',
        data: prescription,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding prescription:', error.message, error.stack);
      throw new BadRequestException('Failed to add prescription');
    }
  }

  // ==================== Summary Methods ====================

  /**
   * Get complete visit summary with all details
   */
  async getVisitSummary(visitId: string, tenantId: string) {
    try {
      this.logger.log(`Getting visit summary for: ${visitId}`);

      const visit = await this.prisma.oPDVisit.findFirst({
        where: { id: visitId, tenantId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
              phone: true,
              email: true,
              dateOfBirth: true,
              gender: true,
              bloodType: true,
              allergies: true,
              chronicConditions: true,
              address: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
              licenseNumber: true,
              signature: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          vitals: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          prescriptions: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!visit) {
        throw new NotFoundException('OPD visit not found');
      }

      this.logger.log(`Successfully retrieved visit summary for: ${visitId}`);
      return {
        success: true,
        data: visit,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting visit summary:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch visit summary');
    }
  }
}
