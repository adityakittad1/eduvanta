// upload.controller.test.ts
import { Response, NextFunction } from 'express';
import { handleUpload } from '../src/modules/upload/upload.controller';

describe('Upload Controller', () => {
  it('should return tenant-aware file URL', async () => {
    const mockReq = {
      tenant: { id: 'school-123' },
      file: {
        filename: 'testfile-abc123.png',
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1024,
      },
    } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const mockNext = jest.fn() as NextFunction;

    await handleUpload(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          url: expect.stringContaining(`/api/v1/upload/${mockReq.tenant.id}/${mockReq.file.filename}`),
        }),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
