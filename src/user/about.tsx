import React, { useEffect, useState, ChangeEvent } from 'react';

import Footer from '../components/footer.tsx';
import img from '../assets/img/avartar.jpg';


const baseURL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api/about';
type ProfileType = {
  name: string;
  job: string;
  intro: string;
  quote: string;
  description: string;
  avatar: string;
};

const defaultProfile: ProfileType = {
  name: '',
  job: '',
  intro: '',
  quote: '',
  description: '',
  avatar: img, // ảnh mặc định
};

const About: React.FC = () => {
  // Khởi tạo bằng defaultProfile, không null nữa
  const [profile, setProfile] = useState<ProfileType>(defaultProfile);
  const [tempProfile, setTempProfile] = useState<ProfileType>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu API');
        return res.json();
      })
      .then((data: ProfileType | null) => {
        if (data) {
          setProfile(data);
          setTempProfile(data);
        } else {
          // Nếu API trả về null hoặc rỗng thì giữ mặc định
          setProfile(defaultProfile);
          setTempProfile(defaultProfile);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        // Giữ nguyên default nếu lỗi
      });
  }, []);

  const openEditModal = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setIsEditing(false);
  };

  const handleChange = (field: keyof ProfileType, value: string) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const blobUrl = URL.createObjectURL(file);
    setTempProfile(prev => ({
      ...prev,
      avatar: blobUrl, // để hiển thị tạm
    }));
    setAvatarFile(file); // Lưu file thật để upload sau
  }
};


  const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append('id', profile.id.toString());  // Nếu bạn có id record để update
    formData.append('name', tempProfile.name);
    formData.append('job', tempProfile.job);
    formData.append('intro', tempProfile.intro);
    formData.append('quote', tempProfile.quote);
    formData.append('description', tempProfile.description);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await fetch(API_URL, {
      method: 'PUT',  
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Lỗi khi lưu dữ liệu lên server');
    }

    const result = await response.json();
    setProfile(prev => ({
      ...prev,
      ...tempProfile,
      avatar: result.avatarUrl || prev.avatar,  // avatarUrl từ server
    }));
    setIsEditing(false);
    setAvatarFile(null);
  } catch (error) {
    console.error('Lỗi lưu dữ liệu:', error);
    alert('Lưu dữ liệu thất bại. Vui lòng thử lại.');
  }
};


  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }


  return (
    <>
      <style>{`
        /* Các style bạn có thể giữ nguyên hoặc chỉnh sửa tùy ý */
        .outer-container {
          display: flex;
          justify-content: center;
          padding: 20px;
          // min-height: 100vh;
        }
        .inner-container {
          max-width: 600px;
          text-align: left;
          font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          color: #333;
          font-size: 14px
        }
        .profile-header {
          text-align: center;
          margin-bottom: 30px;
          align-items: center;
          display: flex;
          flex-direction: column;
        }
        .section-title {
         font-family: "Lora", serif;
          font-weight: 700;
          font-size: 14pxem;
          margin-bottom: 5px;
        }
        .section-subtitle {
          font-size: 1rem;
          color: #666;
          margin-bottom: 15px;
        }
        .divider {
          border: 0;
          border-top: 1px dashed #ccc;
          margin: 15px 0;
        }
        .avatar-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        .avatar {
          width: 200px;
          height: 200px;
          background-color: #f5a623;
          border-radius: 50%;
          overflow: hidden;
        }
        .title {
          font-family: "Lora", serif;
          font-weight: 700;
          font-size: 2.5em;
          margin-bottom: 10px;
          color: #6f6f6f;
        }
        .subtitle {
          font-size: 14px;
          font-weight: 400;
          color: #555;
          margin-bottom: 20px;
        }
        .description {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .social-links {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 22px;
        }
        .separator {
          margin: 0 8px;
          color: #ccc;
          font-weight: 600;
          user-select: none;
          font-size: 14pxem;
          vertical-align: middle;
        }
        .resume-button {
          padding: 8px 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: transparent;
          color: #333;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .resume-button:hover {
          background-color: #f0f0f0;
        }
        .social-link {
          margin: 0 10px;
          font-size: 14pxem;
          text-decoration: none;
          color: #555;
          transition: color 0.3s ease;
        }
        .social-link:hover {
          color: #000;
        }
        .quote {
          font-style: italic;
          color: #666;
          border-left: 3px solid #ccc;
          padding-left: 15px;
          margin: 20px 0;
          font-size: 14px;
          line-height: 1.6;
          margin-left: 60px;
        }
        .detailed-description {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .footer-text {
          font-size: 0.8rem;
          color: #999;
          margin-top: 30px;
        }
        .edit-button-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
        }
        .edit-button {
          background-color: #007bff;
          color: white;
          border: none;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        .edit-button:hover {
          background-color: #0056b3;
        }
        /* Modal overlay + content */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .modal-content {
          background-color: white;
          color: #333;
          padding: 30px 30px 20px;
          border-radius: 12px;
          width: 500px;
          max-height: 70vh;
          overflow-y: auto;
          margin-bottom: 50px;
          position: relative;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #666;
        }
        .modal-content h2 {
          font-size: 22px;
          margin-bottom: 20px;
        }
        .modal-content hr {
          border: 0;
          border-top: 1px dashed #ccc;
          margin: 20px 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .form-group input[type="text"],
        .form-group textarea {
          width: 100%;
          padding: 8px 10px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 5px;
          resize: vertical;
          font-family: inherit;
          box-sizing: border-box;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .btn-cancel {
          background-color: #ddd;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          color: #333;
          transition: background-color 0.3s ease;
        }
        .btn-cancel:hover {
          background-color: #ccc;
        }
        .btn-save {
          background-color: #007bff;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          color: white;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        .btn-save:hover {
          background-color: #0056b3;
        }
      `}</style>

      <div className="outer-container">
        <div className="inner-container">
          <div className="edit-button-container">
            <button onClick={openEditModal} className="resume-button edit-button">
              Sửa trang cá nhân
            </button>
          </div>
          <h1 className="section-title">Giới thiệu</h1>
          <p className="section-subtitle">Một chút điều thú vị về tớ và những điều tớ làm.</p>
          <hr className="divider" />
          <div className="profile-header">
            <div className="avatar-container">
              <div className="avatar">
                <img
                  src={`${baseURL}${tempProfile.avatar}`}
                  alt="Avatar"
                  style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
            </div>
            <h1 className="title">{profile.name}</h1>
            <p className="subtitle">{profile.job}</p>
            <div className="social-links">
              <button className="resume-button">Resume</button>
              <span className="separator">|</span>
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://github.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://behance.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-behance"></i>
              </a>
            </div>
          </div>

          <p className="description">{profile.intro}</p>
          <blockquote className="quote">{profile.quote}</blockquote>
          <p className="detailed-description">{profile.description}</p>
         <Footer />
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {isEditing && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeEditModal}>
              &times;
            </button>
            <h2>Chỉnh sửa trang cá nhân</h2>

            {/* Avatar hiện tại */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <img
                src={`${baseURL}${tempProfile.avatar}`}
                alt="Avatar Preview"
                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginRight: 15, border: '2px solid #ccc' }}
              />
              <label
                htmlFor="avatarUpload"
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: 5,
                  fontWeight: '600',
                  userSelect: 'none',
                }}
              >
                Chọn ảnh mới
              </label>
              <input type="file" id="avatarUpload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            {/* Các input khác */}
            <div className="form-group">
              <label htmlFor="name">Tên</label>
              <input id="name" type="text" value={tempProfile.name} onChange={e => handleChange('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="job">Công việc</label>
              <input id="job" type="text" value={tempProfile.job} onChange={e => handleChange('job', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="intro">Giới thiệu ngắn</label>
              <textarea id="intro" rows={3} value={tempProfile.intro} onChange={e => handleChange('intro', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="quote">Câu nói yêu thích</label>
              <input id="quote" type="text" value={tempProfile.quote} onChange={e => handleChange('quote', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả chi tiết</label>
              <textarea id="description" rows={5} value={tempProfile.description} onChange={e => handleChange('description', e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeEditModal}>
                Hủy
              </button>
              <button className="btn-save" onClick={handleSave}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default About;