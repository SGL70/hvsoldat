const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../db/index');
const { requireAuth, requireLogistics } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const UPLOAD_DIR = path.join(__dirname, '../../../frontend/public/img');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\//.test(file.mimetype));
  },
});

// GET /api/catalog — all templates
router.get('/', async (req, res) => {
  const result = await pool.query(`
    SELECT t.*, o.name AS unit_name
    FROM equipment_templates t
    LEFT JOIN org_units o ON o.id = t.org_unit_id
    ORDER BY t.category NULLS LAST, t.name
  `);
  res.json(result.rows);
});

// POST /api/catalog — create template (kvm+)
router.post('/', requireLogistics, async (req, res) => {
  const { article_number, name, description, category, quantity, part_of_article } = req.body;
  const result = await pool.query(
    `INSERT INTO equipment_templates
       (article_number, name, description, category, quantity, part_of_article)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [article_number || null, name, description || null,
     category || null, quantity || 1, part_of_article || null]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /api/catalog/:id — update template (kvm+)
router.put('/:id', requireLogistics, async (req, res) => {
  const { article_number, name, description, category, quantity, part_of_article } = req.body;
  const result = await pool.query(
    `UPDATE equipment_templates SET
       article_number=$1, name=$2, description=$3,
       category=$4, quantity=$5, part_of_article=$6
     WHERE id=$7 RETURNING *`,
    [article_number || null, name, description || null,
     category || null, quantity || 1, part_of_article || null, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// DELETE /api/catalog/:id (kvm+)
router.delete('/:id', requireLogistics, async (req, res) => {
  const row = await pool.query(
    'SELECT image_path FROM equipment_templates WHERE id=$1', [req.params.id]
  );
  if (row.rows[0]?.image_path) {
    fs.unlink(path.join(UPLOAD_DIR, row.rows[0].image_path), () => {});
  }
  await pool.query('DELETE FROM equipment_templates WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/catalog/:id/image — upload image (kvm+)
router.post('/:id/image', requireLogistics, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ingen fil' });

  // Remove old image if exists
  const old = await pool.query(
    'SELECT image_path FROM equipment_templates WHERE id=$1', [req.params.id]
  );
  if (old.rows[0]?.image_path) {
    fs.unlink(path.join(UPLOAD_DIR, old.rows[0].image_path), () => {});
  }

  const result = await pool.query(
    'UPDATE equipment_templates SET image_path=$1 WHERE id=$2 RETURNING *',
    [req.file.filename, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

module.exports = router;
