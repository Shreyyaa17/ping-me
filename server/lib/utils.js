import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pingme-jwt-dev-secret-3000';

// Function to generate JWT token
export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  return token;
};
