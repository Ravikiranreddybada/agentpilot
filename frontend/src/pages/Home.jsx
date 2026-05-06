import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={styles.container}>
      <style>{`
        @media (max-width: 768px) {
          .nav-responsive {
            padding: 18px 20px !important;
            flex-wrap: wrap;
            gap: 15px;
          }
          .hero-responsive {
            flex-direction: column !important;
            padding: 40px 20px !important;
            text-align: center;
            min-height: auto !important;
          }
          .hero-left-responsive {
            max-width: 100% !important;
            margin-bottom: 40px;
          }
          .hero-right-responsive {
            max-width: 100% !important;
          }
          .title-responsive {
            font-size: clamp(2.5rem, 10vw, 4rem) !important;
            line-height: 1.1 !important;
          }
          .btns-responsive {
            justify-content: center;
            flex-wrap: wrap;
          }
          .tech-bar-responsive {
            padding: 28px 20px !important;
            flex-wrap: wrap;
            gap: 24px !important;
            justify-content: center;
          }
          .footer-responsive {
            padding: 24px 20px !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.nav} className="nav-responsive">
        <Link to="/" style={styles.navLogo}>
          <div style={styles.logoIcon}>AP</div>
          <span>Agent Pilot</span>
        </Link>
        <div style={styles.navLinks}>
          {user ? (
            <Link to="/dashboard" style={styles.btnNav}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/signup" style={styles.btnNav}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={styles.hero} className="hero-responsive">
        <div style={styles.heroLeft} className="hero-left-responsive">
          <h1 style={styles.title} className="title-responsive">
            LLM-Based<br />
            <span style={styles.highlight}>Agentic AI</span><br />
            for Tool-Using<br />
            Reasoning<br />
            Workflows<br />
            Automation
          </h1>
          <p style={styles.subtitle}>
            Secure AI Workflow Platform — powered by advanced reasoning agents, 
            tool orchestration, and intelligent automation pipelines.
          </p>
          <div style={styles.heroBtns} className="btns-responsive">
            <Link to="/signup" style={styles.btnCreate}>Create Account →</Link>
            <Link to="/login" style={styles.btnLogin}>Sign In</Link>
          </div>
        </div>

        <div style={styles.heroRight} className="hero-right-responsive">
          <div style={styles.aboutCard}>
            <h2 style={styles.cardTitle}>About This Platform</h2>
            <p style={styles.cardText}>
              Agent Pilot is a next-generation platform that lets you build, deploy, 
              and monitor LLM-powered agents that can reason, use tools, and 
              automate complex workflows.
            </p>
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>🤖</div>
                <div style={styles.featureText}>
                  <strong>Agentic Reasoning</strong>
                  <span>Chain-of-thought agents that plan and act autonomously</span>
                </div>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>🔧</div>
                <div style={styles.featureText}>
                  <strong>Tool Orchestration</strong>
                  <span>Connect APIs, databases, search engines and more</span>
                </div>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>🔒</div>
                <div style={styles.featureText}>
                  <strong>Secure & Authenticated</strong>
                  <span>Session auth, bcrypt hashing, session management</span>
                </div>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>⚡</div>
                <div style={styles.featureText}>
                  <strong>Fast Automation</strong>
                  <span>Run workflows in parallel with intelligent retry logic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH BAR */}
      <div style={styles.techBar} className="tech-bar-responsive">
        <div style={styles.techItem}>
          <strong>MongoDB</strong>
          <span>Database</span>
        </div>
        <div style={styles.techItem}>
          <strong>Express</strong>
          <span>API</span>
        </div>
        <div style={styles.techItem}>
          <strong>React</strong>
          <span>Frontend</span>
        </div>
        <div style={styles.techItem}>
          <strong>Node.js</strong>
          <span>Runtime</span>
        </div>
        <div style={styles.techItem}>
          <strong>Docker</strong>
          <span>Containerized</span>
        </div>
        <div style={styles.techItem}>
          <strong>Jenkins</strong>
          <span>CI/CD</span>
        </div>
      </div>

      <footer style={styles.footer} className="footer-responsive">
        <p>© 2025 Agent Pilot — LLM-Based Agentic AI Platform. Built with ❤️ by the team.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#fff',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '100vw',
    overflowX: 'hidden'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 60px',
    borderBottom: '1px solid #1e1e2e',
    transition: 'all 0.3s ease'
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    textDecoration: 'none'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  link: {
    color: '#aaa',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '9px 20px',
    borderRadius: '8px'
  },
  btnNav: {
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    color: '#fff',
    fontWeight: '600',
    padding: '9px 22px',
    borderRadius: '8px',
    textDecoration: 'none'
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px 60px',
    minHeight: '85vh',
    gap: '40px',
    transition: 'all 0.3s ease'
  },
  heroLeft: {
    flex: '1',
    maxWidth: '640px'
  },
  title: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontWeight: '900',
    lineHeight: '1.05',
    color: '#fff',
    marginBottom: '20px'
  },
  highlight: {
    color: '#00d4ff'
  },
  subtitle: {
    fontSize: '17px',
    color: '#888',
    lineHeight: '1.7',
    marginBottom: '40px',
    maxWidth: '520px'
  },
  heroBtns: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  btnCreate: {
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    color: '#fff',
    padding: '14px 32px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  btnLogin: {
    background: 'transparent',
    color: '#ccc',
    padding: '14px 32px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    border: '1.5px solid #333'
  },
  heroRight: {
    flex: '1',
    maxWidth: '480px'
  },
  aboutCard: {
    background: '#11111d',
    border: '1px solid #1e1e35',
    borderRadius: '16px',
    padding: '36px'
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px'
  },
  cardText: {
    color: '#888',
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '24px'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  featureIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #00d4ff22, #7b2ff722)',
    border: '1px solid #00d4ff44',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    flexShrink: '0'
  },
  featureText: {
    flex: '1'
  },
  techBar: {
    background: '#0d0d18',
    borderTop: '1px solid #1a1a2e',
    padding: '28px 60px',
    display: 'flex',
    gap: '48px',
    transition: 'all 0.3s ease'
  },
  techItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  footer: {
    borderTop: '1px solid #1a1a2e',
    padding: '24px 60px',
    textAlign: 'center',
    color: '#444',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  }
};

