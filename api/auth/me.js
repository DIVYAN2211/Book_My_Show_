import jwt from 'jsonwebtoken';
import User from '../../server/models/User';
import mongoose from 'mongoose';

async function authMiddleware(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    return user;
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmyshow', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const user = await authMiddleware(req, res);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
