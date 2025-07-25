import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const styles = {
  mainContainer: {
    // minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between',
  },
  outerContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  innerContainer: {
    maxWidth: '600px',
    textAlign: 'left' as 'left',
    fontFamily: `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
    color: '#6f6f6f',
  },
  title: {

    fontWeight: 700,
    marginBottom: '10px',
    color: '#222',
  },
  subtitle: {
    fontSize: '1.1rem',
    fontWeight: 400,
    color: '#555',
    marginBottom: '20px',
  },
  description: {
    fontSize: '1rem',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  socialLinks: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  resumeButton: {
    padding: '8px 20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: 'transparent',
    color: '#333',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  resumeButtonHover: {
    backgroundColor: '#f0f0f0',
  },
  socialLink: {
    margin: '0 10px',
    fontSize: '1.2rem',
    textDecoration: 'none',
    color: '#555',
    transition: 'color 0.3s ease',
    marginLeft: 12,
    
  },
  socialLinkHover: {
    color: '#000',
  },
  contactText: {
    fontSize: '1rem',
    marginBottom: '20px',
  },
  footerText: {
    fontSize: '0.8rem',
    color: '#999',
    marginTop: 3,
  },
  tabBar: {
    position: 'fixed' as 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px 1px',
    background: '#f5f5f5',
    borderRadius: '16px 16px 0 0',
    gap: '8px',
    maxWidth: '840px',
    margin: '0 auto 30px',
    overflow: 'visible',
    whiteSpace: 'nowrap' as 'nowrap',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'max-width 0.3s ease, padding 0.3s ease',
    zIndex: 1000,
  },
  tabBarExpanded: {
    maxWidth: '900px',
    paddingLeft: '1px',
    paddingRight: '1px',
  },
  tabButton: {
    position: 'relative' as 'relative',
    background: '#e0e0e0',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s ease',
    overflow: 'visible',
    whiteSpace: 'nowrap' as 'nowrap',
    fontSize: '18px',
  },
  tabButtonHover: {
    background: '#ccc',
    transform: 'scale(1.3)',
    marginLeft: '8px',
    marginRight: '8px',
    zIndex: 5,
  },
  tabButtonIcon: {
    color: '#333',
    pointerEvents: 'none',
    width: '22px',
    height: '22px',
  },
  tooltip: {
    position: 'absolute' as 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%) translateY(10px)',
    background: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    whiteSpace: 'nowrap' as 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    userSelect: 'none' as 'none',
    zIndex: 10,
  },
  tooltipVisible: {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
  },
  separator: {
    marginLeft: '4px',
    marginRight: '4px',
    color: '#999',
    fontWeight: 'bold',
    userSelect: 'none' as 'none',
    pointerEvents: 'none',
    alignSelf: 'center',
    fontSize: '24px',
    lineHeight: 1,
    transition: 'margin 0.3s ease',
     margin: '0 8px',
 
  },
  separatorHover: {
    marginLeft: '12px',
    marginRight: '12px',
  },
  divider: {
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  margin: '20px 0',
  width: '120px', // hoặc '40%' nếu bạn muốn vừa phải
},

};


const HomeScreen: React.FC = () => {
  return (
    <>
   
  <div style={styles.mainContainer}>
    <div style={styles.outerContainer}>
      <div style={styles.innerContainer}>
        <h1 style={styles.title}>Hoàng Chiến</h1>
        <p style={styles.subtitle}>Software Engineer</p>
        <div style={{ ...styles.divider, width: '160px' }} />
        <p style={styles.description}>
          Xin chào, tớ là Hoàng Chiến (hm.chin), sinh viên chuyên ngành Kỹ thuật phần mềm tại Đại học Điện lực.
          Tớ đang học để trở thành Fullstack Developer và có thể thực hiện nhiều niềm đam mê khác.
        </p>
        {/* Đường phân cách */}
        <div style={styles.divider} />

        {/* Nút Resume và Social icons */}
        <div style={styles.socialLinks}>
          <button
            style={styles.resumeButton}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Resume
          </button>
          <span style={styles.separator}>|</span>
          <a href="https://www.facebook.com/hoangchien204"
            style={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            <i className="fab fa-facebook-f" />
          </a>
          <a href="https://github.com/hoangchien204" style={styles.socialLink} target="_blank" rel="noopener noreferrer"
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            <i className="fab fa-github" />
          </a>
          <a href="https://www.instagram.com/hoangchien223/" style={styles.socialLink} target="_blank" rel="noopener noreferrer" 
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            <i className="fab fa-instagram" />
          </a>
        </div>

        {/* <p style={styles.contactText}>Đừng ngần ngại liên hệ để trò chuyện!</p> */}

        <div style={{ ...styles.divider, width: '80px' }} />
        <footer style={{boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
        <i style={{fontSize: 14}}>Dùng máy tính để có trải nghiệm tốt nhất.</i><br />
        <strong>Hoàng Chiến</strong>
        <p style={styles.footerText}> © 2025 hoangchien. All rights reserved!</p>
        </footer>
      </div>
    </div>
  </div>
  </>
);

};
export default HomeScreen;
