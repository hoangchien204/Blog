import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import URL_LINK from '../services/API.ts';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

type Post = {
  id: number;
  title: string;
  source: string;
  date: string;
  location: string;
  image_path: string;
  description: string;
};

const truncate = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : text.slice(0, maxLength) + '...';

// Hàm tách text thuần từ HTML (description)
const stripHtml = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // định dạng dd/mm/yyyy
};

const WritingAD: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({
    title: '',
    source: '',
    location: '',
    description: '',
    image: null as File | null,
    previewImage: '',
      youtubeUrl: '',
  });

  // Load posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${URL_LINK.blogger}`);
      if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Thêm bài viết qua API
  const handleAddPost = async () => {
    if (!newPost.image) return alert('Vui lòng chọn ảnh');

    console.log('Dữ liệu chuẩn bị gửi:', newPost);
    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('source', newPost.source);
    formData.append('location', newPost.location);
    formData.append('description', newPost.description);
    formData.append('image', newPost.image);

    try {
      const response = await fetch(`${URL_LINK.blogger}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Lỗi khi thêm bài viết');
      alert('Thêm bài viết thành công');

      // Tải lại danh sách bài viết mới nhất
      await fetchPosts();

      setShowModal(false);
      setNewPost({
        title: '',
        source: '',
        location: '',
        description: '',
        image: null,
        previewImage: '',
          youtubeUrl: '',
      });
    } catch (error) {
      alert('Lỗi khi thêm bài viết');
      console.error(error);
    }
  };

  // Xóa bài viết qua API
  const handleDeletePost = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá bài viết này?')) return;

    try {
      const response = await fetch(`${URL_LINK.blogger}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Lỗi khi xoá bài viết');
      alert('Đã xoá bài viết');

      // Tải lại danh sách
      await fetchPosts();
    } catch (error) {
      alert('Lỗi khi xoá bài viết');
      console.error(error);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Viết linh tinh</h1>
            <p style={styles.subheading}>
              Những cảm xúc không thể bao biện, hoặc chỉ đơn giản là viết.
            </p>
          </div>
           <button onClick={() => navigate('/admin/blogs/add')} style={styles.addButton}>
      + Thêm
    </button>
        </div>

        <hr style={styles.divider} />

        <div style={styles.searchSection}>
          <h3 style={styles.searchTitle}>Tìm kiếm các bài viết của tớ</h3>
          <p style={styles.searchSubtitle}>
            Viết linh tinh về cuộc sống, lập trình, nghệ thuật,...
          </p>
          <div style={styles.searchBox}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Tìm kiếm post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <hr style={styles.divider} />
        <div style={styles.postList}>
          {filteredPosts.map((post) => (
            <div key={post.id} style={{ position: 'relative' }}>
              <span
                className="delete-icon"
                onClick={() => handleDeletePost(post.id)}
                title="Xóa bài viết"
              >
                &times;
              </span>

              <Link
                to={`/admin/blogs/${slugify(post.title)}`}
                state={{ post }}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={styles.postCard}>
                  <img
                    src={`http://localhost:5000${post.image_path}`}
                    alt={post.title}
                    style={styles.postImage}
                  />
                  <div style={{width: '100%', height: '1px', background: 'rgba(0, 0, 0, 0.07)', margin:'1rem 0px'}} />
                  <div style={styles.postInfo}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        <strong>{post.title}   </strong>
                        <span style={styles.sourceText}>{post.source}</span>
                      </div>
                      
                      <div style={{ flexGrow: 1, borderTop: '1px solid #ccc', margin: '0 10px' }} />
                      
                      <div style={{ whiteSpace: 'nowrap',color: '#6f6f6f' }}>
                        <strong>Ngày đăng:</strong> {formatDate(post.date)}
                      </div>
                    </div>
                    <div style={styles.description}>
                      {truncate(stripHtml(post.description), 200)}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: 738,
    margin: '0 auto',
    padding: 20,
    fontFamily: 'sans-serif',
    color: '#222',
 
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
      fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheading: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '8px 14px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
  divider: {
    margin: '20px 0',
    borderTop: '1px dotted #ccc',
  },
  searchSection: {
    marginBottom: 30,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 4,
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  searchBox: {
    maxWidth: 800,
    margin: '0 auto',
  },
  searchInput: {
    width: '97%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #eee',
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  postList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 30,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  postImage: {
    width: '100%',
    maxWidth: 680,
    height: 200,
    objectFit: 'cover',
    borderRadius: 12,
    display: 'block',
  },
  postInfo: {
    fontSize: 15,
    color: '#333',
  },
  sourceText: {

    color: '#171717',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
    marginBottom: 10,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 1.6,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  modalInput: {
    width: '100%',
    marginBottom: 12,
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 8,
    fontSize: 14,
  },
  cancelButton: {
    marginRight: 8,
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#ccc',
    color: '#fff',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#28a745',
    color: '#fff',
    cursor: 'pointer',
  },
  
};

export default WritingAD;
