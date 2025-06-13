import React, { useEffect, useState } from 'react';
import URL from "../services/API.ts"
import { fetchWithNgrokWarning } from '../services/fetchWithNgrok.ts';


// Màu ngôn ngữ
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


const ProjectsScreen: React.FC = () => {
  const [projectList, setProjectList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjectsFromDB = async () => {
      try {
        const res = await fetchWithNgrokWarning(URL.projects);
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
        a{
            text-decoration: none;
          }
        .inner-container {
          max-width: 720px;
          width: 100%;
          font-family: "Roboto", sans-serif;
          color: #333;
          text-align: left;
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

        .search-section {
          margin-bottom: 10px;
        }

        .search-section p {
          font-size: 1rem;
          margin: 5px 0;
        }

        .search-input {
              width: 100%;
            padding: 17px;
            border-radius: 10px;
            border: 1px solid rgb(238, 238, 238);
            background-color: rgb(249, 249, 249);
            font-size: 17px;
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
          border-bottom: 1px solid;
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
        }

        .language-label {
          padding: 2px 8px;
          border-radius: 12px;
          border: 1.5px solid;
          background-color: transparent;
          font-weight: 600;
          font-size: 0.85rem;
          user-select: none;
          cursor: default;
        }
          p, a, h2,h3{
              font-family:BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue;
          }
        .updated {
          color: #999;
          margin-left: auto; /* đẩy sang phải */
          font-style: italic;
        }
          .search-input::placeholder {
          font-weight: bold;
          color: #999;
        }
      `}</style>
     
        <div className="outer-container">
        <div className="inner-container">
          <h1 className="section-title">Dự án</h1>
          <p className="section-subtitle">Những dự án lập trình cá nhân/pet projects của tớ từ GitHub.</p>
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không tìm thấy dự án phù hợp.</p>
            )}

            <a href="https://github.com/hoangchien204" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#6f6f6f' }}>
              <strong>Xem Github của tớ...</strong>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsScreen;
