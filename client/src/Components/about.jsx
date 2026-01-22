import { useState, useRef, useEffect } from "react";
import Lottie from 'lottie-react';
import GlobeAnimation from 'animations/Globe.json';
import BatmanAnimation from 'animations/Batman.json';
import ScrollDownAnimation from 'animations/ScrollDown.json';
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Shield,
  TrendingDown,
  BarChart3,
  Users,
  Zap,
  Code,
  Layers,
  Lock,
  Cloud,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import PageWrapper from 'common/PageWrapper';
import { HomeHeaderButton } from './globalbuttons';
import { boxglowH } from 'utils/styles';

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description:
      "Email verification via Nodemailer, HTTP-only cookies, bcrypt password hashing with zxcvbn validation",
    details: [
      "Secure cookie-based sessions",
      "JWT token authentication with 3-day expiration",
      "Rate limiting on login attempts (5 attempts per 15 minutes)",
      "Redis-powered token blacklisting on logout",
      "DOMPurify sanitization for all user inputs",
    ],
  },
  {
    icon: TrendingDown,
    title: "Carbon Tracking",
    description:
      "Log monthly lifestyle data across 4 categories: food, transport, electricity, and waste and compare with others",
    details: [
      "Real-time CO₂ emission calculations using scientific emission factors",
      "Smart input validation with realistic caps to prevent data anomalies",
      "Category breakdown showing your biggest impact areas",
      "Historical tracking with timestamp accuracy",
      "Editable entries with full CRUD operations",
    ],
  },
  {
    icon: BarChart3,
    title: "Interactive Dashboard",
    description:
      "Beautiful visualizations powered by Recharts with dark mode support and expansive information about our environment",
    details: [
      "Pie charts showing emission breakdown by category",
      "Bar charts for community comparison",
      "Framer Motion animations for smooth transitions",
      "Lottie animations for enhanced user experience",
      "Confetti celebrations for milestone achievements",
    ],
  },
  {
    icon: Users,
    title: "Community Leaderboard",
    description:
      "Compare your impact with other users and get motivated by community progress",
    details: [
      "Real-time rankings based on total emissions",
      "Server-side aggregations for optimal performance",
      "Excludes unverified or empty accounts",
      "Privacy-focused: only usernames and emissions shown",
      "MongoDB aggregation pipeline for efficient queries",
    ],
  },
  {
    icon: Zap,
    title: "Performance Optimized",
    description:
      "Redis caching, MongoDB indexing, and smart rate limiting for lightning-fast responses",
    details: [
      "Redis Cloud integration for sub-50ms cache responses",
      "User profile caching with 30-minute TTL",
      "Weather/AQI data caching with 30-minute refresh limits",
      "MongoDB connection pooling and query optimization",
      "Vercel Edge Network deployment for global speed",
    ],
  },
  {
  icon: Cloud,
  title: "Real-Time Weather & AQI",
  description:
    "Location-based weather and air quality insights with smart caching",
  details: [
    "Live AQI & pollutant breakdown (PM2.5, CO, NO₂, SO₂, O₃)",
    "Browser GPS + IP fallback location detection",
    "Redis caching with refresh cooldowns",
    "Multi-API fallback (Tomorrow.io, Weatherbit, Open-Meteo)",
    "Health recommendations based on AQI level",
  ],
},
];

const techStack = [
  {
    category: "Frontend",
    icon: Code,
    technologies: [
      { name: "HTML5", purpose: "Semantic markup & accessibility" },
      { name: "CSS3", purpose: "Custom styling & animations" },
      { name: "JavaScript (ES6+)", purpose: "Core frontend logic" },
      { name: "React 18", purpose: "Component-based UI framework" },
      { name: "Tailwind CSS", purpose: "Utility-first styling & dark mode" },
      { name: "Framer Motion", purpose: "Advanced UI animations" },
      { name: "Recharts", purpose: "Interactive data visualizations" },
      { name: "React Router v6", purpose: "Client-side routing" },
      { name: "Lottie", purpose: "Micro-animations & UX polish" },
      { name: "Axios", purpose: "API communication" },
    ],
  },

  {
    category: "Backend",
    icon: Layers,
    technologies: [
      { name: "Node.js", purpose: "JavaScript runtime" },
      { name: "Express.js", purpose: "REST API framework" },
      { name: "MongoDB", purpose: "NoSQL database" },
      { name: "Mongoose", purpose: "ODM with schema validation" },
      { name: "Redis", purpose: "Caching & rate-limit store" },
      { name: "JWT", purpose: "Stateless authentication" },
      { name: "Bcrypt", purpose: "Password hashing" },
      { name: "Nodemailer", purpose: "Email verification system" },
      { name: "Node-Cron", purpose: "Scheduled background jobs" },
    ],
  },

  {
    category: "Authentication & Security",
    icon: Lock,
    technologies: [
      { name: "Google OAuth 2.0", purpose: "Social login" },
      { name: "HTTP-only Cookies", purpose: "Secure session handling" },
      { name: "Helmet", purpose: "Security headers" },
      { name: "CORS", purpose: "Cross-origin control" },
      { name: "Express Rate Limit", purpose: "Brute-force protection" },
      { name: "Mongo Sanitize", purpose: "NoSQL injection prevention" },
      { name: "XSS Clean", purpose: "XSS attack mitigation" },
      { name: "HPP", purpose: "HTTP parameter pollution protection" },
    ],
  },

  {
    category: "Infrastructure & DevOps",
    icon: Cloud,
    technologies: [
      { name: "Vercel", purpose: "Frontend hosting (CDN)" },
      { name: "Render", purpose: "Backend deployment" },
      { name: "MongoDB Atlas", purpose: "Cloud database" },
      { name: "Redis Cloud", purpose: "Managed Redis" },
      { name: "Name.com", purpose: "Custom domain DNS" },
      { name: "GitHub", purpose: "Version control" },
      { name: "GitHub Actions", purpose: "CI/CD pipelines" },
      { name: "HTTPS + HSTS", purpose: "Secure transport layer" },
    ],
  },
];

const apiEndpoints = [
  {
    category: "Authentication",
    endpoints: [
      { 
        method: "POST", 
        path: "/api/auth/register", 
        desc: "Create account & send email verification link" 
      },
      { 
        method: "GET", 
        path: "/api/auth/verify-email/:token", 
        desc: "Verify user email using JWT token" 
      },
      { 
        method: "POST", 
        path: "/api/auth/login", 
        desc: "Login with rate limiting & secure cookies" 
      },
      { 
        method: "POST", 
        path: "/api/auth/logout", 
        desc: "Logout user & blacklist JWT token" 
      },
      { 
        method: "POST", 
        path: "/api/auth/resend-verification", 
        desc: "Resend email verification with cooldown" 
      },
    ],
  },

  {
    category: "Google OAuth",
    endpoints: [
      { 
        method: "GET", 
        path: "/api/auth/google", 
        desc: "Start Google OAuth login flow" 
      },
      { 
        method: "GET", 
        path: "/api/auth/google/callback", 
        desc: "Handle OAuth callback & issue JWT" 
      },
    ],
  },

  {
    category: "Carbon Footprint",
    endpoints: [
      { 
        method: "POST", 
        path: "/api/footprint", 
        desc: "Create new monthly carbon entry" 
      },
      { 
        method: "GET", 
        path: "/api/footprint/history", 
        desc: "Fetch all user footprint records" 
      },
      { 
        method: "PUT", 
        path: "/api/footprint/:id", 
        desc: "Update existing footprint entry" 
      },
      { 
        method: "DELETE", 
        path: "/api/footprint/:id", 
        desc: "Delete a footprint record" 
      },
    ],
  },

  {
    category: "Weather & AQI",
    endpoints: [
      { 
        method: "GET", 
        path: "/api/auth/weather-aqi", 
        desc: "Fetch real-time weather & AQI (Redis cached)" 
      },
    ],
  },

  {
    category: "Feedback",
    endpoints: [
      { 
        method: "POST", 
        path: "/api/auth/feedback/submit", 
        desc: "Submit feedback (1 per day limit)" 
      },
      { 
        method: "POST", 
        path: "/api/auth/feedback/thankyou", 
        desc: "Thank-you email" 
      },
    ],
  },
];

const securityFeatures = [
  "HTTP-only secure cookies for JWT storage",
  "Strict domain-based CORS allowlist",
  "Helmet security headers (CSP, HSTS, frameguard)",
  "Forced HTTPS redirection in production",

  "Brute-force protection with rate limiting",
  "Redis token blacklisting on logout",
  "XSS filtering using xss-clean middleware",
  "NoSQL injection protection (mongo-sanitize)",

  "Parameter pollution protection (HPP)",
  "Request size limits (10kb body cap)",
  "Input sanitization & validation layers",
  "Secure password hashing (bcrypt)",

  "Environment variable validation on boot",
  "Proxy trust handling for production",
  "JWT expiration & token rotation support",
  "Redis-backed abuse & cooldown tracking"
];

const SectionWrapper = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    className="relative"
  >
    {children}
  </motion.div>
);

const FeatureCard = ({ feature, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);
  const Icon = feature.icon;

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}

      animate={{
        scale: isExpanded ? 1.15 : 1,
      }}

      className={`group bg-card/80 backdrop-blur-sm rounded-2xl p-6
        border border-border hover:border-primary/40
        transition-all duration-300 hover:shadow-lg
        ${isExpanded 
          ? "absolute z-50 w-[75%] h-[7%] backdrop-blur-md" 
          : "relative"}
      `}
    >
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 
                      group-hover:opacity-100 animate-borderFlow 
                      border-emerald-500 dark:border-gray-100 pointer-events-none" />

      <Icon className="w-10 h-10 text-primary mb-4" />

      <h3 className="text-lg font-bold mb-2 text-foreground">
        {feature.title}
      </h3>

      <p className="text-muted-foreground text-sm mb-4">
        {feature.description}
      </p>

      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center gap-2 text-primary text-sm 
                   hover:text-primary/80 transition-colors"
      >
        {isExpanded ? "Show less" : "Show details"}
        {isExpanded 
          ? <ChevronUp className="w-4 h-4" /> 
          : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-2 overflow-hidden"
          >
            {feature.details.map((detail, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const About = () => {
  const titleRef = useRef(null);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [screenHeight, setScreenHeight] = useState({ collapsed: 70, expanded: 110 });
    const contentVariants = {
  hidden: { opacity: 0, y: -10, transition: { duration: 0.2, delay: 0.6 } }, // exit
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.8 } }, // entry
};
const handleTap = () => {
  setIsHeaderExpanded(prev => !prev); // Toggle expanded state
  if (navigator.vibrate) {
    navigator.vibrate(10); // Mobile haptic feedback
  }
};
useEffect(() => {
  const updateHeight = () => {
    const width = window.innerWidth;
    if (width < 640) setScreenHeight({ collapsed: 70, expanded: 87 }); // mobile
    else if (width < 768) setScreenHeight({ collapsed: 75, expanded: 115 }); // tablet
    else if (width < 1024) setScreenHeight({ collapsed: 80, expanded: 120 }); // small desktop
    else setScreenHeight({ collapsed: 90, expanded: 140 }); // large desktop
  };

  updateHeight();
  window.addEventListener('resize', updateHeight);
  return () => window.removeEventListener('resize', updateHeight);
}, []);
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (titleRef.current && !titleRef.current.contains(event.target)) {
      setIsHeaderExpanded(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
const subject = encodeURIComponent("I will be re-instituting prima nocta...");
const handleEmailClick = (e) => {
  if (!/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    e.preventDefault();
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=${subject}`,
      '_blank'
    );
  }
};
  return (
    
      <motion.div
            initial={{ x:100, opacity: 0}}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full h-full"
          >
    <PageWrapper backgroundImage="/images/up.webp">
      {/* black Header */}
               <motion.header
                 initial={false}
                 animate={{ height: isHeaderExpanded ? screenHeight.expanded : screenHeight.collapsed }}
                 transition={{ duration: 0.5, ease: 'easeInOut' }}
                 className={`${boxglowH} w-full fixed top-0 left-0 z-40 px-6 py-4
                   bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-500`}
               >
                  <div className="transform sm:translate-x-0 sm:translate-y-0 -translate-x-3 -translate-y-1">
                    <div className="flex items-center sm:space-x-2 sm:mb-2 mb-0">
                      <motion.div
                        ref={titleRef}
                        onClick={handleTap}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-3xl  sm:text-4xl md:text-5xl font-germania tracking-normal text-sky-400 dark:text-green-300 tracker-title select-none"
                      >
                        A  
                        <span className="animated-co2 ml-1 inline-block text-[0.75em] align-sub" style={{ '--random': Math.random() }}> 1 </span> 
                        <span className="animated-co2 ml-1 inline-block text-[0.75em] align-sub" style={{ '--random': Math.random() }}> 4 </span>
                        <span className="animated-co2 ml-1 inline-block text-[0.75em] align-sub" style={{ '--random': Math.random() }}> 1 </span> 
                         
                      </motion.div>
                      <motion.div 
                        key="globe"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10" 
                      >
                        <Lottie animationData={GlobeAnimation} loop />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isHeaderExpanded && (
                        <motion.div
                          key="buttons"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="flex space-x-2 -ml-1"
                        >
                          <HomeHeaderButton text="Login" iconType="verify" navigateTo="/login" />
                          <HomeHeaderButton text="Register" iconType="new" navigateTo="/register" />
                          <HomeHeaderButton text="Home" iconType="dashboard" navigateTo="/home" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.header>
      {/* batman lottie */}
      <section className="relative py-72 px-10 overflow-hidden font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 text-white">
<motion.div 
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: [10, 0, 10] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="mt-80 mx-auto flex flex-col items-center z-20"
>
  <div 
    className="
      scroll-indicator 
      -ml-4 
      w-20 h-20 sm:w-24 sm:h-24   /* Bigger size */
      rounded-full
      flex items-center justify-center
      transition-all duration-500
      bg-yellow-400/20          /* Batman yellow glow */
      shadow-[0_0_25px_#facc15]
      hover:scale-110

      dark:bg-yellow-400/30
      dark:shadow-[0_0_35px_#facc15]
    "
  >
    <Lottie
      animationData={BatmanAnimation}
      loop
      autoplay
      style={{ width: 80, height: 80 }}   // Bigger lottie
    />
  </div>
</motion.div>

      </section>

      {/* main heading */}
      <section className="relative py-72 px-4 overflow-hidden font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 text-white">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <SectionWrapper>
            <div className="bg-card/60 group relative backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border">
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
            <div className="flex items-center justify-center gap-3 mb-6">
              <Leaf className="w-10 h-10 text-primary text-sky-400 dark:text-white" />
              <h1 className="text-4xl md:text-6xl font-bold font-germania tracking-wider text-shadow-DEFAULT text-foreground text-sky-400 dark:text-white">
                CFT
              </h1>
            </div>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-4">
              Carbon Footprint Tracker
            </p>
            <p className="text-lg max-w-2xl mx-auto">
              A full-stack MERN application empowering users to measure, track, and reduce their environmental impact<motion.span
                className="inline-block text-base sm:text-xl font-medium"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0 }}
              >
                .
              </motion.span>
              <motion.span
                className="inline-block text-base sm:text-xl font-medium"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.4 }}
              >
                .
              </motion.span>
              <motion.span
                className="inline-block text-base sm:text-xl font-medium"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "easeInOut", delay: 0.8 }}
              >
                .
              </motion.span>
            </p>
             <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
                >
                  <Lottie animationData={GlobeAnimation} loop />
                </motion.div>
               <a
                href="mailto:carbontracker.noreply@gmail.com"
                onClick={handleEmailClick}
                target="_blank"
                rel="noopener noreferrer"
                title="Hey Man! Whats up Mr.Stark, Kid! Where did u come from?..."
                className="-mr-10 items-center font-intertight tracking-wide text-lg text-shadow-DEFAULT text-sky-400 dark:text-white hover:text-blue-500 transition-colors duration-300"
              >
                How<span className="animate-pulse">'</span>s your day going<span className="animate-pulse">? </span> Here<span className="animate-pulse">,</span> have a cookie 
                <span className="cookie-explode-wrapper">
                  <span className="cookie-main">🍪</span>
                  <span className="cookie-crumb cookie-crumb-1">🍪</span>
                  <span className="cookie-crumb cookie-crumb-2">🍪</span>
                  <span className="cookie-crumb cookie-crumb-3">🍪</span>
                  <span className="cookie-crumb cookie-crumb-4">🍪</span>
                </span>
              </a></div></SectionWrapper>
          </motion.div>
        </div>
        <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: [10, 0, 10] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="absolute sm:bottom-40 bottom-32 left-1/2 transform -translate-x-1/2 text-sky-400 dark:text-white text-sm flex flex-col items-center z-20"
>
  <div className="scroll-indicator -ml-4 w-10 h-10
    transition-all duration-500
    dark:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(32%)_saturate(1234%)_hue-rotate(84deg)_brightness(95%)_contrast(92%)]
    [filter:brightness(0)_saturate(100%)_invert(61%)_sepia(92%)_saturate(2103%)_hue-rotate(174deg)_brightness(103%)_contrast(102%)]">
  <Lottie
  animationData={ScrollDownAnimation}
  loop
  autoplay
  style={{ width: 40, height: 40 }}
/></div>
</motion.div>
      </section>

      {/* Project Philosophy */}
      <section className="py-16 px-4 font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 dark:text-white text-emerald-500">
        <div className="max-w-5xl mx-auto">
          <SectionWrapper>
            <div className="bg-card/60 group relative backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border">
              <div className="flex items-center gap-3 mb-6">
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
                <Leaf className="w-8 h-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground text-sky-400 dark:text-white">
                  Project Philosophy
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  This project, officially named <span className="font-semibold text-foreground">CFT (Carbon Footprint Tracker)</span>, was conceived as a comprehensive deep dive into full-stack application development. The primary motivation was a rigorous, hands-on opportunity to achieve mastery over the entire <span className="font-semibold text-foreground">MERN (MongoDB, Express, React, Node.js)</span> stack and modern web architecture.
                </p>
                <p>
                  The development followed a strict ethos of <span className="font-semibold text-foreground">code ownership</span> and craftsmanship. While leveraging powerful resources—including open-source documentation and AI tools—for best practices and inspirational guidance, every critical feature and integration was meticulously built from scratch or thoroughly adapted.
                </p>
                <p>
                  At its core, CFT is dedicated to democratizing meaningful climate action. The platform transforms the complex task of calculating one's carbon footprint into a straightforward, engaging experience through simple data entry and transparent, verifiable calculations.
                </p>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-4 bg-muted/30 font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 dark:text-white text-emerald-500">
        <div className="max-w-6xl mx-auto">
          <SectionWrapper>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground text-sky-400 dark:text-white">
              Core Features
            </h2>
          </SectionWrapper>
          <div 
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
              style={{ gridAutoRows: "min-content" }}
            >
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4 font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 dark:text-white text-emerald-500">
        <div className="max-w-5xl mx-auto">
          <SectionWrapper>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground text-sky-400 dark:text-white">
              Technology Stack
            </h2>
          </SectionWrapper>
          <div className="grid md:grid-cols-2 gap-6">
            {techStack.map((stack, idx) => {
              const Icon = stack.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-card/80 backdrop-blur-sm group relative rounded-2xl p-6 border border-border"
                >
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">{stack.category}</h3>
                  </div>
                  <div className="space-y-2">
                    {stack.technologies.map((tech, i) => (
                      <div key={i} className="flex justify-between items-start gap-4">
                        <span className="font-medium text-foreground text-sm">{tech.name}</span>
                        <span className="text-xs text-muted-foreground text-right">{tech.purpose}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16 px-4 bg-muted/30 font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 dark:text-white text-emerald-500">
        <div className="max-w-5xl mx-auto">
          <SectionWrapper>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground text-sky-400 dark:text-white">
              API Endpoints
            </h2>
          </SectionWrapper>
          <div className="space-y-6">
            {apiEndpoints.map((group, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-card/80 backdrop-blur-sm group relative rounded-2xl p-6 border border-border"
              >
                            <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
                <h3 className="text-xl font-bold mb-4 text-foreground">{group.category}</h3>
                <div className="space-y-3">
                  {group.endpoints.map((endpoint, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded font-mono font-medium text-primary-foreground ${
                            endpoint.method === "GET"
                              ? "bg-blue-600"
                              : endpoint.method === "POST"
                              ? "bg-green-600"
                              : endpoint.method === "PUT"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-sm text-primary font-mono">{endpoint.path}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">{endpoint.desc}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4 font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 dark:text-white text-emerald-500">
        <div className="max-w-5xl mx-auto">
          <SectionWrapper>
            <div className="flex items-center justify-center gap-3 mb-12">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-sky-400 dark:text-white">
                Security Features
              </h2>
            </div>
          </SectionWrapper>
          <div className="grid sm:grid-cols-2 gap-3">
            {securityFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="flex items-start gap-3 bg-card/60 p-4 backdrop-blur-sm group relative rounded-lg border border-border"
              >
              <div className="absolute inset-0 rounded-lg border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-16 px-4 bg-muted/30 font-intertight text-shadow-DEFAULT tracking-wide transition-colors duration-500 dark:text-white text-emerald-500">
        <div className="max-w-4xl mx-auto">
          <SectionWrapper>
            <div className="bg-card/60 backdrop-blur-sm group relative rounded-3xl p-8 md:p-12 border border-border text-center">
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 group-hover:opacity-100 animate-borderFlow border-emerald-500 dark:border-gray-100 pointer-events-none" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-sky-400 dark:text-white">Conclusion</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Built with passion for the environment, <span className="font-semibold text-foreground">Carbon Footprint Tracker</span> is fundamentally an application designed for continuous improvement and real-world impact.
                </p>
                <p>
                  The current iteration serves as a robust foundation, but the journey of development is ongoing. Future additions are planned to include tracking non-CO₂ greenhouse gases, integrating optional API access for utility data, and developing more personalized, goal-oriented carbon reduction plans.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
                <a href="https://www.globalcarbonproject.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Global Carbon Project
                </a>
                <a href="https://ourworldindata.org/co2-emissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Our World in Data
                </a>
                <a href="https://www.ipcc.ch/reports/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  IPCC Reports
                </a>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>
      </PageWrapper>
    </motion.div>
  );
};

export default About;
