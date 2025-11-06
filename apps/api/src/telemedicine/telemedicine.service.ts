import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTelemedicineDto } from './dto/create-telemedicine.dto';
import { UpdateTelemedicineDto } from './dto/update-telemedicine.dto';
import { QueryTelemedicineDto } from './dto/query-telemedicine.dto';

@Injectable()
export class TelemedicineService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTelemedicineDto, tenantId: string) {
    const consultation = await this.prisma.telemedicineConsultation.create({
      data: { ...createDto, tenantId },
      include: { patient: true, doctor: true },
    });
    return {
      success: true,
      message: 'Consultation created',
      data: consultation,
    };
  }

  async findAll(tenantId: string, query: QueryTelemedicineDto) {
    const { page = 1, limit = 10 } = query;
    const [consultations, total] = await Promise.all([
      this.prisma.telemedicineConsultation.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { patient: true, doctor: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.telemedicineConsultation.count({ where: { tenantId } }),
    ]);
    return {
      success: true,
      data: {
        items: consultations,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const consultation = await this.prisma.telemedicineConsultation.findFirst({
      where: { id, tenantId },
      include: { patient: true, doctor: true, videoRoom: true },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');
    return { success: true, data: consultation };
  }

  async update(id: string, updateDto: UpdateTelemedicineDto, tenantId: string) {
    const consultation = await this.prisma.telemedicineConsultation.findFirst({
      where: { id, tenantId },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');
    const updated = await this.prisma.telemedicineConsultation.update({
      where: { id },
      data: updateDto,
    });
    return { success: true, message: 'Consultation updated', data: updated };
  }

  async getStats(tenantId: string) {
    const [total, scheduled, completed] = await Promise.all([
      this.prisma.telemedicineConsultation.count({ where: { tenantId } }),
      this.prisma.telemedicineConsultation.count({
        where: { tenantId, status: 'SCHEDULED' },
      }),
      this.prisma.telemedicineConsultation.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
    ]);
    return { success: true, data: { total, scheduled, completed } };
  }
}
