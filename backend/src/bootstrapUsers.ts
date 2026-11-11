import UserService from './services/userService';

export async function bootstrapUsers() {
  if (process.env.BOOTSTRAP_USERS !== 'true') return;
  if (process.env.DISABLE_REGISTRATION !== 'true') {
    throw new Error('BOOTSTRAP_USERS requires DISABLE_REGISTRATION=true');
  }

  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const coworkerEmail = process.env.BOOTSTRAP_COWORKER_EMAIL;
  const coworkerPassword = process.env.BOOTSTRAP_COWORKER_PASSWORD;
  if (!adminEmail || !adminPassword || !coworkerEmail || !coworkerPassword) {
    throw new Error('All bootstrap email and password variables are required');
  }
  if (adminEmail.toLowerCase() === coworkerEmail.toLowerCase()) {
    throw new Error('Bootstrap accounts must have different email addresses');
  }

  const service = new UserService();
  const accounts = [
    {firstName: 'Demo', lastName: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' as const},
    {firstName: 'Demo', lastName: 'User', email: coworkerEmail, password: coworkerPassword, role: 'coworker' as const},
  ];
  for (const account of accounts) {
    const existing = await service.getUserByEmail(account.email);
    if (existing) {
      if (existing.role !== account.role) throw new Error('Existing bootstrap account has an unexpected role');
      continue;
    }
    await service.createUser(account);
  }
}
