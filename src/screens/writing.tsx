import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import URL_LINK from '../services/API.ts'
import { fetchWithNgrokWarning } from '../services/fetchWithNgrok.ts';
const slugify = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

interface Post {
  title: string;
  source: string;
  date: string;
  image_path: string; // URL ảnh đầy đủ
  description: string;
}
const truncateHTML = (html: string, maxLength: number) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  const truncated = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  return `<p>${truncated}</p>`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // định dạng dd/mm/yyyy
};

const BlogScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetchWithNgrokWarning(`${URL_LINK.blogger}`);
      if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Đang tải bài viết...</p>;

  return (
    <>
    <style>{`
       input::placeholder {
      font-weight: 700;
      color: #999;
    }
      @media (max-width: 600px) {
      h1 {
        font-size: 28px !important;
      }

      h3 {
        font-size: 16px !important;
      }

      p {
        font-size: 14px !important;
      }

      input[type="text"] {
        font-size: 15px !important;
        padding: 10px !important;
      }

      img {
        height: 160px !important;
      }

      .post-card {
        padding: 12px !important;
      }
    }
    `}</style>
    <div style={styles.container}>
          <div>
            <h1 style={styles.heading}>Viết linh tinh</h1>
            <p style={styles.subheading}>
              Những cảm xúc không thể bao biện, hoặc chỉ đơn giản là viết.
            </p>
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
        {filteredPosts.map((post, index) => (
          <Link
            key={index}
            to={`/blogs/${slugify(post.title)}`}
            state={{ post }}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={styles.postCard}>
              <img
                src={`${URL_LINK.local}${post.image_path}`}
                alt={post.title}
                style={styles.postImage}
              />
              <div style={{width: '100%', height: '1px', background: 'rgba(0, 0, 0, 0.07)', margin:'1rem 0px'}} />
              <div style={styles.postInfo}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    <strong>{post.title} </strong>
                    <span style={styles.sourceText}>{post.source}</span>
                  </div>
                  <div style={{ flexGrow: 1, borderTop: '1px solid #ccc', margin: '0 10px' }} />
                  <div style={{whiteSpace: 'normal', color: '#6f6f6f', fontSize: 14 }}>
                    <strong>Ngày đăng:</strong> {formatDate(post.date)}
                  </div>
                </div>
                <div style={styles.description}  dangerouslySetInnerHTML={{
                              __html: truncateHTML(post.description, 300)
                            }}>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <strong style={{color: '#6f6f6f'}}>Author: </strong>
                  <p style={{ margin: '0 5px' }}>@chin.hm</p>
                  <div style={{ flexGrow: 1, borderTop: '1px solid #ccc' }} />
                </div>
              </div>
            </div>
          </Link>

        ))}
      </div>
    </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: 20,
    fontFamily: 'sans-serif',
    color: '#222',
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  subheading: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
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
  },
  searchInput: {
    width: '96%',
    padding: '12px',
    borderRadius: 10,
    border: '1px solid #eee',
    backgroundColor: '#f9f9f9',
    fontSize: 17,
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
    marginBottom: 12,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  postInfo: {
    fontSize: 15,
    color: '#333',
  },
  sourceText: {
    fontWeight: 400,
    color: '#999',
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
};

export default BlogScreen;
