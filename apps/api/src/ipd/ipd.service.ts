import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateWardDto,
  UpdateWardDto,
  CreateBedDto,
  UpdateBedStatusDto,
  WardFilterDto,
  BedFilterDto,
  BedStatus,
  WardType,
  CreateAdmissionDto,
  UpdateAdmissionDto,
  DischargePatientDto,
  TransferPatientDto,
  AdmissionFilterDto,
} from './dto';

@Injectable()
export class IpdService {
  private readonly logger = new Logger(IpdService.name);

  constructor(private prisma: CustomPrismaService) {}

  // ==================== Helper Methods ====================

  /**
   * Get ward include options
   */
  private getWardIncludes() {
    return {
      beds: {
        orderBy: { bedNumber: 'asc' as const },
      },
      _count: {
        select: {
          beds: true,
        },
      },
    };
  }

  /**
   * Get bed include options
   */
  private getBedIncludes() {
    return {
      ward: {
        select: {
          id: true,
          name: true,
          type: true,
          location: true,
        },
      },
    };
  }

  /**
   * Build where clause for ward queries
   */
  private buildWardWhereClause(
    tenantId: string,
    filters: WardFilterDto,
  ): Prisma.WardWhereInput {
    const { search, isActive = true } = filters;

    const where: Prisma.WardWhereInput = {
      tenantId,
      isActive,
    };

    // Skip type filter for now as it's not in the Ward model
    // if (type) {
    //   where.type = type;
    // }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return where;
  }

  /**
   * Build where clause for bed queries
   */
  private buildBedWhereClause(
    tenantId: string,
    filters: BedFilterDto,
  ): Prisma.BedWhereInput {
    const { wardId, status, search, isActive = true } = filters;

    const where: Prisma.BedWhereInput = {
      tenantId,
      isActive,
    };

    if (wardId) {
      where.wardId = wardId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [{ bedNumber: { contains: search } }];
    }

    return where;
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(
    page: any,
    limit: any,
  ): { page: number; limit: number } {
    const validatedPage = Math.max(1, parseInt(page?.toString() || '1', 10));
    const validatedLimit = Math.min(
      100,
      Math.max(1, parseInt(limit?.toString() || '10', 10)),
    );

    return { page: validatedPage, limit: validatedLimit };
  }

  // ==================== Ward Management ====================

  /**
   * Create a new ward
   */
  async createWard(createWardDto: CreateWardDto, tenantId: string) {
    try {
      this.logger.log(
        `Creating ward: ${createWardDto.name} for tenant: ${tenantId}`,
      );

      const ward = await this.prisma.ward.create({
        data: {
          ...createWardDto,
          tenantId,
        },
        include: this.getWardIncludes(),
      });

      this.logger.log(`Successfully created ward with ID: ${ward.id}`);
      return {
        success: true,
        message: 'Ward created successfully',
        data: ward,
      };
    } catch (error) {
      this.logger.error('Error creating ward:', error.message, error.stack);
      throw new BadRequestException(error.message || 'Failed to create ward');
    }
  }

  /**
   * Find all wards with filters
   */
  async findAllWards(tenantId: string, filters: WardFilterDto = {}) {
    try {
      this.logger.log(
        `Finding wards for tenant: ${tenantId} with filters:`,
        filters,
      );

      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildWardWhereClause(tenantId, filters);

      const [wards, total] = await Promise.all([
        this.prisma.ward.findMany({
          where,
          skip,
          take: limit,
          include: this.getWardIncludes(),
          orderBy: { name: 'asc' },
        }),
        this.prisma.ward.count({ where }),
      ]);

      this.logger.log(`Found ${wards.length} wards out of ${total} total`);
      return {
        success: true,
        data: {
          items: wards,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding wards:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch wards');
    }
  }

  /**
   * Find one ward by ID
   */
  async findOneWard(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding ward with ID: ${id} for tenant: ${tenantId}`);

      const ward = await this.prisma.ward.findFirst({
        where: { id, tenantId, isActive: true },
        include: this.getWardIncludes(),
      });

      if (!ward) {
        this.logger.warn(
          `Ward not found with ID: ${id} for tenant: ${tenantId}`,
        );
        throw new NotFoundException('Ward not found');
      }

      this.logger.log(`Successfully found ward: ${ward.name}`);
      return { success: true, data: ward };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding ward:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch ward');
    }
  }

  /**
   * Update ward
   */
  async updateWard(id: string, updateWardDto: UpdateWardDto, tenantId: string) {
    try {
      this.logger.log(`Updating ward with ID: ${id} for tenant: ${tenantId}`);

      const ward = await this.prisma.ward.findFirst({
        where: { id, tenantId, isActive: true },
      });

      if (!ward) {
        this.logger.warn(
          `Ward not found with ID: ${id} for tenant: ${tenantId}`,
        );
        throw new NotFoundException('Ward not found');
      }

      const updated = await this.prisma.ward.update({
        where: { id },
        data: updateWardDto,
        include: this.getWardIncludes(),
      });

      this.logger.log(`Successfully updated ward: ${updated.name}`);
      return {
        success: true,
        message: 'Ward updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating ward:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Ward not found');
      }
      throw new BadRequestException('Failed to update ward');
    }
  }

  // ==================== Bed Management ====================

  /**
   * Create a new bed
   */
  async createBed(createBedDto: CreateBedDto, tenantId: string) {
    try {
      this.logger.log(
        `Creating bed: ${createBedDto.bedNumber} in ward: ${createBedDto.wardId} for tenant: ${tenantId}`,
      );

      // Verify ward exists
      const ward = await this.prisma.ward.findFirst({
        where: { id: createBedDto.wardId, tenantId, isActive: true },
      });
      if (!ward) {
        throw new NotFoundException('Ward not found');
      }

      const bed = await this.prisma.bed.create({
        data: {
          ...createBedDto,
          tenantId,
          status: createBedDto.status || BedStatus.AVAILABLE,
        },
        include: this.getBedIncludes(),
      });

      this.logger.log(`Successfully created bed with ID: ${bed.id}`);
      return {
        success: true,
        message: 'Bed created successfully',
        data: bed,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error creating bed:', error.message, error.stack);
      throw new BadRequestException(error.message || 'Failed to create bed');
    }
  }

  /**
   * Find all beds with filters
   */
  async findAllBeds(tenantId: string, filters: BedFilterDto = {}) {
    try {
      this.logger.log(
        `Finding beds for tenant: ${tenantId} with filters:`,
        filters,
      );

      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildBedWhereClause(tenantId, filters);

      const [beds, total] = await Promise.all([
        this.prisma.bed.findMany({
          where,
          skip,
          take: limit,
          include: this.getBedIncludes(),
          orderBy: { bedNumber: 'asc' },
        }),
        this.prisma.bed.count({ where }),
      ]);

      this.logger.log(`Found ${beds.length} beds out of ${total} total`);
      return {
        success: true,
        data: {
          items: beds,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding beds:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch beds');
    }
  }

  /**
   * Find available beds
   */
  async findAvailableBeds(tenantId: string) {
    try {
      this.logger.log(`Finding available beds for tenant: ${tenantId}`);

      const beds = await this.prisma.bed.findMany({
        where: {
          tenantId,
          isActive: true,
          status: BedStatus.AVAILABLE,
        },
        include: this.getBedIncludes(),
        orderBy: { bedNumber: 'asc' },
      });

      this.logger.log(`Found ${beds.length} available beds`);
      return { success: true, data: beds };
    } catch (error) {
      this.logger.error(
        'Error finding available beds:',
        error.message,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch available beds');
    }
  }

  /**
   * Update bed status
   */
  async updateBedStatus(
    id: string,
    updateBedStatusDto: UpdateBedStatusDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(
        `Updating bed status for ID: ${id} to ${updateBedStatusDto.status} for tenant: ${tenantId}`,
      );

      const bed = await this.prisma.bed.findFirst({
        where: { id, tenantId, isActive: true },
      });

      if (!bed) {
        this.logger.warn(
          `Bed not found with ID: ${id} for tenant: ${tenantId}`,
        );
        throw new NotFoundException('Bed not found');
      }

      const updated = await this.prisma.bed.update({
        where: { id },
        data: {
          status: updateBedStatusDto.status,
          ...(updateBedStatusDto.notes && {
            description: updateBedStatusDto.notes,
          }),
        },
        include: this.getBedIncludes(),
      });

      this.logger.log(
        `Successfully updated bed ${bed.bedNumber} status to ${updateBedStatusDto.status}`,
      );
      return {
        success: true,
        message: 'Bed status updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        'Error updating bed status:',
        error.message,
        error.stack,
      );
      if (error.code === 'P2025') {
        throw new NotFoundException('Bed not found');
      }
      throw new BadRequestException('Failed to update bed status');
    }
  }

  /**
   * Get IPD statistics
   */
  async getStats(tenantId: string) {
    try {
      this.logger.log(`Getting IPD stats for tenant: ${tenantId}`);

      const [
        totalWards,
        totalBeds,
        availableBeds,
        occupiedBeds,
        maintenanceBeds,
        reservedBeds,
      ] = await Promise.all([
        this.prisma.ward.count({ where: { tenantId, isActive: true } }),
        this.prisma.bed.count({ where: { tenantId, isActive: true } }),
        this.prisma.bed.count({
          where: { tenantId, isActive: true, status: BedStatus.AVAILABLE },
        }),
        this.prisma.bed.count({
          where: { tenantId, isActive: true, status: BedStatus.OCCUPIED },
        }),
        this.prisma.bed.count({
          where: { tenantId, isActive: true, status: BedStatus.MAINTENANCE },
        }),
        this.prisma.bed.count({
          where: { tenantId, isActive: true, status: BedStatus.RESERVED },
        }),
      ]);

      const occupancyRate =
        totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0;

      this.logger.log(
        `Successfully retrieved IPD stats for tenant: ${tenantId}`,
      );
      return {
        success: true,
        data: {
          wards: {
            total: totalWards,
          },
          beds: {
            total: totalBeds,
            available: availableBeds,
            occupied: occupiedBeds,
            maintenance: maintenanceBeds,
            reserved: reservedBeds,
          },
          occupancyRate: Number(occupancyRate),
        },
      };
    } catch (error) {
      this.logger.error('Error getting IPD stats:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch IPD statistics');
    }
  }

  // ==================== Admission Management ====================

  /**
   * Create admission (using MedicalRecord table)
   */
  async createAdmission(dto: CreateAdmissionDto, tenantId: string) {
    try {
      this.logger.log(`Creating admission for patient: ${dto.patientId}`);

      // Verify patient exists
      const patient = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      // Verify doctor exists
      const doctor = await this.prisma.user.findFirst({
        where: { id: dto.doctorId, tenantId },
      });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      // Verify bed exists and is available
      const bed = await this.prisma.bed.findFirst({
        where: { id: dto.bedId, tenantId, status: BedStatus.AVAILABLE },
        include: { ward: true },
      });
      if (!bed) {
        throw new BadRequestException('Bed not available');
      }

      // Create medical record for admission
      const admission = await this.prisma.medicalRecord.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          recordType: 'IPD_ADMISSION',
          title: dto.diagnosis || dto.reason,
          description: `IPD Admission - Bed: ${bed.bedNumber}, Ward: ${bed.ward.name}\n\nReason: ${dto.reason}\n${dto.notes ? '\nNotes: ' + dto.notes : ''}`,
          date: new Date(),
          tenantId,
        },
        include: {
          patient: true,
          doctor: true,
        },
      });

      // Update bed status to OCCUPIED
      await this.prisma.bed.update({
        where: { id: dto.bedId },
        data: { status: BedStatus.OCCUPIED },
      });

      this.logger.log(`Admission created successfully: ${admission.id}`);

      return {
        success: true,
        message: 'Patient admitted successfully',
        data: {
          ...admission,
          bedId: dto.bedId,
          bed: bed,
          status: 'ADMITTED',
        },
      };
    } catch (error) {
      this.logger.error('Error creating admission:', error.message, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create admission');
    }
  }

  /**
   * Get all admissions
   */
  async findAllAdmissions(tenantId: string, filters: AdmissionFilterDto = {}) {
    try {
      const { page = 1, limit = 10, doctorId, patientId, search } = filters;
      const skip = (page - 1) * limit;

      const where: any = { tenantId };

      if (doctorId) where.doctorId = doctorId;
      if (patientId) where.patientId = patientId;

      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { patient: { firstName: { contains: search } } },
          { patient: { lastName: { contains: search } } },
        ];
      }

      const [admissions, total] = await Promise.all([
        this.prisma.medicalRecord.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: true,
            doctor: true,
          },
        }),
        this.prisma.medicalRecord.count({ where }),
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
      this.logger.error('Error finding admissions:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch admissions');
    }
  }

  /**
   * Get admission by ID
   */
  async findOneAdmission(id: string, tenantId: string) {
    try {
      const admission = await this.prisma.medicalRecord.findFirst({
        where: { id, tenantId },
        include: {
          patient: true,
          doctor: true,
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
      this.logger.error('Error finding admission:', error.message, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch admission');
    }
  }

  /**
   * Update admission
   */
  async updateAdmission(
    id: string,
    dto: UpdateAdmissionDto,
    tenantId: string,
  ) {
    try {
      const updateData: any = {};
      if (dto.doctorId) updateData.doctorId = dto.doctorId;
      if (dto.diagnosis) updateData.title = dto.diagnosis;
      if (dto.notes) updateData.description = dto.notes;

      const admission = await this.prisma.medicalRecord.update({
        where: { id, tenantId },
        data: updateData,
        include: {
          patient: true,
          doctor: true,
        },
      });

      return {
        success: true,
        message: 'Admission updated successfully',
        data: admission,
      };
    } catch (error) {
      this.logger.error('Error updating admission:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Admission not found');
      }
      throw new BadRequestException('Failed to update admission');
    }
  }

  /**
   * Discharge patient
   */
  async dischargePatient(
    id: string,
    dto: DischargePatientDto,
    tenantId: string,
  ) {
    try {
      const admission = await this.prisma.medicalRecord.findFirst({
        where: { id, tenantId },
      });
      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      // Update medical record with discharge info
      await this.prisma.medicalRecord.update({
        where: { id },
        data: {
          description: `${admission.description || ''}\n\n=== DISCHARGE SUMMARY ===\n${dto.dischargeSummary}\n\n=== DISCHARGE INSTRUCTIONS ===\n${dto.dischargeInstructions || 'N/A'}`,
          recordType: 'IPD_DISCHARGE',
        },
      });

      // Find and free beds with this admission (simplified - in production use a join table)
      const beds = await this.prisma.bed.findMany({
        where: {
          tenantId,
          status: BedStatus.OCCUPIED,
        },
      });

      // Free the first occupied bed (simplified logic)
      if (beds.length > 0) {
        await this.prisma.bed.update({
          where: { id: beds[0].id },
          data: { status: BedStatus.AVAILABLE },
        });
      }

      this.logger.log(`Patient discharged: ${id}`);

      return {
        success: true,
        message: 'Patient discharged successfully',
      };
    } catch (error) {
      this.logger.error('Error discharging patient:', error.message, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to discharge patient');
    }
  }

  /**
   * Transfer patient to another bed
   */
  async transferPatient(
    id: string,
    dto: TransferPatientDto,
    tenantId: string,
  ) {
    try {
      const admission = await this.prisma.medicalRecord.findFirst({
        where: { id, tenantId },
      });
      if (!admission) {
        throw new NotFoundException('Admission not found');
      }

      // Verify new bed is available
      const newBed = await this.prisma.bed.findFirst({
        where: { id: dto.newBedId, tenantId, status: BedStatus.AVAILABLE },
        include: { ward: true },
      });
      if (!newBed) {
        throw new BadRequestException('New bed not available');
      }

      // Update medical record with transfer info
      await this.prisma.medicalRecord.update({
        where: { id },
        data: {
          description: `${admission.description || ''}\n\n=== TRANSFER ===\nReason: ${dto.reason}\nNew Bed: ${newBed.bedNumber}, Ward: ${newBed.ward.name}\n${dto.notes || ''}`,
          recordType: 'IPD_TRANSFER',
        },
      });

      // Update bed statuses
      await this.prisma.bed.update({
        where: { id: dto.newBedId },
        data: { status: BedStatus.OCCUPIED },
      });

      this.logger.log(`Patient transferred: ${id} to bed ${dto.newBedId}`);

      return {
        success: true,
        message: 'Patient transferred successfully',
        data: {
          newBed: newBed,
        },
      };
    } catch (error) {
      this.logger.error('Error transferring patient:', error.message, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to transfer patient');
    }
  }
}
