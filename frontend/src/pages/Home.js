import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoriesAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiArrowRight,
  FiCalendar,
  FiUsers,
  FiShield,
  FiBell,
  FiCheckCircle,
  FiBarChart2,
  FiLayers,
  FiClock,
  FiBookmark,
  FiActivity,
  FiStar,
  FiZap
} from 'react-icons/fi';
import './Home.css';

// Scroll reveal variants for smooth animations
const scrollRevealVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] // smooth easing
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Viewport detection hook
const useInViewAnimation = () => {
  const [isInView, setIsInView] = React.useState(false);
  const [node, setNode] = React.useState(null);
  const ref = React.useCallback((element) => {
    setNode(element);
  }, []);

  React.useEffect(() => {
    if (!node || isInView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [node, isInView]);

  return [ref, isInView];
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroRef, heroInView] = useInViewAnimation();
  const [featuresRef, featuresInView] = useInViewAnimation();
  const [categoriesRef, categoriesInView] = useInViewAnimation();
  const [workflowRef, workflowInView] = useInViewAnimation();
  const [rolesRef, rolesInView] = useInViewAnimation();
  const [ctaRef, ctaInView] = useInViewAnimation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await categoriesAPI.getAll();
        setCategories(catRes.data.data?.slice(0, 6) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: <FiCalendar />,
      title: 'Smart Event Lifecycle',
      description: 'Full-featured event management from creation to attendee check-in with real-time updates.',
      color: '#3b82f6'
    },
    {
      icon: <FiUsers />,
      title: 'Role-Based Dashboards',
      description: 'Custom workspaces for students, organizers, and admins with purpose-built interfaces.',
      color: '#8b5cf6'
    },
    {
      icon: <FiBell />,
      title: 'Live Notifications',
      description: 'Instant announcements and alerts keep everyone synchronized throughout events.',
      color: '#ec4899'
    },
    {
      icon: <FiBarChart2 />,
      title: 'Real-Time Analytics',
      description: 'Track registrations, engagement metrics, and performance across your events.',
      color: '#f59e0b'
    },
    {
      icon: <FiLayers />,
      title: 'Session Management',
      description: 'Organize complex sessions with automated scheduling and attendee management.',
      color: '#06b6d4'
    },
    {
      icon: <FiShield />,
      title: 'Enterprise Security',
      description: 'OAuth 2.0, role-based permissions, and protected endpoints ensure complete safety.',
      color: '#10b981'
    }
  ];

  const roles = [
    {
      name: 'For Students',
      description: 'Discover, register, and attend events with a personalized experience.',
      items: ['Event discovery', 'Save favorites', 'Manage registrations', 'View schedule'],
      icon: <FiBookmark />
    },
    {
      name: 'For Organizers',
      description: 'Create, manage and analyze events with powerful organizational tools.',
      items: ['Create events', 'Track attendees', 'Run announcements', 'View analytics'],
      icon: <FiActivity />
    },
    {
      name: 'For Admins',
      description: 'Maintain platform integrity and monitor system-wide performance.',
      items: ['Manage users', 'System analytics', 'Category oversight', 'Quality control'],
      icon: <FiShield />
    }
  ];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-gradient-bg" />
        <div className="container hero-wrapper">
          <motion.div 
            className="hero-content"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.1
                }
              }
            }}
          >
            <motion.div className="hero-badge" variants={scrollRevealVariants}>
              <FiStar size={14} />
              <span>Modern Event Platform</span>
            </motion.div>
            
            <motion.h1 className="hero-title" variants={scrollRevealVariants}>
              Reimagine how your community <span className="gradient-text">experiences events</span>
            </motion.h1>
            
            <motion.p className="hero-subtitle" variants={scrollRevealVariants}>
              Eventrix combines powerful event management with role-based dashboards designed for students, organizers, and administrators. One unified platform for discovery, operations, and engagement.
            </motion.p>

            <motion.div className="hero-cta-group" variants={scrollRevealVariants}>
              <Link to="/register" className="btn btn-primary btn-hero">
                <span>Try It Now - It's Free</span>
                <FiArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-hero">
                Sign In
              </Link>
            </motion.div>

            <motion.div className="hero-trust-bar" variants={scrollRevealVariants}>
              <span className="trust-text">Trusted platform for event management</span>
              <div className="trust-metrics">
                <div className="metric">
                  <strong>3</strong>
                  <span>Role Types</span>
                </div>
                <div className="metric">
                  <strong>10+</strong>
                  <span>Modules</span>
                </div>
                <div className="metric">
                  <strong>24/7</strong>
                  <span>Support</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={heroInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          >
            <div className="dashboard-card">
              <div className="card-header">Event Dashboard</div>
              <div className="card-content">
                <div className="stat-line">
                  <span>Upcoming Events</span>
                  <strong>12</strong>
                </div>
                <div className="stat-line">
                  <span>Total Attendees</span>
                  <strong>2,847</strong>
                </div>
                <div className="stat-line">
                  <span>Registrations</span>
                  <strong>94%</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="container">
          <motion.div 
            className="section-intro"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2>Powerful Features Built In</h2>
            <p>Everything you need to create unforgettable event experiences</p>
          </motion.div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} className="feature-item" variants={itemVariants}>
                <div className="feature-icon-box" style={{ '--icon-color': feature.color }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="categories-section" ref={categoriesRef}>
          <div className="container">
            <motion.div 
              className="section-intro"
              initial={{ opacity: 0, y: 30 }}
              animate={categoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2>Event Categories</h2>
              <p>Browse supported event types and discover what's happening</p>
            </motion.div>

            <motion.div 
              className="categories-grid"
              initial="hidden"
              animate={categoriesInView ? "visible" : "hidden"}
              variants={containerVariants}
            >
              {categories.map((cat) => (
                <motion.div key={cat._id} className="category-badge" variants={itemVariants}>
                  <span className="category-emoji">{cat.icon || '📌'}</span>
                  <h4>{cat.name}</h4>
                  <p>{cat.eventCount || 0} events</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="how-it-works" ref={workflowRef}>
        <div className="container">
          <motion.div 
            className="section-intro"
            initial={{ opacity: 0, y: 30 }}
            animate={workflowInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2>How It Works</h2>
            <p>A seamless workflow for your entire event ecosystem</p>
          </motion.div>

          <motion.div 
            className="workflow-grid"
            initial="hidden"
            animate={workflowInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div className="workflow-step" variants={itemVariants}>
              <div className="step-number">01</div>
              <FiClock className="step-icon" />
              <h3>Plan</h3>
              <p>Organize events, configure ticketing, and set up your event structure and schedule.</p>
            </motion.div>
            <motion.div className="workflow-step" variants={itemVariants}>
              <div className="step-number">02</div>
              <FiUsers className="step-icon" />
              <h3>Engage</h3>
              <p>Students discover opportunities, register for events, and build their personal schedule.</p>
            </motion.div>
            <motion.div className="workflow-step" variants={itemVariants}>
              <div className="step-number">03</div>
              <FiBell className="step-icon" />
              <h3>Operate</h3>
              <p>Send announcements, manage sessions, check in attendees, and keep everyone connected.</p>
            </motion.div>
            <motion.div className="workflow-step" variants={itemVariants}>
              <div className="step-number">04</div>
              <FiBarChart2 className="step-icon" />
              <h3>Analyze</h3>
              <p>Track metrics, measure success, and gain insights for future event planning.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section" ref={rolesRef}>
        <div className="container">
          <motion.div 
            className="section-intro"
            initial={{ opacity: 0, y: 30 }}
            animate={rolesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2>Built for Every Role</h2>
            <p>Tailored experiences for students, organizers, and administrators</p>
          </motion.div>

          <motion.div 
            className="roles-grid"
            initial="hidden"
            animate={rolesInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {roles.map((role, idx) => (
              <motion.div key={idx} className="role-card-premium" variants={itemVariants}>
                <div className="role-header">
                  <div className="role-icon">{role.icon}</div>
                  <h3>{role.name}</h3>
                </div>
                <p className="role-desc">{role.description}</p>
                <ul className="role-list">
                  {role.items.map((item, i) => (
                    <li key={i}>
                      <FiCheckCircle size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-final" ref={ctaRef}>
        <motion.div 
          className="container cta-inner"
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
              }
            }
          }}
        >
          <motion.div className="cta-content" variants={scrollRevealVariants}>
            <h2>Ready to Transform Your Events?</h2>
            <p>Join thousands of students and organizers creating amazing event experiences</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <FiZap size={18} />
                Get Started Now
              </Link>
              <Link to="/login" className="btn btn-ghost btn-large">
                Or sign in to your account
              </Link>
            </div>
          </motion.div>

          <motion.div className="cta-feature-list" variants={scrollRevealVariants}>
            <div className="feature-check">
              <FiCheckCircle />
              <span>No credit card required</span>
            </div>
            <div className="feature-check">
              <FiCheckCircle />
              <span>Instant setup & deployment</span>
            </div>
            <div className="feature-check">
              <FiCheckCircle />
              <span>Full feature access</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Modules Footer */}
      <motion.section 
        className="modules-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
      >
        <div className="container">
          <p className="modules-label">Core Modules</p>
          <div className="module-tags">
            {['Authentication', 'Registration', 'Sessions', 'Announcements', 'Surveys', 'Notifications', 'Analytics'].map((mod, i) => (
              <span key={i}>{mod}</span>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
