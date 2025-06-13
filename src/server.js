// server.js - Viết lại dùng Cloudinary thay vì lưu ảnh local
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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

// Multer config with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'photo_albums',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage });

// DB Config
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

const hashPassword = (pass) => crypto.createHash('sha256').update(pass).digest('hex');

// Insert admin mặc định
async function insertDefaultAdmin() {
  const username = 'admin';
  const password = hashPassword('123');
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) {
    await pool.query('INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)', [username, password, true]);
    console.log('✅ Tài khoản admin đã được thêm');
  }
}

const serveFrontend = (app) => {
  const buildPath = path.join(__dirname, '../build');
  if (!fs.existsSync(buildPath)) {
    console.error('❌ Không tìm thấy thư mục build:', buildPath);
    return;
  }
  app.use(express.static(buildPath));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username và password bắt buộc' });
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user || user.password !== hashPassword(password)) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
  res.json({ user: { id: user.id, username: user.username, role: user.is_admin ? 'admin' : 'user' }, token: 'fake-token' });
});

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

app.get('/api/blogger', async (req, res) => {
  const result = await pool.query('SELECT * FROM blogger ORDER BY date DESC');
  res.json(result.rows);
});

app.post('/api/blogger', upload.single('image'), async (req, res) => {
  const { title, source, location, description } = req.body;
  const image_path = req.file ? req.file.path : null;
  await pool.query(
    'INSERT INTO blogger (title, source, image_path, location, description) VALUES ($1, $2, $3, $4, $5)',
    [title, source, image_path, location, description]
  );
  res.json({ message: 'Thêm blogger thành công' });
});

app.delete('/api/blogger/:id', async (req, res) => {
  const id = req.params.id;
  await pool.query('DELETE FROM blogger WHERE id = $1', [id]);
  res.json({ message: 'Xóa blogger thành công' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  insertDefaultAdmin();
  serveFrontend(app);
});
