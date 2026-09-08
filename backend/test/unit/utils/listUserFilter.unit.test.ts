import {describe, expect, it} from '@jest/globals';
import {toListUsersFilter} from '../../../src/utils/listUserFilter';

describe('toListUsersFilter', () => {
  it('converts comma-separated query values to arrays', () => {
    expect(toListUsersFilter({emails: 'one@example.com,two@example.com', roles: 'admin,manager', ids: '1,2'})).toEqual({
      emails: ['one@example.com', 'two@example.com'],
      roles: ['admin', 'manager'],
      ids: ['1', '2'],
    });
  });

  it('preserves array query values', () => {
    expect(toListUsersFilter({emails: ['one@example.com'], roles: ['admin'], ids: ['1']})).toEqual({
      emails: ['one@example.com'],
      roles: ['admin'],
      ids: ['1'],
    });
  });

  it('returns an empty filter when no values are provided', () => {
    expect(toListUsersFilter({})).toEqual({});
  });
});
