import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithNgrokWarning } from '../services/fetchWithNgrok.ts';
import URL_LINK from '../services/API.ts'

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

interface PhotoAlbum {
  id: number;
  title: string;
  photos: string[];
  description: string;
  location: string;
  date: string;
}

const PhotoScreen: React.FC = () => {
 const [albums, setAlbums] = useState<PhotoAlbum[]>([]);

  

 const fetchAlbums = async () => {
  try {
    const res = await fetchWithNgrokWarning(`${URL_LINK.photo}`);
    if (!res.ok) throw new Error('Lỗi khi fetch albums');
    const data = await res.json();

    const albumsData: PhotoAlbum[] = data.albums.map((album: any) => ({
      id: album.id,
      title: album.title,
      photos: album.photos.map((p: any) => `${URL_LINK.local}${p.src}`),
      description: album.description,
      location: album.location,
      date: new Date(album.date).toLocaleDateString('vi-VN'),
    }));

    setAlbums(albumsData);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
    fetchAlbums();
  }, []);


  return (
    <>
    <div className="outer-container">
      <div className="inner-container">
        <h1 className="section-title">Ảnh chụp</h1>
        <p className="section-subtitle">Những bức ảnh tự chụp qua ống kính nhiếp ảnh, hoặc là đời sống thường ngày.</p>
        <hr className="divider" />
        <div className="photo-grid">
        {albums.map(album => (
          <Link
            to={`/photos/${slugify(album.title)}`}
             state={{ post: album }} 
            className="photo-item"
            key={album.id}
          >
            <img
              src={album.photos.length > 0 ? album.photos[0] : '/default-image.png'}
              alt={album.description}
              className="photo-image"
            />
          </Link>
        ))}
      </div>

      </div>
    </div>
  
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
          font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          color: #333;
        }

        .section-title {
          font-weight: 700;
          margin-bottom: 10px;
          color: #222;
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
      `}</style>
    </>
  );
};

export default PhotoScreen;
