import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import API from '../services/API.ts';

interface NewPost {
  title: string;
  source: string;
  location: string;
  description: string;
  image: File | null;
  previewImage: string;
  youtubeUrl: string;
}

const AddPostPage = () => {
  const navigate = useNavigate();

  const [newPost, setNewPost] = useState<NewPost>({
    title: '',
    source: '',
    location: '',
    description: '',
    image: null,
    previewImage: '',
    youtubeUrl: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNewPost(prev => ({
        ...prev,
        image: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveImage = () => {
    setNewPost(prev => ({
      ...prev,
      image: null,
      previewImage: '',
    }));
  };

const handleAddPost = async () => {
  try {
    if (!newPost.title) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    if (!newPost.image) {
      alert('Vui lòng thêm ảnh minh họa trước khi đăng bài!');
      return;
    }

    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('source', newPost.source || '');
    formData.append('location', newPost.location || '');
    formData.append('description', newPost.description || '');
    formData.append('image', newPost.image);

    console.log('API.blogger:', API.blogger);
    const res = await fetch(API.blogger, {
      method: 'POST',
      body: formData,
    });
console.log('API.blogger:', API.blogger);
    // ✅ Check status trước khi parse JSON
    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      const errorText = await res.text(); // fallback nếu server trả về HTML
      console.error('POST /api/blogger - Invalid JSON. Raw response:', errorText);
      throw new Error('Phản hồi từ server không hợp lệ (không phải JSON)');
    }

    if (res.ok) {
      alert('Thêm bài viết thành công');
      setNewPost({
        title: '',
        source: '',
        location: '',
        description: '',
        image: null,
        previewImage: '',
        youtubeUrl: '',
      });
      navigate('/admin/writing');
    } else {
      console.error('POST /api/blogger - Error response:', data);
      alert(`Thêm bài viết thất bại: ${data.message || 'Lỗi không xác định'}`);
    }
  } catch (error) {
    console.error('POST /api/blogger - Client error:', error);
    alert(`Lỗi khi thêm bài viết: ${error.message}`);
  }
};
  return (
    <>
      <div style={styles.container}>
        <h2 style={styles.heading}>📝 Thêm Bài Viết Mới</h2>

        <div style={styles.row}>
          <input
            placeholder="Tiêu đề"
            style={styles.inputFlex}
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
          />
          <input
            placeholder="Nguồn"
            style={styles.inputFlex}
            value={newPost.source}
            onChange={e => setNewPost({ ...newPost, source: e.target.value })}
          />
          <input
            placeholder="Địa điểm"
            style={styles.inputFlex}
            value={newPost.location}
            onChange={e => setNewPost({ ...newPost, location: e.target.value })}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Mô tả</label>
          <ReactQuill
            theme="snow"
            value={newPost.description}
            onChange={content => setNewPost({ ...newPost, description: content })}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
            formats={[
              'header',
              'bold',
              'italic',
              'underline',
              'list',
              'bullet',
              'link',
              'image',
            ]}
            style={styles.quill}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={{...styles.label, marginTop: 50}}>Ảnh minh họa</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {newPost.previewImage && (
            <div style={styles.previewWrapper}>
              <img
                src={newPost.previewImage}
                alt="preview"
                style={styles.previewImage}
              />
              <button
                onClick={handleRemoveImage}
                style={styles.removeImageBtn}
                title="Xóa ảnh"
                type="button"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Youtube URL</label>
          <input
            type="text"
            placeholder="Nhập link Youtube"
            value={newPost.youtubeUrl}
            onChange={e => setNewPost({ ...newPost, youtubeUrl: e.target.value })}
            style={{ ...styles.inputFlex, width: '100%' }}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => navigate('/admin/writing')}
            style={styles.cancelButton}
            type="button"
          >
            Hủy
          </button>
          <button
            onClick={handleAddPost}
            style={styles.submitButton}
            type="button"
          >
            Lưu bài viết
          </button>
        </div>
      </div>

      <style>
        {`
          .ql-snow .ql-editor img {
            max-width: 15%;
            height: auto;
            display: block;
            margin: 10px 0;
            max-height: 400px;
          }
        `}
      </style>
    </>
  );
};

export default AddPostPage;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '100%',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    margin: '0 auto', // thêm margin để căn giữa trang
  },
  heading: {
    fontSize: 28,
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
  },
  inputFlex: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#444',
  },
  quill: {
    height: 300,
  },
  previewWrapper: {
    position: 'relative',
    display: 'block',
    marginTop: 10,
  },
  previewImage: {
    width: 120,
    height: 90,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #ddd',
    display: 'block',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    background: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    width: 20,
    height: 20,
    fontSize: 12,
    lineHeight: '18px',
    padding: 0,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 30,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    color: '#333',
    padding: '10px 20px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  },
};
