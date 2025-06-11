import React from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  footerText: {
  fontSize: '0.8rem',
  marginTop: 3,
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  color: 'rgb(111, 111, 111)',
},
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <strong>Hoàng Chiến</strong>
      <p style={styles.footerText}>© 2025 hoangchien. All rights reserved!</p>
    </footer>
  );
};

export default Footer;
