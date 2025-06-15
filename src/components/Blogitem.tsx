import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SocialShare from '../components/SocialShare.tsx';
import API_URL from '../services/API.ts';

const isDarkMode = document.body.classList.contains('dark-mode');

// Chỉnh lại kích thước ảnh trong nội dung HTML
const fixImageSizeInDescription = (html: string) => {
  return html.replace(/<img\s+/g, '<img style="max-width: 100%; height: auto;" ');
};

const BlogItem: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
 const rawSlug = useParams().slug || '';
const slug = rawSlug.split('?')[0]; // loại bỏ mọi query như fbclid

  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (location.state?.post) {
      setPost(location.state.post);
    } else if (slug) {
      fetch(`${API_URL.blogger}/${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error('Không tìm thấy bài viết');
          return res.json();
        })
        .then((data) => setPost(data))
        .catch((err) => console.error('Lỗi lấy bài viết:', err));
    }
  }, [slug, location.state]);
useEffect(() => {
  console.log('Slug:', slug); // kiểm tra slug đúng chưa
}, [slug]);
  const formatDate = (dateStr: string, location: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${location}, ngày ${day} tháng ${month} năm ${year}.`;
  };
useEffect(() => {
  console.log('post.image_path:', post?.image_path); // kiểm tra URL ảnh
}, [post]);
  if (!post) {
    return <div style={styles.error}>Không tìm thấy bài viết.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{post.title}</h1>
      <p style={styles.date}>{formatDate(post.date, post.location)}</p>
      <hr style={styles.divider} />
      <p><strong style={{ color: '#6f6f6f' }}>Author:</strong> @chin.hm</p>
      <p><strong style={{ color: '#6f6f6f' }}>Description:</strong> {post.source}</p>
      <SocialShare
        shareUrl={`https://blog-52bs.onrender.com/blogs/${slug}`}
        shareTitle={post.title}
      />
      <hr style={{ ...styles.divider, width: '20%' }} />
      <img
        src={post.image_path || ''}
        alt={post.title}
        style={styles.image}
      />
      <hr style={{ ...styles.divider, width: '100%' }} />
      <div
        style={styles.text}
        dangerouslySetInnerHTML={{ __html: fixImageSizeInDescription(post.description) }}
      />

      <hr style={{ ...styles.divider, width: '25%' }} />
      <i style={styles.footerNote}>Viết linh tinh bởi tớ</i>
      <strong style={{ color: '#6f6f6f' }}>Hoàng Chiến</strong>
      <p style={{ margin: '0' }}>© 2025 Hoàng Chiến. All rights reserved!</p>

      <button style={styles.backButton} onClick={() => navigate('/writing')}>
        ← Quay lại
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 760,
    margin: '0 auto',
    padding: 24,
    fontFamily: 'Palatino,serif',
    color: '#222',
    backgroundColor: '#fff',
    paddingTop: 80,
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 38px)', // responsive font
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    color: '#555',
    fontSize: 'clamp(14px, 4vw, 16px)',
    marginBottom: 12,
  },
  divider: {
    borderTop: '1px dotted #aaa',
    margin: '20px 0',
  },
  image: {
    width: '100%',
    height: '308px',
    objectFit: 'cover',
    borderRadius: 12,
    display: 'block',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    margin: '16px 0',
  },
  text: {
    fontSize: 'clamp(15px, 4vw, 17px)',
    lineHeight: 1.75,
    marginTop: 12,
    whiteSpace: 'pre-wrap',
  },
  error: {
    textAlign: 'center',
    padding: 40,
    fontSize: 18,
    color: 'red',
  },
  footerNote: {
    display: 'block',
    textAlign: 'start',
    margin: '10px 0',
    fontStyle: 'italic',
  },
  backButton: {
    fontSize: 16,
    cursor: 'pointer',
    borderRadius: 8,
    border: 'none',
    backgroundColor: isDarkMode ? '#222' : 'transparent',
    color: isDarkMode ? '#FFFFFF' : '#333333',
    fontStyle: 'italic',
    fontWeight: 300,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: 'background-color 0.2s',
  
  },
};

export default BlogItem;
