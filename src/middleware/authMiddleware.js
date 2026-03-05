import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-shopora-20';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acçès refusé. Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = decoded; // { userId, storeId, role, iat, exp }
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};

export const authenticateOptional = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        next();
    } catch (error) {
        // Proceed as unauthenticated if token is invalid
        next();
    }
};

export const requireCompany = (req, res, next) => {
    if (!req.user || req.user.role !== 'SELLER') {
        return res.status(403).json({ error: 'Accès restreint aux entreprises.' });
    }
    next();
};

export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Accès restreint aux administrateurs.' });
    }
    next();
};
