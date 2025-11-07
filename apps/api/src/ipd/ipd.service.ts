import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateIPDAdmissionDto,
  UpdateIPDAdmissionDto,
  IPDAdmissionQueryDto,
  CreateIPDTreatmentDto,
  UpdateIPDTreatmentDto,
  CreateIPDDischargeSummaryDto,
  UpdateIPDDischargeSummaryDto,
  IPDAdmissionStatus,
} from './dto/ipd.dto';

@Injectable()
export class IpdService {
  constructor(private readonly prisma: CustomPrismaService) {}

  // ============= ADMISSION METHODS =============

  async createAdmission(dto: CreateIPDAdmissionDto, tenantId: string, userId: string) {
    try {
      // Verify patient exists
      const patient = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Verify doctor if provided, otherwise use current user
      const doctorId = dto.doctorId || userId;
      const doctor = await this.prisma.user.findFirst({
        where: { id: doctorId, tenantId },
      });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      // Verify department if provided
      if (dto.departmentId) {
        const department = await this.prisma.department.findFirst({
          where: { id: dto.departmentId, tenantId },
        });
        if (!department) {
          throw new NotFoundException('Department not found');
        }
      }

      // Verify ward if provided
      if (dto.wardId) {
        const ward = await this.prisma.ward.findFirst({
          where: { id: dto.wardId, tenantId },
        });
        if (!ward) {
          throw new NotFoundException('Ward not found');
        }
      }

      // Verify bed if provided and check availability
      if (dto.bedId) {
        const bed = await this.prisma.bed.findFirst({
          where: { id: dto.bedId, tenantId },
        });
        if (!bed) {
          throw new NotFoundException('Bed not found');
        }
        if (bed.status !== 'AVAILABLE') {
          throw new BadRequestException('Bed is not available');
        }
      }

      const admission = await this.prisma.iPDAdmission.create({
        data: {
          patientId: dto.patientId,
          admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : new Date(),
          departmentId: dto.departmentId,
          wardId: dto.wardId,
          bedId: dto.bedId,
          doctorId,
          diagnosis: dto.diagnosis,
          admissionReason: dto.admissionReason,
          notes: dto.notes,
          status: 'ADMITTED',
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
              gender: true,
              bloodType: true,
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
          department: true,
          ward: true,
          bed: true,
        },
      });

      // Update bed status to OCCUPIED if bed was assigned
      if (dto.bedId) {
        await this.prisma.bed.update({
          where: { id: dto.bedId },
          data: { status: 'OCCUPIED' },
        });
      }

      return {
        success: true,
        message: 'Patient admitted successfully',
        data: admission,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to admit patient: ${error.message}`);
    }
  }

  async findAllAdmissions(tenantId: string, query: IPDAdmissionQueryDto) {
    try {
      const { page = 1, limit = 10, search, status, doctorId, departmentId, wardId, date } = query;
      const skip = (page - 1) * limit;

      const where: any = { tenantId };

      if (search) {
        where.OR = [
          { patient: { firstName: { contains: search, mode: 'insensitive' } } },
          { patient: { lastName: { contains: search, mode: 'insensitive' } } },
          { patient: { medicalRecordNumber: { contains: search, mode: 'insensitive' } } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (doctorId) {
        where.doctorId = doctorId;
      }

      if (departmentId) {
        where.departmentId = departmentId;
      }

      if (wardId) {
        where.wardId = wardId;
      }

      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        where.admissionDate = {
          gte: startDate,
          lt: endDate,
        };
      }

      const [admissions, total] = await Promise.all([
        this.prisma.iPDAdmission.findMany({
          where,
          skip,
          take: limit,
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                medicalRecordNumber: true,
                phone: true,
                email: true,
                gender: true,
                bloodType: true,
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
            department: true,
            ward: true,
            bed: true,
          },
          orderBy: { admissionDate: 'desc' },
        }),
        this.prisma.iPDAdmission.count({ where }),
      ]);

      return {
        success: true,
        data: {
          admissions,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch admissions: ${error.message}`);
    }
  }

  async findOneAdmission(id: string, tenantId: string) {
    try {
      const admission = await this.prisma.iPDAdmission.findFirst({
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
              gender: true,
              bloodType: true,
              dateOfBirth: true,
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
            },
          },
          department: true,
          ward: true,
          bed: true,
          treatments: {
            include: {
              doctor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  specialization: true,
                },
              },
            },
            orderBy: { treatmentDate: 'desc' },
          },
          dischargeSummary: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      return {
        success: true,
        data: admission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch admission: ${error.message}`);
    }
  }

  async updateAdmission(id: string, dto: UpdateIPDAdmissionDto, tenantId: string) {
    try {
      const admission = await this.prisma.iPDAdmission.findFirst({
        where: { id, tenantId },
      });

      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      // Verify doctor if provided
      if (dto.doctorId) {
        const doctor = await this.prisma.user.findFirst({
          where: { id: dto.doctorId, tenantId },
        });
        if (!doctor) {
          throw new NotFoundException('Doctor not found');
        }
      }

      // Verify department if provided
      if (dto.departmentId) {
        const department = await this.prisma.department.findFirst({
          where: { id: dto.departmentId, tenantId },
        });
        if (!department) {
          throw new NotFoundException('Department not found');
        }
      }

      // Verify ward if provided
      if (dto.wardId) {
        const ward = await this.prisma.ward.findFirst({
          where: { id: dto.wardId, tenantId },
        });
        if (!ward) {
          throw new NotFoundException('Ward not found');
        }
      }

      // Handle bed change
      if (dto.bedId && dto.bedId !== admission.bedId) {
        const bed = await this.prisma.bed.findFirst({
          where: { id: dto.bedId, tenantId },
        });
        if (!bed) {
          throw new NotFoundException('Bed not found');
        }
        if (bed.status !== 'AVAILABLE') {
          throw new BadRequestException('Bed is not available');
        }

        // Free old bed if exists
        if (admission.bedId) {
          await this.prisma.bed.update({
            where: { id: admission.bedId },
            data: { status: 'AVAILABLE' },
          });
        }

        // Occupy new bed
        await this.prisma.bed.update({
          where: { id: dto.bedId },
          data: { status: 'OCCUPIED' },
        });
      }

      const updateData: any = {};

      if (dto.patientId) updateData.patientId = dto.patientId;
      if (dto.admissionDate) updateData.admissionDate = new Date(dto.admissionDate);
      if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
      if (dto.wardId !== undefined) updateData.wardId = dto.wardId;
      if (dto.bedId !== undefined) updateData.bedId = dto.bedId;
      if (dto.doctorId) updateData.doctorId = dto.doctorId;
      if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;
      if (dto.admissionReason !== undefined) updateData.admissionReason = dto.admissionReason;
      if (dto.notes !== undefined) updateData.notes = dto.notes;
      if (dto.status) updateData.status = dto.status;
      if (dto.dischargeDate) updateData.dischargeDate = new Date(dto.dischargeDate);

      const updated = await this.prisma.iPDAdmission.update({
        where: { id },
        data: updateData,
        include: {
          patient: true,
          doctor: true,
          department: true,
          ward: true,
          bed: true,
        },
      });

      return {
        success: true,
        message: 'Admission updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update admission: ${error.message}`);
    }
  }

  async dischargePatient(id: string, tenantId: string) {
    try {
      const admission = await this.prisma.iPDAdmission.findFirst({
        where: { id, tenantId },
      });

      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      if (admission.status === 'DISCHARGED') {
        throw new BadRequestException('Patient already discharged');
      }

      const updated = await this.prisma.iPDAdmission.update({
        where: { id },
        data: {
          status: 'DISCHARGED',
          dischargeDate: new Date(),
        },
        include: {
          patient: true,
          doctor: true,
          bed: true,
        },
      });

      // Free the bed
      if (admission.bedId) {
        await this.prisma.bed.update({
          where: { id: admission.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      return {
        success: true,
        message: 'Patient discharged successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to discharge patient: ${error.message}`);
    }
  }

  // ============= TREATMENT METHODS =============

  async addTreatment(dto: CreateIPDTreatmentDto, tenantId: string, userId: string) {
    try {
      const admission = await this.prisma.iPDAdmission.findFirst({
        where: { id: dto.admissionId, tenantId },
      });

      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      if (admission.status === 'DISCHARGED') {
        throw new BadRequestException('Cannot add treatment to discharged patient');
      }

      const doctorId = dto.doctorId || userId;

      const treatment = await this.prisma.iPDTreatment.create({
        data: {
          admissionId: dto.admissionId,
          treatmentDate: dto.treatmentDate ? new Date(dto.treatmentDate) : new Date(),
          doctorId,
          notes: dto.notes,
          treatmentPlan: dto.treatmentPlan,
          tenantId,
        },
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Treatment added successfully',
        data: treatment,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to add treatment: ${error.message}`);
    }
  }

  // ============= DISCHARGE SUMMARY METHODS =============

  async createDischargeSummary(dto: CreateIPDDischargeSummaryDto, tenantId: string, userId: string) {
    try {
      const admission = await this.prisma.iPDAdmission.findFirst({
        where: { id: dto.admissionId, tenantId },
        include: { dischargeSummary: true },
      });

      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      if (admission.dischargeSummary) {
        throw new BadRequestException('Discharge summary already exists');
      }

      const summary = await this.prisma.iPDDischargeSummary.create({
        data: {
          admissionId: dto.admissionId,
          dischargeDate: dto.dischargeDate ? new Date(dto.dischargeDate) : new Date(),
          finalDiagnosis: dto.finalDiagnosis,
          treatmentGiven: dto.treatmentGiven,
          conditionAtDischarge: dto.conditionAtDischarge,
          followUpAdvice: dto.followUpAdvice,
          createdBy: userId,
          tenantId,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Update admission status to discharged
      await this.prisma.iPDAdmission.update({
        where: { id: dto.admissionId },
        data: {
          status: 'DISCHARGED',
          dischargeDate: summary.dischargeDate,
        },
      });

      // Free the bed
      if (admission.bedId) {
        await this.prisma.bed.update({
          where: { id: admission.bedId },
          data: { status: 'AVAILABLE' },
        });
      }

      return {
        success: true,
        message: 'Discharge summary created successfully',
        data: summary,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create discharge summary: ${error.message}`);
    }
  }

  async getAdmissionSummary(admissionId: string, tenantId: string) {
    try {
      const admission = await this.prisma.iPDAdmission.findFirst({
        where: { id: admissionId, tenantId },
        include: {
          patient: true,
          doctor: true,
          department: true,
          ward: true,
          bed: true,
          treatments: {
            include: {
              doctor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  specialization: true,
                },
              },
            },
            orderBy: { treatmentDate: 'desc' },
          },
          dischargeSummary: {
            include: {
              creator: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      return {
        success: true,
        data: admission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to fetch admission summary: ${error.message}`);
    }
  }

  async getStats(tenantId: string) {
    try {
      const [totalAdmitted, totalDischarged, availableBeds, occupiedBeds] = await Promise.all([
        this.prisma.iPDAdmission.count({
          where: { tenantId, status: 'ADMITTED' },
        }),
        this.prisma.iPDAdmission.count({
          where: { tenantId, status: 'DISCHARGED' },
        }),
        this.prisma.bed.count({
          where: { tenantId, status: 'AVAILABLE' },
        }),
        this.prisma.bed.count({
          where: { tenantId, status: 'OCCUPIED' },
        }),
      ]);

      return {
        success: true,
        data: {
          totalAdmitted,
          totalDischarged,
          availableBeds,
          occupiedBeds,
          bedOccupancyRate: occupiedBeds + availableBeds > 0 
            ? ((occupiedBeds / (occupiedBeds + availableBeds)) * 100).toFixed(2)
            : '0',
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch stats: ${error.message}`);
    }
  }
}
