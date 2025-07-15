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

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'render_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    public_id: (req, file) => 'avatar_' + Date.now(),
  },
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// PostgreSQL config
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const hashPassword = (pass) => crypto.createHash('sha256').update(pass).digest('hex');
async function createAdminAccount() {
  const username = 'admin';
  const rawPassword = '03052004';
  const hashedPassword = hashPassword(rawPassword);

  try {
    // Kiểm tra xem đã có admin chưa
    const check = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (check.rowCount > 0) {
      console.log('✅ Tài khoản admin đã tồn tại.');
      return;
    }

    // Chèn tài khoản admin
    await pool.query(
      'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)',
      [username, hashedPassword, true]
    );
    console.log('✅ Đã tạo tài khoản admin thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error.message);
  } finally {
    await pool.end();
  }
}

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username và password bắt buộc' });
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user || user.password !== hashPassword(password)) return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    res.json({ user: { id: user.id, username: user.username, role: user.is_admin ? 'admin' : 'user' }, token: 'fake-token' });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
  }
});

// GỬI EMAIL
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }
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
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Gửi email thành công' });
  } catch (error) {
    console.error('Contact error:', error.message);
    res.status(500).json({ message: 'Gửi email thất bại', error: error.message });
  }
});

// ABOUT
app.get('/api/about', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about ORDER BY id DESC LIMIT 1');
    console.log('>>> Kết quả truy vấn bảng about:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không có dữ liệu about nào' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get about error:', error);  // in cả error, không chỉ .message
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu about', error: error.message });
  }
});

app.put('/api/about', upload.single('avatar'), async (req, res) => {
  try {
    const { id, name, job, intro, quote, description } = req.body;
    if (!id || !name || !job) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc: id, name, job' });
    }

    const avatar = req.file ? req.file.path : null;
    if (avatar && avatar.length > 500) {
      return res.status(400).json({ message: 'URL ảnh quá dài (>500 ký tự)' });
    }

    const checkResult = await pool.query('SELECT 1 FROM about WHERE id = $1', [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi với id này' });
    }

    let query = `UPDATE about SET name=$1, job=$2, intro=$3, quote=$4, description=$5`;
    let params = [name, job, intro || null, quote || null, description || null];

    if (avatar) {
      query += `, avatar=$6 WHERE id=$7`;
      params.push(avatar, id);
    } else {
      query += ` WHERE id=$6`;
      params.push(id);
    }

    await pool.query(query, params);
    res.json({ message: 'Cập nhật thành công', avatarUrl: avatar });
  } catch (error) {
    console.error('PUT /api/about - Error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi cập nhật about', error: error.message });
  }
});

// PROJECTS
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM github_projects ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu projects', error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, owner, githubLink, title, description } = req.body;
    if (!name || !owner || !githubLink || !title) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }
    const result = await pool.query(
      'INSERT INTO github_projects (name, owner, github_link, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, owner, githubLink, title, description]
    );
    res.status(201).json({ message: 'Thêm dự án thành công', id: result.rows[0].id });
  } catch (error) {
    console.error('Post projects error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi thêm dự án', error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM github_projects WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    console.error('Delete projects error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi xóa dự án', error: error.message });
  }
});

// PHOTO ALBUM
app.get('/api/photo-albums', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get photo-albums error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu photo-albums', error: error.message });
  }
});

app.post('/api/upload-photos', upload.array('photos', 10), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    if (!title || !description || !location || !date) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Không có ảnh được upload' });
    }

    const result = await pool.query(
      'INSERT INTO photo_albums (title, description, location, date) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description, location, date]
    );
    const albumId = result.rows[0].id;

    for (const file of req.files) {
      if (file.path.length > 500) {
        return res.status(400).json({ message: 'URL ảnh quá dài (>500 ký tự)' });
      }
      await pool.query('INSERT INTO photos (album_id, src, alt) VALUES ($1, $2, $3)', [
        albumId,
        file.path,
        file.originalname,
      ]);
    }

    res.json({ message: 'Thêm album thành công', albumId });
  } catch (error) {
    console.error('POST /api/upload-photos - Error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi upload ảnh', error: error.message });
  }
});

app.get('/api/photo-albums/:id/photos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, src, alt FROM photos WHERE album_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get photo-albums/:id/photos error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy ảnh', error: error.message });
  }
});

app.get('/api/photo-albums/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const albumResult = await pool.query('SELECT id, title, description, location, date FROM photo_albums');
    const album = albumResult.rows.find((a) => slugify(a.title) === slug);
    if (!album) return res.status(404).json({ message: 'Không tìm thấy album' });
    const photoResult = await pool.query('SELECT id, src, alt FROM photos WHERE album_id = $1', [album.id]);
    res.json({ ...album, photos: photoResult.rows });
  } catch (error) {
    console.error('Get photo-albums/:slug error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy album', error: error.message });
  }
});

app.delete('/api/photo-albums/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM photos WHERE album_id = $1', [id]);
    await pool.query('DELETE FROM photo_albums WHERE id = $1', [id]);
    res.json({ message: 'Xóa album thành công' });
  } catch (error) {
    console.error('Delete photo-albums/:id error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi xóa album', error: error.message });
  }
});

// BLOGGER

app.get('/api/blogger', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogger ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get blogger error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu blogger', error: error.message });
  }
});

app.post('/api/blogger', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('POST /api/blogger - Multer error:', err.message);
      return res.status(400).json({ message: 'Lỗi upload ảnh', error: err.message });
    } else if (err) {
      console.error('POST /api/blogger - Upload error:', err.message);
      return res.status(500).json({ message: 'Lỗi server khi upload ảnh', error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {

    const { title, source, location, description } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ message: 'Thiếu tiêu đề hoặc ảnh' });
    }
    const image_path = req.file.path;
    if (image_path.length > 500) {
      return res.status(400).json({ message: 'URL ảnh quá dài (>500 ký tự)' });
    }

    const today = new Date().toISOString().split('T')[0];
    try {
      const result = await pool.query(
        'INSERT INTO blogger (title, source, image_path, location, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [title, source || null, image_path, location || null, description || null, today]
      );
      res.json({
        message: 'Thêm bài viết thành công',
        id: result.rows[0].id,
        imagePath: image_path
      });
    } catch (dbError) {
      console.error('POST /api/blogger - Database error:', dbError.message);
      return res.status(500).json({ message: 'Lỗi database khi thêm bài viết', error: dbError.message });
    }
  } catch (error) {
    console.error('❌ POST /api/blogger - Error:', error.message);
    res.status(500).json({
      message: 'Lỗi server khi thêm bài viết',
      error: error.message,
    });
  }
});

app.get('/api/blogger/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM blogger');
    const post = result.rows.find((row) => slugify(row.title) === slug);
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json(post);
  } catch (error) {
    console.error('Get blogger/:slug error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy bài viết', error: error.message });
  }
});



app.delete('/api/blogger/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM blogger WHERE id = $1', [id]);
    res.json({ message: 'Xóa blogger thành công' });
  } catch (error) {
    console.error('Delete blogger/:id error:', error.message);
    res.status(500).json({ message: 'Lỗi server khi xóa bài viết', error: error.message });
  }
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
  createAdminAccount();
});