import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const adminUsername = process.env['ADMIN_USERNAME'];
  const adminPasswordHash = process.env['ADMIN_PASSWORD_HASH'];
  const jwtSecret = process.env['JWT_SECRET'];

  if (!adminUsername || !adminPasswordHash || !jwtSecret) {
    console.error('Auth env vars missing: ADMIN_USERNAME, ADMIN_PASSWORD_HASH, or JWT_SECRET');
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  const usernameMatches = username === adminUsername;
  const passwordMatches = await bcrypt.compare(password, adminPasswordHash);

  // Always run bcrypt.compare to prevent timing-based username enumeration
  if (!usernameMatches || !passwordMatches) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { sub: adminUsername, role: 'admin' },
    jwtSecret,
    { expiresIn: (process.env['JWT_EXPIRES_IN'] || '8h') as jwt.SignOptions['expiresIn'] }
  );

  res.json({ token });
});

export default router;
