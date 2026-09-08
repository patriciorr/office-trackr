import {describe, expect, it, jest} from '@jest/globals';
import {errorHandler} from '../../../src/middleware/errorHandler';
import {ValidationError} from '../../../src/utils/AppError';

const response = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  const originalEnvironment = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnvironment;
  });

  it('uses the status and operational flag from an AppError', () => {
    process.env.NODE_ENV = 'production';
    const res = response();

    errorHandler(new ValidationError('Invalid input'), {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({error: 'Invalid input', isOperational: true});
  });

  it('returns a non-operational 500 response for generic errors', () => {
    process.env.NODE_ENV = 'production';
    const res = response();

    errorHandler(new Error('Unexpected failure'), {} as any, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Unexpected failure', isOperational: false});
  });

  it('includes the error stack outside production', () => {
    process.env.NODE_ENV = 'test';
    const error = new Error('Unexpected failure');
    const res = response();

    errorHandler(error, {} as any, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({error: 'Unexpected failure', stack: error.stack, isOperational: false});
  });
});
