import CustomCursor from '@/components/portfolio/CustomCursor'
import PortfolioNavbar from '@/components/portfolio/PortfolioNavbar'
import RevealObserver from '@/components/portfolio/RevealObserver'

// ---- data ----

const skills = [
  { num: '01', icon: '📷', name: '摄影', desc: '用镜头捕捉瞬间的诗意，人像、风景、商业摄影，每一帧都是艺术表达。', color: '#ff3c5a' },
  { num: '02', icon: '🎬', name: '电影制作', desc: '从剧本到成片，掌握视听语言，打造有温度、有力量的影像叙事。', color: '#ff8c42' },
  { num: '03', icon: '🎨', name: '绘画创作', desc: '数字绘画与传统媒介融合，构建独特的视觉风格与艺术语言。', color: '#7b5ea7' },
  { num: '04', icon: '✂️', name: '视频剪辑', desc: '节奏感、情绪流动、音效配合——剪辑是二次创作，也是灵魂注入。', color: '#4ade80' },
  { num: '05', icon: '🌐', name: '3D 建模与动画', desc: '3ds Max 建模、材质、渲染，将想象中的空间带入现实。', color: '#38bdf8' },
  { num: '06', icon: '🎮', name: 'Unreal Engine 5', desc: '实时渲染、虚拟制片，用游戏引擎拓展创作边界。', color: '#f43f5e' },
  { num: '07', icon: '✦', name: '平面设计', desc: '品牌视觉、排版设计、海报创作，让每一个像素都有意义。', color: '#fb923c' },
]

const tools = [
  { name: 'Adobe Photoshop', color: '#ff3c5a' },
  { name: 'Adobe Illustrator', color: '#ff8c42' },
  { name: 'Adobe Premiere Pro', color: '#7b5ea7' },
  { name: 'Adobe After Effects', color: '#4ade80' },
  { name: 'Adobe Lightroom', color: '#38bdf8' },
  { name: 'Adobe InDesign', color: '#ff3c5a' },
  { name: 'Adobe Audition', color: '#ff8c42' },
  { name: 'DaVinci Resolve', color: '#7b5ea7' },
  { name: '3ds Max', color: '#4ade80' },
  { name: 'Unreal Engine 5', color: '#38bdf8' },
  { name: '剪映', color: '#ff3c5a' },
]

const works = [
  { cat: 'Film', title: '沉默之间', year: '2024', icon: '🎬', bg: 'linear-gradient(135deg, #1a0a0a 0%, #3d1a1a 100%)' },
  { cat: 'Photography', title: 'Forest Series', year: '2024', icon: '🌿', bg: 'linear-gradient(135deg, #0a1a0a 0%, #1a3d1a 100%)' },
  { cat: 'Illustration', title: 'Dino World', year: '2023', icon: '🎨', bg: 'linear-gradient(135deg, #1a0a1a 0%, #3d1a3d 100%)' },
  { cat: '3D / UE5', title: 'Virtual City', year: '2024', icon: '🌐', bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3d 100%)' },
  { cat: 'Graphic Design', title: 'Brand Identity', year: '2023', icon: '✦', bg: 'linear-gradient(135deg, #1a1a0a 0%, #3d3d1a 100%)' },
]

// ---- page ----

export default function PortfolioPage() {
  return (
    <div className="p-root">
      <CustomCursor />
      <RevealObserver />
      <PortfolioNavbar />

      {/* HERO */}
      <section className="p-hero" id="home">
        <div className="p-hero-bg" />
        <div className="p-hero-grid" />
        <div className="p-dino-float">🦕</div>
        <p className="p-hero-tag">Multimedia Artist · 多媒体艺术家</p>
        <h1 className="p-hero-title">
          <span className="heart">heart</span><br />
          <span className="dino">DINO</span>
        </h1>
        <p className="p-hero-sub">
          摄影 · 电影 · 绘画 · 剪辑 · 3D · Unreal Engine · 平面设计<br />
          用视觉语言讲述每一个故事。
        </p>
        <div className="p-hero-scroll">SCROLL DOWN</div>
      </section>

      {/* SKILLS */}
      <section className="p-section p-skills-section" id="skills">
        <p className="p-section-label p-reveal">专业领域</p>
        <h2 className="p-section-title p-reveal">创作<br />能力</h2>
        <div className="p-skills-grid">
          {skills.map((s) => (
            <div
              key={s.num}
              className="p-skill-card p-reveal"
              style={{ '--card-color': s.color } as React.CSSProperties}
            >
              <span className="p-skill-num">{s.num}</span>
              <span className="p-skill-icon">{s.icon}</span>
              <div className="p-skill-name">{s.name}</div>
              <div className="p-skill-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKS */}
      <section className="p-section" id="works">
        <p className="p-section-label p-reveal">精选作品</p>
        <h2 className="p-section-title p-reveal">作品<br />集</h2>
        <div className="p-works-grid">
          {works.map((w) => (
            <div
              key={w.title}
              className="p-work-card p-reveal"
              style={{ '--work-bg': w.bg } as React.CSSProperties}
            >
              <div className="p-work-bg" />
              <div className="p-work-visual">{w.icon}</div>
              <div className="p-work-info">
                <div className="p-work-cat">{w.cat}</div>
                <div className="p-work-title">{w.title}</div>
                <div className="p-work-year">{w.year}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section className="p-section" id="tools">
        <p className="p-section-label p-reveal">工具箱</p>
        <h2 className="p-section-title p-reveal">常用<br />软件</h2>
        <div className="p-tools-marquee-wrap">
          <div className="p-tools-marquee">
            {/* Duplicated for seamless loop */}
            {[...tools, ...tools].map((t, i) => (
              <div key={i} className="p-tool-item">
                <span className="p-tool-dot" style={{ background: t.color }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="p-section p-about-section" id="about">
        <div className="p-about-inner">
          <div>
            <p className="p-section-label p-reveal">关于我</p>
            <h2 className="p-section-title p-reveal">创作者<br />简介</h2>
            <div className="p-about-text p-reveal">
              <p>你好，我是 <strong>heart DINO</strong>——一位生活在视觉与叙事交汇处的<strong>多媒体艺术家</strong>。</p>
              <p>我用摄影记录光与影的瞬息，用电影讲述有血有肉的故事，用绘画表达内心涌动的情感，用 3D 和 UE5 构建想象中的世界。</p>
              <p>每一件作品都是一次探索，每一次探索都是一次<strong>对美的重新定义</strong>。</p>
            </div>
          </div>
          <div className="p-about-stats p-reveal">
            <div className="p-stat-box">
              <div className="p-stat-num">7<span>+</span></div>
              <div className="p-stat-label">创作领域</div>
            </div>
            <div className="p-stat-box">
              <div className="p-stat-num">11<span>+</span></div>
              <div className="p-stat-label">专业工具</div>
            </div>
            <div className="p-stat-box">
              <div className="p-stat-num">∞</div>
              <div className="p-stat-label">创作热情</div>
            </div>
            <div className="p-stat-box">
              <div className="p-stat-num">1<span>♥</span></div>
              <div className="p-stat-label">独特视角</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="p-contact-section" id="contact">
        <p className="p-section-label p-reveal" style={{ textAlign: 'center' }}>开始合作</p>
        <h2 className="p-contact-big p-reveal">
          让我们<br />一起<span>创作</span>
        </h2>
        <div className="p-contact-links p-reveal">
          <a href="mailto:hello@heartdino.com" className="p-contact-btn primary">✉ 发送邮件</a>
          <a href="https://instagram.com/heart_dino" className="p-contact-btn" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
          <a href="#" className="p-contact-btn">💬 微信联系</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-footer">
        <span>© 2025 heart DINO. All rights reserved.</span>
        <span>多媒体艺术家 · Multimedia Artist</span>
        <span>Made with ♥</span>
      </footer>
    </div>
  )
}
