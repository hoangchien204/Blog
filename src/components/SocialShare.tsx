import React, { useState } from 'react';
import { FaFacebook, FaLink } from 'react-icons/fa';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface Props {
  shareUrl: string;
  shareTitle?: string;
}

const SocialShare: React.FC<Props> = ({ shareUrl, shareTitle }) => {
  const [showToast, setShowToast] = useState(false);

  const shareOnFacebook = () => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(
      facebookShareUrl,
      'fbShareWindow',
      'height=450,width=550,top=100,left=100,toolbar=0,location=0,menubar=0,scrollbars=0'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl); // ✅ sửa ở đây
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideDownThenRightFadeOut {
            0% {
              opacity: 0;
              transform: translate(-50%, -50px);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
            100% {
              opacity: 0;
              transform: translate(calc(-50% + 300px), 0);
            }
          }

          .custom-toast {
            position: fixed;
            top: 20px;
            left: 50%;
            width: 288px;
            height: 56px;
            transform: translateX(-50%);
            background-color: black;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 9999;
            animation: slideDownThenRightFadeOut 3s ease forwards;
          }
        `}
      </style>

      <div style={styles.socialIcons}>
        <button onClick={shareOnFacebook} style={styles.iconButton} aria-label="Chia sẻ Facebook">
          <i className="fab fa-facebook-f" style={{ fontSize: 20 }}></i>
        </button>
        <button onClick={copyLink} style={styles.iconButton} aria-label="Copy link">
          <i className="fas fa-link" style={{ fontSize: 20, color: '#333' }}></i>
        </button>

        {showToast && (
          <div style={styles.toast} className="custom-toast">
            Đã copy link vào clipboard!
          </div>
        )}
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  socialIcons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  iconButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  toast: {}, // Toast dùng className nên không cần định nghĩa style cụ thể ở đây
};

export default SocialShare;
