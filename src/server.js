const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config({ path: __dirname + '/.env' });

// Tạo app
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Phục vụ ảnh tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname,  'services', 'uploads')));

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Cấu hình kết nối SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

const crypto = require('crypto');

// Hash password với SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex'); // <-- trả về string
}

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Cấu hình gửi email (sử dụng Gmail hoặc mail server khác)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Thay bằng email của bạn
      pass: process.env.EMAIL_PASS,     // Mật khẩu ứng dụng
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Nhận tại email này
    subject: `[Liên hệ] ${subject}`,
    text: `Họ tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Gửi email thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gửi email thất bại!' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username và password bắt buộc' });
  }

  try {
    await poolConnect;
    const hashedInputPassword = hashPassword(password);

    const request = pool.request();
    const result = await request
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const user = result.recordset[0];

    if (user.password !== hashedInputPassword) {
      return res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      role: user.is_admin ? 'admin' : 'user',
    };

    // Trả về token giả (nên thay bằng JWT thật)
    const fakeToken = 'fake-jwt-token-for-demo';

    return res.json({ user: userInfo, token: fakeToken });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
});


app.get('/api/about', async (req, res) => {
  console.log('GET /api/about called');
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT TOP 1 * FROM about ORDER BY id DESC');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi truy vấn:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.put('/api/about', upload.single('avatar'), async (req, res) => {
  console.log('PUT /api/about called');
  await poolConnect;

  const { name, job, intro, quote, description, id } = req.body;
  const file = req.file;

  if (!id) {
    return res.status(400).json({ error: 'Thiếu id để cập nhật' });
  }

  let avatarPath = null;
  if (file) {
    avatarPath = `/uploads/${file.filename}`;
  }

  try {
    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('name', sql.NVarChar(100), name);
    request.input('job', sql.NVarChar(100), job);
    request.input('intro', sql.NVarChar(sql.MAX), intro);
    request.input('quote', sql.NVarChar(sql.MAX), quote);
    request.input('description', sql.NVarChar(sql.MAX), description);

    let query = `
      UPDATE about SET
        name = @name,
        job = @job,
        intro = @intro,
        quote = @quote,
        description = @description
    `;

    if (avatarPath) {
      request.input('avatar', sql.NVarChar(255), avatarPath);
      query += `, avatar = @avatar`;
    }

    query += ` WHERE id = @id`;

    const result = await request.query(query);


    res.status(200).json({ message: 'Cập nhật thông tin thành công', avatarUrl: avatarPath });
  } catch (err) {
    console.error('Lỗi khi cập nhật dữ liệu:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});
//get
app.get('/api/projects', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM github_projects ORDER BY id DESC`;

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách dự án:', err);
    res.status(500).send('❌ Lấy danh sách dự án thất bại');
  }
});
//add
app.post('/api/projects', async (req, res) => {
  const { name, owner, githubLink, title, description } = req.body;

  if (!name || !owner || !githubLink) {
    return res.status(400).send('❌ Thiếu trường bắt buộc (name, owner hoặc githubLink)');
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      INSERT INTO github_projects (name, owner, github_link, title, description)
      OUTPUT INSERTED.id
      VALUES (${name}, ${owner}, ${githubLink}, ${title}, ${description})`;

    const insertedId = result.recordset[0].id;
    res.status(201).json({ message: '✅ Thêm dự án thành công', id: insertedId });
  } catch (err) {
    console.error('❌ Lỗi khi thêm dự án:', err);
    res.status(500).send('❌ Thêm thất bại: ' + err.message);
  }
});
//xoa
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await sql.connect(config);
    const result = await sql.query`DELETE FROM github_projects WHERE id = ${id}`;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('❌ Không tìm thấy dự án để xóa');
    }

    res.send('✅ Xóa dự án thành công');
  } catch (err) {
    console.error('❌ Lỗi khi xóa dự án:', err);
    res.status(500).send('❌ Xóa thất bại');
  }
});

app.get('/api/photo-albums', async (req, res) => {
  try {
    await poolConnect;

    // Lấy danh sách album cùng ảnh
    const result = await pool.request().query(`
       SELECT 
        a.id AS albumId, a.title, a.description, a.location, a.date,
        p.id AS photoId, p.src, p.alt
      FROM photo_albums a
      LEFT JOIN photos p ON a.id = p.album_id
      ORDER BY a.date, p.id DESC
    `);

    // Tập hợp dữ liệu album + ảnh theo albumId
    const albumsMap = new Map();

    for (const row of result.recordset) {
      if (!albumsMap.has(row.albumId)) {
        albumsMap.set(row.albumId, {
          id: row.albumId,
          title: row.title,
          description: row.description,
          location: row.location,
          date: row.date,
          photos: [],
        });
      }
      if (row.photoId) {
        albumsMap.get(row.albumId).photos.push({
          id: row.photoId,
          src: row.src,
          alt: row.alt,
        });
      }
    }

    const albums = Array.from(albumsMap.values());

    res.json({ albums });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu album' });
  }
});

app.post('/api/upload-photos', upload.array('photos', 10), async (req, res) => {
  const { title, description, location, date } = req.body;
  const files = req.files;

  if (!files || files.length === 0)
    return res.status(400).json({ message: 'Không có ảnh nào được tải lên.' });

  try {
    await poolConnect;

    // Thêm album
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('location', sql.NVarChar, location)
      .input('date', sql.Date, date)
      .query(`
        INSERT INTO photo_albums (title, description, location, date)
        OUTPUT INSERTED.id
        VALUES (@title, @description, @location, @date)
      `);

    const albumId = result.recordset[0].id;

    // Lưu từng ảnh
    for (const file of files) {
      const src = `/uploads/${file.filename}`;
      await pool
        .request()
        .input('album_id', sql.Int, albumId)
        .input('src', sql.NVarChar, src)
        .input('alt', sql.NVarChar, file.originalname)
        .query(`
          INSERT INTO photos (album_id, src, alt)
          VALUES (@album_id, @src, @alt)
        `);
    }

    res.status(201).json({ message: 'Thêm ảnh thành công', albumId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lưu ảnh' });
  }
});

app.get('/api/photo-albums/:id/photos', async (req, res) => {
  const albumId = req.params.id;

  try {
    await poolConnect;

    const result = await pool
      .request()
      .input('album_id', sql.Int, albumId)
      .query(`
        SELECT id, src, alt
        FROM photos
        WHERE album_id = @album_id
        ORDER BY id
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy ảnh của album' });
  }
});

app.delete('/api/photo-albums/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await poolConnect;

    // Lấy danh sách ảnh để xóa file vật lý
    const photos = await pool.request()
      .input('id', id)
      .query('SELECT src FROM photos WHERE album_id = @id');

    // Xóa file ảnh
    photos.recordset.forEach(p => {
      const fullPath = path.join(__dirname, '..', p.src);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    // Xóa dữ liệu từ bảng photos trước
    await pool.request().input('id', id).query('DELETE FROM photos WHERE album_id = @id');

    // Xóa bảng photo_albums
    await pool.request().input('id', id).query('DELETE FROM photo_albums WHERE id = @id');

    res.json({ message: 'Album deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/blogger', async (req, res) => {
  try {
      await poolConnect;
    const result = await pool.request().query('SELECT * FROM blogger ORDER BY [date] DESC');
    res.json(result.recordset);

  } catch (err) {
    console.error('GET error:', err);
    res.status(500).send('Server error');
  }
});

app.post('/api/blogger', upload.single('image'), async (req, res) => {
  const { title, source, location, description } = req.body;
  const image_path = req.file ? `/uploads/${req.file.filename}` : null;

  try {
   await poolConnect;
     const request = pool.request();
    await request
  .input('title', sql.NVarChar, title)
  .input('source', sql.NVarChar, source)
  .input('image_path', sql.NVarChar, image_path)
  .input('location', sql.NVarChar, location)
  .input('description', sql.NVarChar, description)
  .query(`INSERT INTO blogger (title, source, image_path, location, description)
          VALUES (@title, @source, @image_path, @location, @description)`);
    res.status(201).json({ message: 'Bài viết đã được thêm.' });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).send('Lỗi khi thêm bài viết.');
  }
});

app.delete('/api/blogger/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;
     const request = pool.request();

    // Lấy đường dẫn ảnh trước khi xoá
    const result = await request.query(`SELECT image_path FROM blogger WHERE id = ${id}`);
    const post = result.recordset[0];
    if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.' });

    // Xoá bài viết
    await request.query(`DELETE FROM blogger WHERE id = ${id}`);

    // Xoá ảnh vật lý nếu có
    if (post.image_path) {
      const imagePath = path.join(__dirname, post.image_path);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Đã xoá bài viết.' });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).send('Lỗi khi xoá bài viết.');
  }
});


// Chạy server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';  // lắng nghe tất cả IP

app.listen(PORT, HOST, () => {
  console.log(`✅ Server đang chạy ở http://${HOST}:${PORT}`);
});
