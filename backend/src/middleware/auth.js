const jwt = require('jsonwebtoken');

const ROLE_LEVEL = {
  soldat: 0, grpc: 1, pc: 2, toc: 2, kvm: 2, kompc: 3, s4: 4, batCh: 5, stab: 5
};

// KVM and all commanders can manage equipment/logistics
const LOGISTICS_ROLES = new Set(['kvm', 'kompc', 's4', 'batCh', 'stab']);
function requireLogistics(req, res, next) {
  if (!req.user || !LOGISTICS_ROLES.has(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(minRole) {
  return (req, res, next) => {
    const level = ROLE_LEVEL[req.user?.role] ?? -1;
    if (level < ROLE_LEVEL[minRole]) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { requireAuth, requireRole, requireLogistics, ROLE_LEVEL, LOGISTICS_ROLES };
