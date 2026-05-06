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
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;700;800;900&display=swap');
        
        @keyframes gflow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn { animation: fadeIn 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        
        .glass-card {
          background: rgba(13, 13, 26, 0.7) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 212, 255, 0.1) !important;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .glass-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 212, 255, 0.3) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 1024px) {
          .hero-responsive {
            flex-direction: column !important;
            padding: 80px 30px !important;
            text-align: center;
          }
          .hero-left-responsive {
            max-width: 100% !important;
            margin-bottom: 60px;
          }
          .hero-right-responsive {
            max-width: 100% !important;
          }
          .btns-responsive {
            justify-content: center;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLogo}>
          <div style={styles.logoIcon}>AP</div>
          <span style={{ fontFamily: 'Syne, sans-serif' }}>Agent Pilot</span>
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
          <div style={styles.badge} className="animate-fadeIn">🚀 Enterprise AI Orchestration</div>
          <h1 style={styles.title} className="animate-fadeIn delay-1">
            LLM-Based<br />
            <span style={styles.highlight}>Agentic AI</span><br />
            for Tool-Using<br />
            <span style={styles.gradientText}>Reasoning Workflows</span>
          </h1>
          <p style={styles.subtitle} className="animate-fadeIn delay-2">
            Build, deploy, and monitor autonomous agents that plan, act, and 
            use real-world tools via an advanced ReAct reasoning engine.
          </p>
          <div style={styles.heroBtns} className="btns-responsive animate-fadeIn delay-2">
            <Link to="/signup" style={styles.btnCreate}>Create Account →</Link>
            <Link to="/login" style={styles.btnLogin}>Sign In</Link>
          </div>
        </div>

        <div style={styles.heroRight} className="hero-right-responsive animate-fadeIn delay-2">
          <div style={styles.aboutCard} className="glass-card">
            <div style={styles.cardHeader}>
               <div style={styles.statusDot}></div>
               <span style={{ fontSize: 10, color: '#00d4ff', fontWeight: 800, letterSpacing: 1 }}>SYSTEM READY</span>
            </div>
            <h2 style={styles.cardTitle}>Agent Platform</h2>
            <p style={styles.cardText}>
              Decompose complex requests into tool calls, execute multi-step 
              plans, and generate fact-based results with 0% hallucination.
            </p>
            <div style={styles.featureList}>
              {[
                { icon: '🤖', t: 'ReAct Engine', d: 'Autonomous reason-and-act tool orchestration' },
                { icon: '🔧', t: 'Tool Orchestration', d: 'Connect MongoDB, Search, & Custom APIs' },
                { icon: '📚', t: 'RAG Knowledge', d: 'Vector-based private document retrieval' },
                { icon: '⚡', t: 'Fast Execution', d: 'Powered by Groq LPU hardware acceleration' }
              ].map((f, i) => (
                <div key={i} style={styles.featureItem}>
                  <div style={styles.featureIcon}>{f.icon}</div>
                  <div style={styles.featureText}>
                    <strong style={{ fontSize: 13, color: '#fff' }}>{f.t}</strong>
                    <span style={{ fontSize: 11, color: '#444', display: 'block' }}>{f.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TECH BAR */}
      <div style={styles.techBar}>
        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap', justifyContent: 'center', opacity: 0.6 }}>
          {[
            ['MongoDB', 'Database'],
            ['FastAPI', 'Backend'],
            ['React', 'Frontend'],
            ['Python', 'Language'],
            ['Pinecone', 'Vector DB'],
            ['Groq', 'LPU Inference']
          ].map(([name, type]) => (
            <div key={name} style={styles.techItem}>
              <strong style={{ fontSize: 14, color: '#fff', fontFamily: 'Syne, sans-serif' }}>{name}</strong>
              <span style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace' }}>© 2025 Agent Pilot — LLM-Based Agentic AI Platform. Built with ❤️ for the future of AI.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#080810',
    color: '#fff',
    fontFamily: 'Syne, sans-serif',
    maxWidth: '100vw',
    overflowX: 'hidden'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 60px',
    borderBottom: '1px solid #111',
    background: 'rgba(8, 8, 16, 0.8)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    textDecoration: 'none'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 800
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  link: {
    color: '#444',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    transition: 'color 0.2s'
  },
  btnNav: {
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    color: '#fff',
    fontWeight: '700',
    padding: '10px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px'
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '100px 80px',
    minHeight: '85vh',
    gap: '60px'
  },
  heroLeft: {
    flex: '1',
    maxWidth: '700px'
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    color: '#00d4ff',
    fontSize: '11px',
    fontWeight: '800',
    padding: '6px 16px',
    borderRadius: '30px',
    marginBottom: '24px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
    fontWeight: '900',
    lineHeight: '1.1',
    color: '#fff',
    marginBottom: '24px',
    letterSpacing: '-1px'
  },
  highlight: {
    color: '#00d4ff'
  },
  gradientText: {
    background: 'linear-gradient(135deg, #00d4ff, #a78bfa, #fb923c)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'gflow 4s ease infinite'
  },
  subtitle: {
    fontSize: '18px',
    color: '#444',
    lineHeight: '1.8',
    marginBottom: '48px',
    maxWidth: '540px'
  },
  heroBtns: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  btnCreate: {
    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
    color: '#fff',
    padding: '16px 40px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '800',
    textDecoration: 'none',
    boxShadow: '0 10px 20px rgba(0, 212, 255, 0.2)'
  },
  btnLogin: {
    background: 'transparent',
    color: '#ccc',
    padding: '16px 40px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    border: '1.5px solid #111'
  },
  heroRight: {
    flex: '1',
    maxWidth: '520px'
  },
  aboutCard: {
    borderRadius: '24px',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    background: '#00d4ff',
    borderRadius: '50%',
    boxShadow: '0 0 10px #00d4ff'
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '12px'
  },
  cardText: {
    color: '#444',
    fontSize: '14px',
    lineHeight: '1.7',
    marginBottom: '32px'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  featureIcon: {
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: '0'
  },
  featureText: {
    flex: '1'
  },
  techBar: {
    background: '#080810',
    padding: '60px 80px',
    borderTop: '1px solid #111'
  },
  techItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  footer: {
    padding: '30px 80px',
    textAlign: 'center',
    color: '#222',
    fontSize: '12px',
    borderTop: '1px solid #111'
  }
};


