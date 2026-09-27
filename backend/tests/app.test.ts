import { createApp } from '../src/app';

describe('Backend Application', () => {
  it('should create an Express app instance', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});
