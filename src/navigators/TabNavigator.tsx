import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  FaHome, FaUser, FaFolderOpen, FaImages, FaPen,
  FaFacebookF, FaInstagram, FaGithub, FaPaperclip, FaCog, FaChevronUp, FaSpinner
} from 'react-icons/fa';
import HomeScreen from '../screens/homescreen.tsx';
import UserScreen from '../screens/user.tsx';
import ProjectsScreen from '../screens/projectscreen.tsx';
import PhotoScreen from '../screens/PhotoScreen.tsx';
import Writing from '../screens/writing.tsx';
import About from '../user/about.tsx';
import Home from '../user/homeAd.tsx';
import { scrollToTop } from '../components/scrollToTop.ts';
import BlogItem from '../components/Blogitem.tsx';
import PhotoItem from '../components/PhotoItem.tsx';
import Contact from '../screens/contact.tsx';

import ProjectAD from '../user/ProjectAD.tsx';
import PhotoScreenAD from '../user/photoAD.tsx';
import WritingAD from '../user/WritingAD.tsx';
import Login from '../user/AdminPage.tsx';
import NewPostPage from '../components/NewPostPage.tsx';


const NotFoundPage = () => (
  <div style={{ textAlign: 'center' }}>
    <h2>Oops!!!</h2>
    <p>Có vẻ như trang cậu tìm không có rồi</p>
    <p>Hãy quay trở lại</p>
    <strong>Error code: 404</strong>
  </div>
);

const icons = [
  { icon: <FaHome />, label: 'Home', path: '/home', hasSeparator: true, component: HomeScreen },
  { icon: <FaUser />, label: 'About', path: '/about', component: UserScreen },
  { icon: <FaFolderOpen />, label: 'Project', path: '/project', component: ProjectsScreen },
  { icon: <FaImages />, label: 'Photo', path: '/photo', component: PhotoScreen },
  { icon: <FaPen />, label: 'Writing', path: '/writing', hasSeparator: true, component: Writing },
  { icon: <FaFacebookF />, label: 'Facebook', path: 'https://www.facebook.com/hoangchien204' },
  { icon: <FaInstagram />, label: 'Instagram', path: 'https://www.instagram.com/hoangchien223/' },
  { icon: <FaGithub />, label: 'GitHub', path: 'https://github.com/hoangchien204' },
  { icon: <FaPaperclip />, label: 'Contact', path: '/contact', hasSeparator: true , component: Contact},
  { icon: <FaCog />, label: 'Theme', path: '/settings' },
  { icon: <FaChevronUp />, label: 'Chevronup', path: 'chevronup' },
];

const adminIcons = [
  { icon: <FaHome />, label: 'home', path: 'home', hasSeparator: true, component: Home },
  { icon: <FaUser />, label: 'about', path: 'about', component: About },
  { icon: <FaFolderOpen />, label: 'project', path: 'project', component: ProjectAD },
  { icon: <FaImages />, label: 'Photo', path: 'photo', component: PhotoScreenAD },
  { icon: <FaPen />, label: 'Writing', path: 'writing', hasSeparator: true, component: WritingAD },
  { icon: <FaCog />, label: 'Theme', path: '/settings' },
  { icon: <FaChevronUp />, label: 'Chevronup', path: 'chevronup' },
];

export default function TabNavigator() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!sessionStorage.getItem('admin_token'));
  const [settingsClicked, setSettingsClicked] = useState(() => {
    const saved = sessionStorage.getItem('darkMode');
    return saved ? saved === 'true' : false;
  });
  const [loadingIcon, setLoadingIcon] = useState(null);

  useEffect(() => {
    const checkToken = () => {
      const token = sessionStorage.getItem('admin_token');
      setIsAdminLoggedIn(!!token);
    };

    checkToken();
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  useEffect(() => {
    if (settingsClicked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [settingsClicked]);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    if (pathSegments.length > 2 && !pathSegments.includes('photos') && !pathSegments.includes('blogs')) {
      const cleanPath = `/${pathSegments[pathSegments.length - 1]}`;
      navigate(cleanPath, { replace: true });
    }
  }, [location, navigate]);

  const toggleDarkMode = () => {
    setSettingsClicked((prev) => !prev);
  };

  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin && !isAdminLoggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const handleMenuClick = (path: string, index: number, isSettings = false) => {
    setLoadingIcon(index);
    setTimeout(() => {
      setLoadingIcon(null);
      if (isSettings) {
        toggleDarkMode();
      } else if (path === 'chevronup') {
        scrollToTop();
      } else if (path.startsWith('http')) {
        window.open(path, '_blank');
      } else {
        navigate(path, { replace: true });
      }
    }, 500);
  };

  const userRoutes = icons
    .filter((icon) => icon.component)
    .map(({ path, component: Component }, i) => (
      <Route key={i} path={path.replace(/^\//, '')} element={<Component />} />
    ));

  return (
    <>
      <div style={{ paddingBottom: '100px' }}>
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<Navigate to="home" replace />} />
              <Route path="home" element={<Home isAdmin={true} />} />
              <Route path="about" element={<About />} />
              <Route path="project" element={<ProjectAD />} />
              <Route path="photo" element={<PhotoScreenAD />} />
              <Route path="writing" element={<WritingAD />} />
              <Route path="login" element={<Login onLoginSuccess={() => setIsAdminLoggedIn(true)} />} />
               <Route path="blogs/add" element={<NewPostPage />} />
              <Route path="*" element={<NotFoundPage />} />
              
            </>
          ) : (
            <>
              {userRoutes}
              <Route path="photos/:slug" element={<PhotoItem />} />
              <Route path="blogs/:slug" element={<BlogItem />} />
              <Route path="login" element={<Login onLoginSuccess={() => setIsAdminLoggedIn(true)} />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </>
          )}
        </Routes>
      </div>

      {!isAdmin ? (
        <div className="tab-bar">
          {icons.map(({ icon, label, path, hasSeparator }, i) => {
            if (path === 'chevronup') {
              return (
                <React.Fragment key={i}>
                  <button
                    className={`tab-button ${loadingIcon === i ? 'jump' : ''}`}
                    aria-label={label}
                    onClick={() => handleMenuClick(path, i)}
                    style={{ background: '#e0e0e0', border: 'none', cursor: 'pointer' }}
                  >
                    {loadingIcon === i ? <FaSpinner className="spin" /> : icon}
                    <span className="tooltip">{label}</span>
                  </button>
                  {hasSeparator && (
                    <span
                      style={{
                        color: '#888',
                        userSelect: 'none',
                        alignSelf: 'center',
                        fontWeight: 'bold',
                        fontSize: '20px',
                      }}
                    >
                      |
                    </span>
                  )}
                </React.Fragment>
              );
            } else if (path === '/settings') {
              return (
                <React.Fragment key={i}>
                  <button
                    className={`tab-button ${loadingIcon === i ? 'jump' : ''}`}
                    aria-label={label}
                    onClick={() => handleMenuClick(path, i, true)}
                    style={{ background: '#e0e0e0', border: 'none', cursor: 'pointer' }}
                  >
                    {loadingIcon === i ? <FaSpinner className="spin" /> : icon}
                    <span className="tooltip">{label}</span>
                  </button>
                  {hasSeparator && (
                    <span
                      style={{
                        color: '#888',
                        userSelect: 'none',
                        alignSelf: 'center',
                        fontWeight: 'bold',
                        fontSize: '20px',
                      }}
                    >
                      |
                    </span>
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={i}>
                  <NavLink
                    to={path}
                    onClick={(e) => {
                      if (path.startsWith('http')) {
                        e.preventDefault();
                        handleMenuClick(path, i);
                      } else {
                        handleMenuClick(path, i);
                      }
                    }}
                    className={({ isActive }) => `tab-button ${isActive ? 'active' : ''} ${loadingIcon === i ? 'jump' : ''}`}
                    aria-label={label}
                  >
                    {loadingIcon === i ? <FaSpinner className="spin" /> : icon}
                    <span className="tooltip">{label}</span>
                  </NavLink>
                  {hasSeparator && (
                    <span
                      style={{
                        color: '#888',
                        userSelect: 'none',
                        alignSelf: 'center',
                        fontWeight: 'bold',
                        fontSize: '20px',
                      }}
                    >
                      |
                    </span>
                  )}
                </React.Fragment>
              );
            }
          })}
        </div>
      ) : (
        <div className="tab-bar admin-tab-bar">
  {adminIcons.map(({ icon, label, path, hasSeparator }, i) => {
    const isSpecialButton = path === 'chevronup' || path === '/settings';

    return (
      <React.Fragment key={i}>
        {isSpecialButton ? (
          <button
            className={`tab-button ${loadingIcon === i ? 'jump' : ''}`}
            aria-label={label}
            onClick={() => handleMenuClick(path, i, path === '/settings')}
            style={{ background: '#e0e0e0', border: 'none', cursor: 'pointer' }}
          >
            {loadingIcon === i ? <FaSpinner className="spin" /> : icon}
            <span className="tooltip">{label}</span>
          </button>
        ) : (
          <NavLink
            to={`/admin/${path}`}
            className={({ isActive }) =>
              `tab-button ${isActive ? 'active' : ''} ${loadingIcon === i ? 'jump' : ''}`
            }
            aria-label={label}
            onClick={() => handleMenuClick(`/admin/${path}`, i)}
          >
            {loadingIcon === i ? <FaSpinner className="spin" /> : icon}
            <span className="tooltip">{label}</span>
          </NavLink>
        )}
        {hasSeparator && (
          <span
            style={{
              color: '#888',
              userSelect: 'none',
              alignSelf: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
            }}
          >
            |
          </span>
        )}
      </React.Fragment>
    );
  })}
</div>
      )}

      <style>{`
        .tab-bar {
          position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 8px;
  background: #f5f5f5;
  border-radius: 16px 16px 0 0;
  gap: 8px;
  white-space: nowrap;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, padding 0.3s ease;
  z-index: 1000;
  margin-bottom: 30px;
        }
        .tab-button {
          position: relative;
          background: #e0e0e0;
          border: none;
          padding: 10px 14px;
          border-radius: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition:
            background 0.2s ease,
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            margin 0.3s ease;
          overflow: visible;
          white-space: nowrap;
          font-size: 18px;
          text-decoration: none;
          color: inherit;
        }
        .tab-button:hover {
          background: #ccc;
          transform: scale(1.3);
          margin-left: 8px;
          margin-right: 8px;
          z-index: 5;
        }
        .tab-button.active {
          background: #a0a0a0;
        }
        .tab-button.jump {
          animation: jump 0.3s ease-in-out;
        }
        .tab-button svg {
          color: #333;
          pointer-events: none;
          width: 22px;
          height: 22px;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 13px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
          user-select: none;
          z-index: 10;
        }
        .tab-button:hover .tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        @keyframes jump {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      @media (max-width: 768px) {
  .tab-bar {
    width: calc(100% - 70px); /* Chừa 16px mỗi bên */
    padding: 8px 6px;
    gap: 6px;
    justify-content: flex-start;
    border-radius: 12px 12px 0 0;
    overflow-x: auto;
    overflow-y: hidden;
    margin-bottom: 0;
    max-width: 100vw;
    left: 50%;
    transform: translateX(-50%);
  }

  .tab-button {
    flex: 0 0 auto;
    padding: 8px 12px;
    font-size: 16px;
  }

  .tab-button:hover {
    transform: none;
    margin-left: 0;
    margin-right: 0;
    background: #d0d0d0;
  }

  .tooltip {
    display: none;
  }
}
        body.dark-mode {
          background-color: #222 !important;
          color: white !important;
        }
        body.dark-mode h1,
        body.dark-mode h2,
        body.dark-mode h3,
        body.dark-mode p,
        body.dark-mode span,
        body.dark-mode a,
        body.dark-mode div,
        body.dark-mode blockquote,
        body.dark-mode button,
        body.dark-mode li,
        body.dark-mode .nav-link,
        body.dark-mode nav a {
          color: white !important;
        }
        body.dark-mode div {
          background-color: #222 !important;
        }
      `}</style>
    </>
  );
}