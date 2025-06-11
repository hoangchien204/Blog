import React, { useEffect, useState } from 'react';
import URL from "../services/API.ts"

const languageColors: { [lang: string]: string } = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89e051',
  default: '#999999',
};

interface Project {
  id?: number;
  name: string;
  owner: string;
  githubLink: string;
  title: string;
  description: string;
  languages?: string[];
  updated?: string;
}

const ProjectsAD: React.FC = () => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    link: '',
    description: '',
  });

  // Lấy danh sách project từ backend khi component mount
 useEffect(() => {
  const fetchProjectsFromDB = async () => {
    try {
      const res = await fetch(URL.projects);
      if (!res.ok) throw new Error('Không tải được danh sách dự án');
      const rawData: any[] = await res.json();

      // Chuyển snake_case → camelCase
      const data: Project[] = rawData.map((p) => ({
        id: p.id,
        name: p.name,
        owner: p.owner,
        title: p.title,
        description: p.description,
        githubLink: p.github_link, // ánh xạ đúng
      }));
      // Nếu bạn muốn lấy thêm languages và updated từ GitHub API riêng (tối ưu caching)
      // Ở đây mình minh họa gọi API cho từng project để lấy languages và updated
      const projectsWithExtras = await Promise.all(
        data.map(async (project) => {
          try {
            const resGitHub = await fetch(`https://api.github.com/repos/${project.owner}/${project.name}/languages`);
            const languagesData = await resGitHub.json();
            const languages = Object.keys(languagesData);

            // Lấy thông tin repo để lấy updated
            const resRepo = await fetch(`https://api.github.com/repos/${project.owner}/${project.name}`);
            const repoData = await resRepo.json();
            const updated = repoData.updated_at;

            return { ...project, languages, updated };
          } catch {
            return project; // Nếu lỗi API GitHub thì giữ nguyên project ban đầu
          }
        })
      );

      setProjectList(projectsWithExtras);
    } catch (err) {
      alert('❌ Lỗi tải dự án: ' + (err as Error).message);
    }
  };

  fetchProjectsFromDB();
}, []);

  const handleAddProject = async () => {
    // Kiểm tra link hợp lệ
    const match = newProject.link.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return alert('❌ Link không hợp lệ. Hãy nhập dạng https://github.com/owner/repo');

    const owner = match[1];
    const name = match[2];

    if (!newProject.description.trim()) {
      return alert('❌ Vui lòng nhập mô tả dự án');
    }

    try {
      // Lấy data repo từ GitHub API
      const resRepo = await fetch(`https://api.github.com/repos/${owner}/${name}`);
      const dataRepo = await resRepo.json();

      if (!dataRepo.updated_at) throw new Error('Không tìm thấy repo');

      // Tạo object dự án đầy đủ để thêm vào DB
      const fullProject: Project = {
        name,
        owner,
        title: dataRepo.name || name,
        description: newProject.description.trim(),
        githubLink: dataRepo.html_url,

      };

      // Gửi dữ liệu tới backend lưu vào SQL Server
      const res = await fetch(URL.projects, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullProject),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Lỗi khi thêm dự án lên server');
      }

      // Thêm vào danh sách local để hiển thị
      setProjectList([fullProject, ...projectList]);
      setNewProject({ link: '', description: '' });
      setShowAddForm(false);
      alert('✅ Thêm dự án thành công');
    } catch (err) {
      alert(`❌ Không thể thêm dự án. Lỗi: ${(err as Error).message}`);
    }
  };

  const handleDeleteProject = async (id?: number, name?: string) => {
  if (!id) return alert('❌ Dự án không có ID hợp lệ');

  if (!window.confirm(`Bạn có chắc muốn xóa dự án "${name}"?`)) return;

  try {
    const res = await fetch(`${URL.projects}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Xóa dự án thất bại');
    setProjectList(projectList.filter((p) => p.id !== id));
    alert('✅ Xóa dự án thành công');
  } catch (err) {
    alert(`❌ Lỗi khi xóa dự án: ${(err as Error).message}`);
  }
};

  const filteredProjects = projectList.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <>
      <style>{`
        .outer-container {
          display: flex;
          justify-content: center;
          padding: 30px;
          // min-height: 100vh;
        }

        .inner-container {
          max-width: 720px;
          width: 100%;
          font-family: "Roboto", sans-serif;
          color: #333;
          text-align: left;
        }

        .section-title {
          font-family: "Lora", serif;
          font-weight: 700;
          font-size: 14pxem;
          margin-bottom: 5px;
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

        .search-section {
          margin-bottom: 10px;
        }

        .search-input {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          background: rgb(249, 249, 249);
          height: 50px;
          box-sizing: border-box;
        }

        .projects-separator {
          border: 0;
          border-top: 1px solid #ccc;
          margin: 20px 0;
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .project-wrapper {
          border-radius: 10px;
          overflow: hidden;
        }

        .project-card {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .project-card:hover {
          background-color: rgb(249,249,249);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .project-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .project-description {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 12px;
          color: #444;
        }

        .project-meta {
          display: flex;
          gap: 10px;
          font-size: 0.95rem;
          color: #666;
          flex-wrap: wrap;
          align-items: center;
        }

        .language-label {
          padding: 2px 8px;
          border-radius: 12px;
          border: 1.5px solid;
          background-color: transparent;
          font-weight: 600;
          font-size: 0.85rem;
          user-select: none;
        }

        .updated {
          color: #999;
          font-style: italic;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #e74c3c;
          cursor: pointer;
          font-size: 1rem;
          margin-left: auto;
        }
          .modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-box h3 {
  margin-top: 0;
}

.modal-box input {
  width: 100%;
  margin: 8px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}

.modal-box button {
  margin-top: 10px;
}

      `}</style>

      <div className="outer-container">
        <div className="inner-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <h1 className="section-title" style={{ margin: 0 }}>Dự án</h1>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          padding: '10px 15px',
          borderRadius: '6px',
          backgroundColor: '#6f6f6f6',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {showAddForm ? 'Đóng' : '+ Thêm Dự Án'}
      </button>
    </div>
    <p className="section-subtitle">Những dự án lập trình cá nhân/pet projects của tôi trên GitHub.</p>
          <hr className="divider" />

          <div className="search-section">
            <p>Tìm kiếm repository Github</p>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {showAddForm && (
  <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <h3>Thêm Dự Án Mới</h3>
      <input
        type="text"
        placeholder="Dán link GitHub (VD: https://github.com/owner/repo)"
        value={newProject.link}
        onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
      />
      <input
        type="text"
        placeholder="Mô tả dự án (description)"
        value={newProject.description}
        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setShowAddForm(false)}
        >
          ❌ Hủy
        </button>
        <button
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={handleAddProject}
        >
          ✅ Xác nhận thêm
        </button>
      </div>
    </div>
  </div>
)}
          </div>

          <hr className="projects-separator" />

          <div className="projects-list">
            {filteredProjects.length > 0 ? (
  filteredProjects.map((project) => (
    <div className="project-wrapper" key={project.id ?? project.name}>
      <div
        className="project-card"
        onClick={() => {
          if (project.githubLink) {
            window.open(project.githubLink, '_blank');
          } else {
            alert('Dự án chưa có link GitHub');
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <h2 className="project-title">{project.title || project.name}</h2>
        <p className="project-description">{project.description}</p>
        <div className="project-meta">
          {(project.languages ?? []).map((lang: string) => {
            const color = languageColors[lang] || languageColors.default;
            return (
              <span
                key={lang}
                className="language-label"
                style={{ color, borderColor: color }}
                title={lang}
              >
                {lang}
              </span>
            );
          })}
          <span className="updated">
            Cập nhật: {project.updated ? project.updated.slice(0, 10) : 'Chưa cập nhật'}
          </span>

          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProject(project.id, project.name);
            }}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  ))
) : (
  <p>Không tìm thấy dự án phù hợp.</p>
)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsAD;
