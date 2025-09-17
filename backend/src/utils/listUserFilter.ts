export interface ListUsersFilter {
  emails?: string[];
  roles?: string[];
  ids?: string[];
}

export const toListUsersFilter = (query: any): ListUsersFilter => {
  const filter: ListUsersFilter = {};
  if (query.emails)
    filter.emails = Array.isArray(query.emails) ? query.emails : [query.emails.toString().split(',')].flat();
  if (query.roles) filter.roles = Array.isArray(query.roles) ? query.roles : [query.roles.toString().split(',')].flat();
  if (query.ids) filter.ids = Array.isArray(query.ids) ? query.ids : [query.ids.toString().split(',')].flat();
  return filter;
};
