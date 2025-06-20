import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SocialShare from '../components/SocialShare.tsx';
import API_URL from '../services/API.ts';
import { fetchWithNgrokWarning } from '../services/fetchWithNgrok.ts';
const isDarkMode = document.body.classList.contains('dark-mode');

function slugify(text: string) {
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

interface Photo {
  id: number;
  src: string;
  alt: string;
}

interface Album {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  photos?: Photo[];
}

const PhotoItem: React.FC = () => {
  const navigate = useNavigate();
  const rawSlug = useParams().slug || '';
  const slug = rawSlug.split('?')[0];

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithNgrokWarning(API_URL.photo)
      .then((res) => res.json())
      .then((data: { albums: Album[] }) => {
        const found = data.albums.find((a) => slugify(a.title) === slug);
        if (found) {
          setAlbum(found);
          setPhotos(found.photos || []);
        } else {
          setAlbum(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setAlbum(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr?: string, locationName?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const loc = locationName || 'Hà Nội';

    return `${loc}, ngày ${day} tháng ${month} năm ${year}.`;
  };

  if (loading) return <div style={styles.error}>Đang tải bài viết...</div>;

  if (!album) return <div style={styles.error}>Không tìm thấy bài viết.</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{album.title}</h1>
      <p style={styles.date}>{formatDate(album.date, album.location)}</p>

      <SocialShare
        shareUrl={`https://blog-52bs.onrender.com/photos/${slug}`}
        shareTitle={album.title}
      />

      <hr style={{ ...styles.divider, width: '30%' }} />

      <p style={styles.description}>
        <strong>Description:</strong> {album.description}
      </p>

      <hr style={styles.divider} />

      {photos.length > 0 && (
        <div style={styles.photoColumn}>
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.alt || album.title}
              style={styles.photoLarge}
            />
          ))}
        </div>
      )}

      <hr style={styles.divider} />

      <footer>
        <p style={styles.footerText}>Ảnh chụp qua lăng kính của tớ</p>
        <p style={styles.footerCredit}>
          <strong>Hoàng Chiến</strong><br />
          © 2025 Hoàng Chiến. All rights reserved!
        </p>
        <button style={styles.backButton} onClick={() => navigate('/photo')}>
          ← Quay lại
        </button>
      </footer>
    </div>
  );
};


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 688,
    margin: '0 auto',
    padding: 24,
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#222',
    backgroundColor: '#fff',
    paddingTop: 80,
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 38px)', // Responsive title
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  date: {
    color: '#555',
    fontSize: 'clamp(14px, 3vw, 16px)',
    marginBottom: 16,
  },
  photoColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  photoLarge: {
    width: '100%',
    maxWidth: 688,
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    borderRadius: 12,
    boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  description: {
    fontSize: 'clamp(15px, 2.5vw, 17px)',
    lineHeight: 1.6,
    marginTop: 0,
  },
  divider: {
    borderTop: '1px dotted #aaa',
    margin: '20px 0',
  },
  error: {
    textAlign: 'center',
    padding: 40,
    fontSize: 18,
    color: 'red',
  },
  footerText: {
    fontWeight: 300,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    fontSize: 'clamp(14px, 3vw, 16px)',
    lineHeight: 1.5,
  },

  backButton: {
    fontSize: 'clamp(14px, 3vw, 16px)',
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

export default PhotoItem;
