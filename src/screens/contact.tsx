import React, { useState } from 'react';
import API from '../services/API.ts';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    captcha: '',
  });

  const [captchaChecked, setCaptchaChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
      alert('Vui lòng xác nhận captcha trước khi gửi!');
      return;
    }
    // Xử lý gửi form tại đây (fetch hoặc axios nếu có API)
   fetch(API.mail, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
})
  .then(res => {
    if (!res.ok) throw new Error('Lỗi gửi email');
    return res.json();
  })
  .then(data => {
    alert(data.message);
    setForm({ name: '', email: '', subject: '', message: '', captcha: '' });
    setCaptchaChecked(false);
  })
  .catch(err => {
    alert('Gửi thất bại, thử lại sau!');
    console.error(err);
  });
    setForm({ name: '', email: '', subject: '', message: '', captcha: '' });
    setCaptchaChecked(false);
  };

  return (
    <div style={styles.container}>
      <h1>Liên hệ</h1>
      <p>Mọi người liên hệ công việc với tớ qua form này nhé.</p>
      <hr style={styles.hrlight}/>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Họ và tên</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Họ và tên của bạn"
          required
          style={styles.input}
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@abc.com"
          required
          style={styles.input}
        />

        <label style={styles.label}>Tiêu đề</label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Tiêu đề"
          required
          style={styles.input}
        />

        <label style={styles.label}>Nội dung</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Nội dung của bạn..."
          required
          style={styles.textarea}
        />

        <div style={styles.captcha}>
          <input
            type="checkbox"
            id="captcha"
            checked={captchaChecked}
            onChange={() => setCaptchaChecked(!captchaChecked)}
          />
          <label htmlFor="captcha" style={{ marginLeft: 8 }}>
            Tôi không phải là người máy (captcha)
          </label>
        </div>
        <p style={styles.note}>Lưu ý: điền captcha trước khi submit nhé!</p>

        <button type="submit" style={styles.button}>Gửi cho tớ</button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: 20,
    fontFamily: 'Roboto, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    marginTop: 10,
    fontSize: 22,
  },
  input: {
    padding: 8,
    fontSize: '1rem',
    borderRadius: 7,
    border: '1px solid #ccc',
    background:'rgb(249, 249, 249)',
  },
  textarea: {
    padding: 8,
    fontSize: '1rem',
    borderRadius: 7,
    border: '1px solid #ccc',
    minHeight: 100,
    background:'rgb(249, 249, 249)',
},
  captcha: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
  },
  note: {
    fontSize: '0.8rem',
    color: '#999',
  },
  button: {
    marginTop: 10,
    padding: '13px 20px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 15,
    fontSize: 14,
    cursor: 'pointer',
  },
  hrlight:{
    width: '100%',
    marginBottom: '1rem',
    marginTop: '1rem',
    border: 'none',
    borderBottom: '2px dotted #e2e2e2',
  
  }
};

export default Contact;
