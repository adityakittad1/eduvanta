import { Response, NextFunction } from 'express';
import { prisma } from '../src/lib/prisma';
import { getStudents } from '../src/modules/students/students.controller';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    student: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Student controller tenant isolation', () => {
  it('should query students with the tenant schoolId', async () => {
    const mockReq = {
      tenant: { id: 'school-123' },
      query: {},
    } as any;
    const mockRes = {
      json: jest.fn(),
    } as unknown as Response;
    const mockNext = jest.fn() as NextFunction;

    // Mock return values
    (prisma.student.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.student.count as jest.Mock).mockResolvedValue(0);

    await getStudents(mockReq, mockRes, mockNext);

    expect(prisma.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { schoolId: 'school-123' },
      })
    );
    expect(prisma.student.count).toHaveBeenCalledWith({ where: { schoolId: 'school-123' } });
    expect(mockRes.json).toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });
});
