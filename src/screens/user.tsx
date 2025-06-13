import React, { useEffect, useState } from 'react';
import API from '../services/API.ts'
import { fetchWithNgrokWarning } from '../services/fetchWithNgrok.ts';

const UserScreen: React.FC = () => {

  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base URL của server backend (cập nhật theo server bạn chạy)
 
 useEffect(() => {
 
  fetchWithNgrokWarning(API.about)
    .then(res => {
      console.log('Response status:', res.status);
      console.log('Content-Type:', res.headers.get('content-type'));

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Response is not JSON. Có thể đang bị chặn bởi Ngrok hoặc cấu hình sai.');
      }

      return res.json();
    })
    .then(data => {
      console.log('API response:', data);
      setAbout(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    });
}, []);

  if (loading) return <p>Đang tải thông tin...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    
    <>
      
      <div className="outer-container">
      <div className="inner-container">
        <h1 className="section-title">Giới thiệu</h1>
        <p className="section-subtitle">Một chút điều thú vị về tớ và những điều tớ làm.</p>
        <hr className="divider" />
        <div className="profile-header">
          <div className="avatar-container">
            <div className="avatar">
              <img
                src={`${API.local}${about.avatar}`} // Ghép base URL + đường dẫn avatar trong DB
                alt="Avatar"
                style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          </div>
          <h1 className="title">{about.name}</h1>
          <p className="subtitle">{about.job}</p>
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
            {/* <a href="https://behance.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-behance"></i>
            </a> */}
          </div>
        </div>

        <p className="description">{about.intro}</p>
        <blockquote className="quote">{about.quote}</blockquote>
        <p className="detailed-description">{about.description}</p>
        <strong>Hoàng Chiến</strong>
        <p className="footer-text"> © 2025 hoangchien. All rights reserved!</p>
      </div>
    </div>


<style>{`
        /* Container chính */
        .outer-container {
          display: flex;
          justify-content: center;
          padding: 20px;
          // min-height: 100vh;
        }

        /* Container nội dung */
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
        /* Tiêu đề phần */
        .section-title {
          font-family: "Lora", serif;
          font-weight: 700;
          font-size: 14pxem;
          margin-bottom: 5px;
        }

        /* Phụ đề phần */
        .section-subtitle {
          font-size: 1rem;
          color: #666;
          margin-bottom: 15px;
        }

        /* Đường phân cách */
        .divider {
          border: 0;
          border-top: 1px dashed #ccc;
          margin: 15px 0;
        }

        /* Container avatar */
        .avatar-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }

        /* Avatar (tạm thời là một vòng tròn màu cam) */
        .avatar {
          width: 200px;
          height: 200px;
          background-color: #f5a623;
          border-radius: 50%;
        }

        /* Tiêu đề tên */
        .title {
          font-family: "Lora", serif;
          font-weight: 700;
          // font-style: italic;
          font-size: 2.5em;
          margin-bottom: 10px;
          color: #6f6f6f;
        }

        /* Dòng phụ đề */
        .subtitle {
          font-size: 14px;
          font-weight: 400;
          color: #555;
          margin-bottom: 20px;
        }

        /* Đoạn mô tả */
        .description {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        /* Khu vực liên kết xã hội */
        .social-links {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 22px;
        }
        .separator {
        margin: 0 8px;           /* Khoảng cách hai bên */
        color: #ccc;             /* Màu xám nhạt */
        font-weight: 600;        /* Đậm vừa phải */
        user-select: none;       /* Không cho người dùng chọn dấu này */
        font-size: 14pxem;       /* Cỡ chữ tương tự icon */
        vertical-align: middle;  /* Căn giữa theo chiều dọc */
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

        /* Trích dẫn */
        .quote {
          font-style: italic;
          color: #666;
          border-left: 3px solid #ccc;
          padding-left: 15px;
          margin: 20px 0;
          font-size: 14px;
          line-height: 1.6;
          margin-left: 60px;
              font-family: Palatino, serif;
        }

        /* Mô tả chi tiết */
        .detailed-description {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        /* Chân trang */
        .footer-text {
           font-size: '0.8rem';
            color: '#999';
            margin-top: 3px;
                font-family: Palatino, serif;
        }
      `}</style>


    </>

  );
};

export default UserScreen;
