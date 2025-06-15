const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'render_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});
const upload = multer({ storage });

// PostgreSQL config
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

const hashPassword = (pass) => crypto.createHash('sha256').update(pass).digest('hex');

async function insertDefaultAdmin() {
  const username = 'admin';
  const password = hashPassword('123');
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) {
    await pool.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, password, true]);
    console.log('✅ Tài khoản admin đã được thêm');
  }
}

// LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username và password bắt buộc' });
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user || user.password !== hashPassword(password)) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
  res.json({ user: { id: user.id, username: user.username, role: user.is_admin ? 'admin' : 'user' }, token: 'fake-token' });
});

// GỬI EMAIL
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `[Liên hệ] ${subject}`,
    text: `Họ tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Gửi email thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Gửi email thất bại' });
  }
});

// ABOUT
app.get('/api/about', async (req, res) => {
  const result = await pool.query('SELECT * FROM about ORDER BY id DESC LIMIT 1');
  res.json(result.rows[0]);
});

app.put('/api/about', upload.single('avatar'), async (req, res) => {
  const { id, name, job, intro, quote, description } = req.body;
  const avatar = req.file ? req.file.path : null;
  let query = `UPDATE about SET name=$1, job=$2, intro=$3, quote=$4, description=$5`;
  let params = [name, job, intro, quote, description];
  if (avatar) {
    query += `, avatar=$6 WHERE id=$7`;
    params.push(avatar, id);
  } else {
    query += ` WHERE id=$6`;
    params.push(id);
  }
  await pool.query(query, params);
  res.json({ message: 'Cập nhật thành công', avatarUrl: avatar });
});

// PROJECTS
app.get('/api/projects', async (req, res) => {
  const result = await pool.query('SELECT * FROM github_projects ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/api/projects', async (req, res) => {
  const { name, owner, githubLink, title, description } = req.body;
  const result = await pool.query(
    'INSERT INTO github_projects (name, owner, github_link, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, owner, githubLink, title, description]
  );
  res.status(201).json({ message: 'Thêm dự án thành công', id: result.rows[0].id });
});

app.delete('/api/projects/:id', async (req, res) => {
  const id = req.params.id;
  const result = await pool.query('DELETE FROM github_projects WHERE id = $1', [id]);
  if (result.rowCount === 0) return res.status(404).send('Không tìm thấy dự án');
  res.send('Xóa thành công');
});

// PHOTO ALBUM
app.get('/api/photo-albums', async (req, res) => {
  const result = await pool.query(`
    SELECT a.id AS albumId, a.title, a.description, a.location, a.date,
           p.id AS photoId, p.src, p.alt
    FROM photo_albums a
    LEFT JOIN photos p ON a.id = p.album_id
    ORDER BY a.date, p.id DESC
  `);
  const albumsMap = new Map();
  for (const row of result.rows) {
    if (!albumsMap.has(row.albumid)) {
      albumsMap.set(row.albumid, {
        id: row.albumid,
        title: row.title,
        description: row.description,
        location: row.location,
        date: row.date,
        photos: []
      });
    }
    if (row.photoid) {
      albumsMap.get(row.albumid).photos.push({ id: row.photoid, src: row.src, alt: row.alt });
    }
  }
  res.json({ albums: Array.from(albumsMap.values()) });
});

app.post('/api/upload-photos', upload.array('photos', 10), async (req, res) => {
  const { title, description, location, date } = req.body;
  const result = await pool.query(
    'INSERT INTO photo_albums (title, description, location, date) VALUES ($1, $2, $3, $4) RETURNING id',
    [title, description, location, date]
  );
  const albumId = result.rows[0].id;
  for (const file of req.files) {
    const src = file.path;
    await pool.query('INSERT INTO photos (album_id, src, alt) VALUES ($1, $2, $3)', [albumId, src, file.originalname]);
  }
  res.json({ message: 'Thêm album thành công', albumId });
});

app.get('/api/photo-albums/:id/photos', async (req, res) => {
  const result = await pool.query('SELECT id, src, alt FROM photos WHERE album_id = $1', [req.params.id]);
  res.json(result.rows);
});

app.delete('/api/photo-albums/:id', async (req, res) => {
  const id = req.params.id;
  await pool.query('DELETE FROM photos WHERE album_id = $1', [id]);
  await pool.query('DELETE FROM photo_albums WHERE id = $1', [id]);
  res.json({ message: 'Album deleted' });
});

// BLOGGER
const slugify = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

app.get('/api/blogger', async (req, res) => {
  const result = await pool.query('SELECT * FROM blogger ORDER BY date DESC');
  res.json(result.rows);
});

app.post('/api/blogger', upload.single('image'), async (req, res) => {
  try {
    const { title, source, location, description } = req.body;
    if (!title || !source || !location || !description) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    const image_path = req.file ? req.file.path : null;
    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      'INSERT INTO blogger (title, source, image_path, location, description, date) VALUES ($1, $2, $3, $4, $5, $6)',
      [title, source, image_path, location, description, today]
    );
    res.json({ message: 'Thêm blogger thành công', imagePath: image_path });
  } catch (error) {
    console.error('Lỗi thêm blogger:', error.message);
    res.status(500).json({ message: 'Lỗi server khi thêm bài viết' });
  }
});

app.get('/api/blogger/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM blogger');
    const post = result.rows.find((row) => slugify(row.title) === slug);
    if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
    res.json(post);
  } catch (err) {
    console.error('Lỗi khi lọc bài viết theo slug:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.get('/api/photo-albums/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const albumResult = await pool.query('SELECT id, title, description, location, date FROM photo_albums');
    const album = albumResult.rows.find((a) => slugify(a.title) === slug);
    if (!album) return res.status(404).json({ error: 'Không tìm thấy album' });
    const photoResult = await pool.query('SELECT id, src, alt FROM photos WHERE album_id = $1', [album.id]);
    res.json({ ...album, photos: photoResult.rows });
  } catch (err) {
    console.error('Lỗi lấy ảnh theo slug:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/api/blogger/:id', async (req, res) => {
  const id = req.params.id;
  await pool.query('DELETE FROM blogger WHERE id = $1', [id]);
  res.json({ message: 'Xóa blogger thành công' });
});

// Serve frontend (nếu có)
const history = require('connect-history-api-fallback');
const buildPath = path.join(__dirname, '../build');
if (require('fs').existsSync(buildPath)) {
  app.use(history({ htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'], disableDotRule: true }));
  app.use(express.static(buildPath));
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  insertDefaultAdmin();
});
