import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(private readonly prisma: CustomPrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto, tenantId: string) {
    try {
      // Check if department code already exists for this tenant
      if (createDepartmentDto.code) {
        const existing = await this.prisma.department.findFirst({
          where: {
            code: createDepartmentDto.code,
            tenantId,
          },
        });

        if (existing) {
          throw new ConflictException(
            `Department with code '${createDepartmentDto.code}' already exists`,
          );
        }
      }

      const department = await this.prisma.department.create({
        data: {
          ...createDepartmentDto,
          tenantId,
        },
      });

      this.logger.log(
        `Department created: ${department.id} for tenant: ${tenantId}`,
      );

      return {
        success: true,
        message: 'Department created successfully',
        data: department,
      };
    } catch (error) {
      this.logger.error(
        `Error creating department: ${error.message}`,
        error.stack,
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create department');
    }
  }

  async findAll(tenantId: string, isActive?: boolean) {
    try {
      const where: any = { tenantId };
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const departments = await this.prisma.department.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              staff: true,
            },
          },
        },
      });

      return {
        success: true,
        data: departments,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching departments: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch departments');
    }
  }

  async findOne(id: string, tenantId: string) {
    try {
      const department = await this.prisma.department.findFirst({
        where: { id, tenantId },
        include: {
          _count: {
            select: {
              staff: true,
            },
          },
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      return {
        success: true,
        data: department,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching department: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch department');
    }
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    tenantId: string,
  ) {
    try {
      // Check if department exists
      const existing = await this.prisma.department.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException('Department not found');
      }

      // Check if code is being updated and if it conflicts
      if (updateDepartmentDto.code && updateDepartmentDto.code !== existing.code) {
        const codeExists = await this.prisma.department.findFirst({
          where: {
            code: updateDepartmentDto.code,
            tenantId,
            id: { not: id },
          },
        });

        if (codeExists) {
          throw new ConflictException(
            `Department with code '${updateDepartmentDto.code}' already exists`,
          );
        }
      }

      const department = await this.prisma.department.update({
        where: { id },
        data: updateDepartmentDto,
      });

      this.logger.log(`Department updated: ${id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Department updated successfully',
        data: department,
      };
    } catch (error) {
      this.logger.error(
        `Error updating department: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update department');
    }
  }

  async remove(id: string, tenantId: string) {
    try {
      // Check if department exists
      const department = await this.prisma.department.findFirst({
        where: { id, tenantId },
        include: {
          _count: {
            select: {
              staff: true,
            },
          },
        },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      // Check if department has staff
      if (department._count.staff > 0) {
        throw new BadRequestException(
          `Cannot delete department with ${department._count.staff} staff member(s). Please reassign staff first.`,
        );
      }

      // Soft delete by setting isActive to false
      await this.prisma.department.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(`Department deactivated: ${id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Department deactivated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting department: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete department');
    }
  }
}
