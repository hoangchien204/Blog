import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';


import URL_LINK from '../services/API.ts'

const LOCAL_STORAGE_KEY = 'photo_albums';

interface PhotoAlbum {
  id: number;
  photos: string[];      // Danh sách ảnh trong album
  description: string;
  location: string;
  date: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                 
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/\s+/g, '-')            
    .replace(/[^\w\-]+/g, '')        
    .replace(/\-\-+/g, '-')          
    .replace(/^-+/, '')              
    .replace(/-+$/, '');             
}

const PhotoScreen: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [newLocation, setNewLocation] = useState('Chưa xác định'); // default value

const [newTitle, setNewTitle] = useState('');
  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
  try {
    const res = await fetch(`${URL_LINK.photo}`);
    if (!res.ok) throw new Error('Lỗi khi fetch albums');

    const data = await res.json();

    const albums: PhotoAlbum[] = data.albums.map((album: any) => ({
      id: album.id,
      photos: album.photos ? album.photos.map((p: any) => `${URL_LINK.local}${p.src}`) : [],
      description: album.description,
      location: album.location,
      date: new Date(album.date).toLocaleDateString('vi-VN'),
    }));

    setAlbums(albums);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(albums));
  } catch (err) {
    console.error('Lỗi khi lấy album:', err);
  }
};

  const handleAddPhoto = () => {
    setShowModal(true);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setNewDescription('');
     setNewTitle('');
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
      setPreviewUrls((prev) => [
        ...prev,
        ...fileArray.map((file) => URL.createObjectURL(file)),
      ]);
      e.target.value = '';
    }
  };
  const handleSubmit = async () => {
  if (selectedFiles.length === 0) {
    return alert('Bạn chưa chọn ảnh!');
  }

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append('photos', file));
  formData.append('title', newTitle || 'Album mới');  // lấy tiêu đề mới
  formData.append('description', newDescription || 'Album mới');
  formData.append('location', newLocation || 'Chưa xác định'); // gửi location mới
  formData.append('date', new Date().toISOString().split('T')[0]);

  try {
    const res = await fetch(`${URL_LINK.uploadPhoto}`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Lỗi từ server:', result.message || result);
      throw new Error(result.message || 'Lỗi không xác định');
    }

    console.log('Upload thành công:', result);
    closeModal();
    fetchAlbums();

  } catch (err) {
    console.error('Lỗi khi upload:', err);
    alert(`Upload thất bại: ${err.message}`);
  }
};

const handleDeletePreview = (index: number) => {
  setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  setPreviewUrls(prev => prev.filter((_, i) => i !== index));
};
const handleDeleteAlbum = async (albumId) => {
  if (!window.confirm('Bạn có chắc muốn xóa album này?')) return;

  try {
    const res = await fetch(`http://localhost:5000/api/photo-albums/${albumId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    } else {
      alert('Lỗi khi xóa album');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Không thể xóa album.');
  }
};

  return (
    <>
      <div className="outer-container">
        <div className="inner-container">
          <h1 className="section-title">Ảnh chụp</h1>
          <p className="section-subtitle">Những bộ ảnh tự chụp qua ống kính nhiếp ảnh, hoặc đời sống thường ngày.</p>
          <hr className="divider" />
          <div className="photo-grid">
            {/* Ô thêm ảnh (album mới) */}
            <div className="photo-item add-photo" onClick={handleAddPhoto}>
              <span className="plus-icon">+</span>
            </div>

            {/* Hiển thị từng album với 1 ảnh đại diện */}
            {albums.map((album) => (
            <div className="photo-item-wrapper" key={album.id}>
                <Link
                  to={`/photos/${slugify(album.description)}`}
                  state={{ post: album }} 
                  className="photo-item"
                  title={album.description}
                  key={album.id}
                >
                <img
                    src={album.photos[0]}
                    alt={album.description}
                    className="photo-image"
                />
                </Link>
                <span
                className="delete-album-icon"
                onClick={() => handleDeleteAlbum(album.id)}
                title="Xóa album"
                >
                 <FaTrash size={18} />
                </span>
            </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Thêm album mới */}
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Thêm bộ ảnh mới</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
      <input
        type="text"
        placeholder="Tiêu đề bộ ảnh..."
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        style={{ width: '100%', marginBottom: 10, marginTop: 10 }}
      />
      <textarea
        placeholder="Mô tả cho bộ ảnh..."
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        rows={3}
        style={{ width: '100%', marginTop: 10 }}
      />

      {/* Input nhập địa điểm */}
      <input
        type="text"
        placeholder="Nhập địa điểm (location)..."
        value={newLocation}
        onChange={(e) => setNewLocation(e.target.value)}
        style={{ width: '100%', marginTop: 10 }}
      />

      <div className="preview-grid">
        {previewUrls.map((url, idx) => (
          <div key={idx} className="preview-image-wrapper">
            <img src={url} alt={`preview-${idx}`} className="preview-image" />
            <span className="delete-icon" onClick={() => handleDeletePreview(idx)}>🗑️</span>
          </div>
        ))}
      </div>
      <button className="submit-btn" onClick={handleSubmit}>Thêm bộ ảnh</button>
      <button className="close-btn" onClick={closeModal}>Đóng</button>
    </div>
  </div>
)}

      <style>{`
        .outer-container {
          display: flex;
          justify-content: center;
          padding: 20px;
          // min-height: 100vh;
        }

        .inner-container {
          max-width: 800px;
          text-align: left;
          font-family: "Roboto", sans-serif;
          color: #333;
        }

        .section-title {
          font-family: "Lora", serif;
          font-weight: 700;
          font-size: 14pxem;
          margin-bottom: 5px;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #555;
          margin-bottom: 20px;
        }

        .divider {
          border: 0;
          border-top: 1px dashed #ccc;
          margin: 15px 0;
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }

        .photo-item {
          display: block;
          width: 100%;
          height: 150px;
          overflow: hidden;
          border-radius: 5px;
          position: relative;
          cursor: pointer;
        }

        .photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .photo-item:hover .photo-image {
          transform: scale(1.05);
        }

        .add-photo {
          background-color: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #888;
          transition: background-color 0.3s ease;
        }

        .add-photo:hover {
          background-color: #ddd;
        }

        .plus-icon {
          font-size: 3rem;
          line-height: 1;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .modal-content {
          background: #fff;
          padding: 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
          text-align: center;
        }

        .close-btn {
          margin-top: 20px;
          padding: 8px 16px;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .close-btn:hover {
          background: #444;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 8px;
          margin-top: 15px;
        }

        .preview-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 5px;
        }

        .submit-btn {
          margin-top: 15px;
          padding: 8px 16px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .submit-btn:hover {
          background: #0055aa;
        }

     .photo-item-wrapper {
  position: relative;
  display: inline-block;
}

.delete-album-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 18px;
  background-color: rgba(255, 255, 255, 0.85);
  padding: 3px 6px;
  border-radius: 50%;
  display: none;
  cursor: pointer;
  z-index: 10;
  transition: opacity 0.2s ease-in-out;
}

.photo-item-wrapper:hover .delete-album-icon {
  display: block;
}
      `}</style>
    </>
  );
};

export default PhotoScreen;
