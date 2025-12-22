import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const getButtonState = (userEmail) => {
  try {
    const key = `buttonState_${userEmail || 'guest'}`;
    const match = document.cookie
      .split('; ')
      .find(row => row.startsWith(encodeURIComponent(key) + '='));
    const savedState = match ? decodeURIComponent(match.split('=')[1]) : null;
    return savedState ? JSON.parse(savedState) : {};
  } catch (e) {
    console.error("Failed to get button state:", e);
    return {};
  }
};
// color ki state kaunsi h
const saveButtonState = (userEmail, newState) => {
  try {
    const key = `buttonState_${userEmail || 'guest'}`;
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();// 1 saal
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
      JSON.stringify(newState)
    )}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save button state:", e);
  }
};

const StyleInjector = () => {
  const styles = `
    @keyframes shimmer-effect-metallic {
      0% {
        transform: translateX(-150%) skewX(-30deg);
      }
      100% {
        transform: translateX(250%) skewX(-30deg);
      }
    }
    @media (max-width: 639px) {
      .animate-shimmer {
        display: none !important;
        animation: none !important;
      }
    }
    .animate-shimmer {
      position: absolute;
      top: 0;
      left: 0;
      width: 40%;
      height: 100%;
      will-change: background-position;
      backface-visibility: hidden;
      transform: translateZ(0);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 40%,
        rgba(255, 255, 255, 0.6) 50%,
        rgba(255, 255, 255, 0.3) 60%,
        rgba(255, 255, 255, 0) 100%
      );
      mix-blend-mode: color-dodge;
      animation: shimmer-effect-metallic 4s infinite linear;
      animation-fill-mode: forwards;
      animation-delay: -2s;
    }
  `;

  return <style>{styles}</style>;
};

export default StyleInjector;
// icon
const Icons = {
  new: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></motion.svg>,
  edit: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></motion.svg>,
  delete: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></motion.svg>,
  save: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></motion.svg>,
  verify: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></motion.svg>,
  clear: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.5 12.5"/><path d="M2 12.5a10 10 0 0 0 18.5-1"/></motion.svg>,
  logout: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></motion.svg>),
  visualize: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="10" />  <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /> <circle cx="12" cy="12" r="3" /> </motion.svg>),
  dashboard: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M3 12L12 3l9 9" /> <path d="M9 21V12h6v9" /> </motion.svg>),
  weather: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="4" /> <line x1="12" y1="2" x2="12" y2="6" /> <line x1="12" y1="18" x2="12" y2="22" /> <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /> <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /> <line x1="2" y1="12" x2="6" y2="12" /> <line x1="18" y1="12" x2="22" y2="12" /> <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /> <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /> <path d="M17.5 19a4.5 4.5 0 0 0 0-9 5 5 0 0 0-9.9 1.5H7a4 4 0 0 0 0 8h10.5z" /> </motion.svg> ),
  info: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="10" /> <line x1="12" y1="16" x2="12" y2="12" /> <line x1="12" y1="8" x2="12.01" y2="8" /> </motion.svg> ),
  GI: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" > <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /> </motion.svg>),
  email: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /> <polyline points="22,6 12,13 2,6" /> <path d="M16 10l4-3" /> <path d="M8 10l-4-3" /> </motion.svg> ),
  copy: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect> <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path> </motion.svg>),
  showMore: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } :  { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polyline points="6 9 12 15 18 9" /> </motion.svg> ),
  showLess: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } :  isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <polyline points="18 15 12 9 6 15" /> </motion.svg> ),
  rocket: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -4, -2, 0], rotate: [0, -5, 5, 0] } : { scale: 1, y: 0, rotate: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.6, ease: "easeOut" } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/> <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/> <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/> <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/> </motion.svg>),
  feedback: ({ isFlipping, isHovered }) => ( <motion.svg animate={isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> <line x1="9" y1="10" x2="15" y2="10" /> <line x1="12" y1="14" x2="12" y2="14" /> </motion.svg>),
  send: ({ isFlipping, isHovered }) => ( <motion.svg  animate={isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <line x1="22" y1="2" x2="11" y2="13" /> <polygon points="22 2 15 22 11 13 2 9 22 2" /> </motion.svg>),
  close: ({ isFlipping, isHovered }) => ( <motion.svg animate={isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <line x1="18" y1="6" x2="6" y2="18" /> <line x1="6" y1="6" x2="18" y2="18" />  </motion.svg>),
  profile: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping  ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] }  : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } } width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" /> </motion.svg>),
  check: ({ isFlipping, isHovered }) => ( <motion.svg  animate={ isFlipping  ? { rotateY: [0, 180, 360] }  : isHovered  ? { scale: [1, 1.15, 1], y: [0, -2, 0] }  : { scale: 1, y: 0 } } transition={ isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 } }  width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}   viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"   strokeLinejoin="round"> <polyline points="20 6 9 17 4 12" /></motion.svg>),
  cancel: ({ isFlipping, isHovered }) => (<motion.svg animate={isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 } } transition={isFlipping  ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24} height={typeof window !== "undefined" && window.innerWidth < 640 ? 18 : 24}  viewBox="0 0 24 24" fill="none" stroke="currentColor"  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /> </motion.svg>),
};

const GlobalButton = ({ text, iconType, onClick, disabled = false, colorConfig, navigateTo, type, styleOverride, userEmail, tooltipText }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const hoverTimeoutRef = useRef(null);

    useEffect(() => {
      if (disabled && text === 'Processing...') {
        setIsFlipping(true);  
      } else {
        setIsFlipping(false); 
      }
    }, [disabled, text]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    const navigate = useNavigate();

    const [schemeIndex, setSchemeIndex] = useState(() => {
        const state = getButtonState(userEmail);
        return state[colorConfig.id] || 0;
    });
    
    useEffect(() => {
        const state = getButtonState(userEmail);
        state[colorConfig.id] = schemeIndex;
        saveButtonState(userEmail, state);
    }, [schemeIndex, colorConfig.id, userEmail]);
    
    const IconComponent = Icons[iconType] || (() => null);
    const { schemes, baseColor } = colorConfig;
    const currentScheme = schemes[schemeIndex];
    const isTransparent = currentScheme === 'transparent';

    const handleHoverStart = () => {
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Debounce hover state
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, 50);
    };

    const handleHoverEnd = () => {
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsHovered(false);
    };

    const handleClick = (e) => {
        if (e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
        requestAnimationFrame(() => setIsFlipping(true));
        setTimeout(() => setIsFlipping(false), 400);

        if (navigator.vibrate) {
          const vibrationPatterns = {
            new: [30],
            edit: [20, 40, 20],
            delete: [50, 100, 50],
            save: [15, 30, 15],
            verify: [60],
            clear: [40, 60, 40],
            logout: [25, 50, 25],
            visualize: [10, 20, 10, 20],
            default: [20]
          };
          navigator.vibrate(vibrationPatterns[iconType] || vibrationPatterns.default);
        }

        const newIndex = (schemeIndex + 1) % schemes.length;
        setSchemeIndex(newIndex);
        const delay = (disabled && text === 'Processing...') ? 1000 : 400; 
        setTimeout(() => {
          if (navigateTo) {
            navigate(navigateTo);
          }
          if (onClick) {
            onClick(e);
          }
        }, delay); 
    };

    const tapAnimation = {
      scale: 0.90,
      y: 2,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
      filter: "brightness(1.15)",
      transition: { type: 'spring', stiffness: 500, damping: 26 }
    };

    const glowColor = currentScheme.includes('linear-gradient')
      ? currentScheme.match(/#([0-9a-f]{3,8})/i)?.[0] || baseColor
      : currentScheme;

    return (
        <motion.div 
          className="relative" 
          onHoverStart={handleHoverStart}
          onHoverEnd={handleHoverEnd}
        >
           {tooltipText && isHovered && (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="absolute -top-12  z-50 pointer-events-none"
  >
    <div className="bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
      <p className="text-xs sm:text-sm font-intertight text-shadow-DEFAULT tracking-wide">{tooltipText}</p>
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-gray-800/95 rotate-45 border-r border-b border-white/10"></div>
    </div>
  </motion.div>
)}
          <motion.button
            type={type || "button"}
            whileTap={tapAnimation}
            whileHover={{
              scale: 1.05,
              rotateX: 2, 
              rotateY: -2,
              boxShadow: `
                0 0 20px ${glowColor}80,
                0 0 10px ${glowColor}80,
                inset 0 2px 4px rgba(255,255,255,0.1),
                inset 0 -3px 6px rgba(0,0,0,0.4)
              `,
              transition: {
                scale: { type: 'spring', stiffness: 800, damping: 25 },
                boxShadow: { duration: 0.2 },
                rotateX: { duration: 0.2 },
                rotateY: { duration: 0.2 }
              }
            }}
            onClick={handleClick}
            disabled={disabled}
            className="relative flex items-center justify-center gap-3 h-14 rounded-xl font-semibold font-sriracha tracking-wider shadow-lg overflow-hidden text-white"
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              transformOrigin: 'center',
              width: '100%',
              background: isTransparent ? 'transparent' : currentScheme,
              border: isTransparent
                ? `1.5px solid ${baseColor}`
                : '1.5px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '0.75rem',
              boxShadow: isTransparent
                ? 'none'
                : `
                  0 6px 12px rgba(0,0,0,0.35),
                  inset 0 2px 4px rgba(255,255,255,0.15),
                  inset 0 -3px 6px rgba(0,0,0,0.4)
                `,
              backdropFilter: isTransparent ? 'none' : 'blur(2px)',
              color: isTransparent ? baseColor : 'white',
              transition: 'background 0.3s ease, border 0.3s ease, color 0.3s ease',
              willChange: 'transform, box-shadow',
              ...styleOverride, 
            }}
          >
            <div 
              className="animate-shimmer ring-1 ring-white/10" 
              style={{ 
                opacity: isTransparent ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }} 
            />
            <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
              <IconComponent isFlipping={isFlipping} isHovered={isHovered} />
              <span>{text}</span>
            </div>
          </motion.button>
        </motion.div>
    );
};

export const SubmitButton = ({ text, loading = false, success = false, disabled = false, customColorConfig, userEmail }) => {
    const displayText = loading ? 'Processing...' : success ? 'Success' : text;
    
    return (
        <GlobalButton
            text={displayText}
            iconType="verify"
            disabled={disabled || loading}
            colorConfig={customColorConfig || buttonColorConfigs.verify}
            userEmail={userEmail}
            {...{ type: 'submit' }}
        />
    );
};

export const HomeHeaderButton = ({ text, navigateTo, iconType, className = ""  }) => {

  const [isFlipping, setIsFlipping] = useState(false);
  const IconComponent = Icons[iconType] || (() => null);
  const [isHovered, setIsHovered] = useState(false);
  const iconSize = window.innerWidth < 640 ? 5 : 24;
  const handleClick = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 400); // reset flip after animation
    setTimeout(() => {
      window.location.href = navigateTo;
    }, 400);
  };

  return (
    <motion.div
  onHoverStart={() => setIsHovered(true)}
  onHoverEnd={() => setIsHovered(false)}
>
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9, rotate: -2 }}
      whileHover={{
  scale: 1.05,
  rotateX: 2,
  rotateY: -2,
  boxShadow: `
    0 0 20px rgba(255, 255, 255, 0.25),
    0 0 10px rgba(255, 255, 255, 0.2),
    inset 0 2px 4px rgba(255,255,255,0.1),
    inset 0 -3px 6px rgba(0,0,0,0.3)
  `,
  transition: {
    scale: { type: 'spring', stiffness: 1000, damping: 30 },
    boxShadow: { duration: 0.1 },
  },
}}

      className={`
  relative flex items-center justify-center gap-2
  h-6 px-2 text-sm
  sm:h-10 sm:px-5 sm:text-base
  md:h-12 md:px-6 md:text-lg
  sm:rounded-xl rounded-lg font-semibold font-sriracha sm:tracking-wide shadow-lg overflow-hidden text-gray-100 ${className}`}

      style={{
  background: 'transparent',
  border: '1.5px solid rgba(255,255,255,0.08)',
  borderRadius: '0.75rem',
  backdropFilter: 'blur(2px)',
  boxShadow: `
    0 6px 12px rgba(0,0,0,0.35),
    inset 0 2px 4px rgba(255,255,255,0.15),
    inset 0 -3px 6px rgba(0,0,0,0.4)
  `,
  transition: 'background 0.4s, border 0.4s, color 0.4s',
}}

    >
      {/* Shimmer */}
     <span
  className="pointer-events-none absolute inset-0 z-0 animate-shimmer rounded-xl"
/>


      {/* Icon + Text */}
      <div className="relative z-10 flex items-center gap-1">
        <IconComponent isHovered={isHovered} isFlipping={isFlipping} size={iconSize}/>
        <span>{text}</span>
      </div>
    </motion.button>
    </motion.div>
  );
};

export const WeatherButton = ({ textMobile, textDesktop, iconType, onClick, loading = false, expired = false }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const IconComponent = Icons[iconType] || (() => null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Dynamic 
  const getButtonText = () => {
    if (loading) return "Getting Data...";
    if (expired) return "Data Expired - Refresh";
    return null;
  };

  const handleClick = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 500);
    if (onClick) onClick();
  };

  return (
    <motion.div onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} className="flex justify-center mt-4">
      <motion.button
        onClick={handleClick}
        disabled={loading}
        whileTap={{ scale: 0.9, rotate: -0.5 }}
        whileHover={{
          scale: loading ? 1 : 1.05,
          rotateX: 2,
          rotateY: -2,
          boxShadow: `
            0 0 20px rgba(255, 255, 255, 0.25),
            0 0 10px rgba(255, 255, 255, 0.2),
            inset 0 2px 4px rgba(255,255,255,0.1),
            inset 0 -3px 6px rgba(0,0,0,0.3)
          `,
          transition: {
            scale: { type: 'spring', stiffness: 1000, damping: 30 },
            boxShadow: { duration: 0.1 },
          },
        }}
        className={` relative flex flex-row items-center justify-center gap-2
           -top-1 h-12 px-2 text-sm sm:px-5 sm:text-base md:px-6 md:text-lg
          sm:rounded-xl rounded-lg font-semibold font-sriracha tracking-widest shadow-lg overflow-hidden w-[230px] sm:w-[380px]
          ${loading ? 'opacity-75' : ''}`}
        style={{
          background: expired ? 'linear-gradient(145deg, #f59e0b, #d97706)' : 'transparent',
          border: '1.5px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(2px)',
          boxShadow: `
            0 6px 12px rgba(0,0,0,0.35),
            inset 0 2px 4px rgba(255,255,255,0.15),
            inset 0 -3px 6px rgba(0,0,0,0.4)
          `,
          transition: 'background 0.4s, border 0.4s, color 0.4s',
        }}
      >
        <span className="pointer-events-none absolute inset-0 z-0 animate-shimmer rounded-xl"/>
        <div className="relative z-10 flex items-center gap-1">
          <IconComponent isHovered={isHovered} isFlipping={isFlipping || loading} />
           {loading || expired ? (
            <span>{getButtonText()}</span>
          ) : (
            <>
              <span className="block sm:hidden">{textMobile}</span>
              <span className="hidden sm:block">{textDesktop}</span>
            </>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
};

export const LogoutButton = ({ onLogout, loading = false, success = false, error = false, className }) => {
  let buttonText = 'Logout';
  if (loading) buttonText = 'Processing...';
  else if (success) buttonText = 'Logged Out';
  else if (error) buttonText = 'Logout Failed';

  return (
    <GlobalButton
      text={buttonText}
      iconType="logout"
      colorConfig={buttonColorConfigs.logout}
      onClick={onLogout}
      disabled={loading}
      styleOverride={{width: '10rem'}}
    />
  );
};

// color array
export const buttonColorConfigs = {
    newEntry: { id: 'newEntry', baseColor: '#ef4444', schemes: ['linear-gradient(145deg, #ef4444, #b91c1c)', 'linear-gradient(145deg, #f472b6, #db2777)', 'linear-gradient(145deg, #f59e0b, #b45309)', 'linear-gradient(145deg, #d946ef, #a855f7)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    editDelete: { id: 'editDelete', baseColor: '#3b82f6', schemes: ['linear-gradient(145deg, #3b82f6, #1d4ed8)', 'linear-gradient(145deg, #22d3ee, #0891b2)', 'linear-gradient(145deg, #6366f1, #4338ca)', 'linear-gradient(145deg, #a78bfa, #7c3aed)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    verify: { id: 'verify', baseColor: '#22c55e', schemes: ['linear-gradient(145deg, #22c55e, #15803d)', 'linear-gradient(145deg, #4ade80, #16a34a)', 'linear-gradient(145deg, #84cc16, #4d7c0f)', 'linear-gradient(145deg, #a3e635, #65a30d)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    save: { id: 'save', baseColor: '#8b5cf6', schemes: ['linear-gradient(145deg, #8b5cf6, #6d28d9)', 'linear-gradient(145deg, #a855f7, #7e22ce)', 'linear-gradient(145deg, #d946ef, #a21caf)', 'linear-gradient(145deg, #c084fc, #9333ea)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    footsave: { id: 'footsave', baseColor: '#8b5cf6', schemes: ['linear-gradient(145deg, #8b5cf6, #6d28d9)', 'linear-gradient(145deg, #a855f7, #7e22ce)', 'linear-gradient(145deg, #d946ef, #a21caf)', 'linear-gradient(145deg, #c084fc, #9333ea)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    delete: { id: 'delete', baseColor: '#f97316', schemes: ['linear-gradient(145deg, #f97316, #c2410c)', 'linear-gradient(145deg, #eab308, #a16207)', 'linear-gradient(145deg, #dc2626, #991b1b)', 'linear-gradient(145deg, #f59e0b, #d97706)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    clearAll: { id: 'clearAll', baseColor: '#64748b', schemes: ['linear-gradient(145deg, #64748b, #334155)', 'linear-gradient(145deg, #475569, #1e293b)', 'linear-gradient(145deg, #94a3b8, #475569)', 'linear-gradient(145deg, #334155, #0f172a)', 'linear-gradient(145deg, #ff7f50, #ff4500)']},
    logout: { id: 'logout',  baseColor: '#f43f5e', schemes: ['linear-gradient(145deg, #f43f5e, #be123c)', 'linear-gradient(145deg, #fb7185, #e11d48)', 'linear-gradient(145deg, #ef4444, #b91c1c)', 'linear-gradient(145deg, #f87171, #dc2626)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    visualize: { id: 'visualize', baseColor: '#14b8a6', schemes: [ 'linear-gradient(145deg, #14b8a6, #0f766e)','linear-gradient(145deg, #2dd4bf, #0d9488)', 'linear-gradient(145deg, #06b6d4, #0891b2)', 'linear-gradient(145deg, #0ea5e9, #0369a1)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ],},
    dashboard: { id: 'dashboard', baseColor: '#0f172a', schemes: [ 'linear-gradient(145deg, #fcd34d, #f97316)', 'linear-gradient(145deg, #f9a8d4, #f472b6)', 'linear-gradient(145deg, #c4b5fd, #a78bfa)', 'linear-gradient(145deg, #dd6b20, #b45309)','linear-gradient(145deg, #1e3a8a, #3b82f6)', ],},
    google: { id: 'googleAuth', baseColor: '#4285F4', schemes: [ 'linear-gradient(145deg, #0ea5e9, #0284c7)', 'linear-gradient(145deg, #34A853, #188038)', 'linear-gradient(145deg, #EA4335, #c5221f)', 'linear-gradient(145deg, #FBBC05, #f29900)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    verifyEmail: { id: 'verifyEmail', baseColor: '#10b981', schemes: [ 'linear-gradient(145deg, #10b981, #059669)', 'linear-gradient(145deg, #14b8a6, #0d9488)', 'linear-gradient(145deg, #06b6d4, #0284c7)', 'linear-gradient(145deg, #3b82f6, #2563eb)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    copy: { id: 'copy', baseColor: '#10b981', schemes: [ 'linear-gradient(145deg, #10b981, #059669)', 'linear-gradient(145deg, #3b82f6, #2563eb)', 'linear-gradient(145deg, #8b5cf6, #7c3aed)', 'linear-gradient(145deg, #f59e0b, #d97706)','linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    showMore: { id: 'showMore', baseColor: '#10b981', schemes: [ 'linear-gradient(145deg, #34d399, #059669)', 'linear-gradient(145deg, #22d3ee, #0ea5e9)', 'linear-gradient(145deg, #a78bfa, #7c3aed)', 'linear-gradient(145deg, #f472b6, #ec4899)', 'linear-gradient(145deg, #fbbf24, #f59e0b)' ] },
    getStarted: { id: 'getStarted', baseColor: '#f59e0b', schemes: [ 'linear-gradient(145deg, #f59e0b, #d97706)', 'linear-gradient(145deg, #fbbf24, #f59e0b)', 'linear-gradient(145deg, #fb923c, #ea580c)', 'linear-gradient(145deg, #fcd34d, #f97316)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    about: { id: 'about', baseColor: '#6366f1', schemes: ['linear-gradient(145deg, #6366f1, #4338ca)', 'linear-gradient(145deg, #8b5cf6, #7c3aed)', 'linear-gradient(145deg, #a78bfa, #6d28d9)', 'linear-gradient(145deg, #c084fc, #9333ea)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    feedback: { id: 'feedback', baseColor: '#10b981', schemes: ['linear-gradient(145deg, #10b981, #059669)', 'linear-gradient(145deg, #14b8a6, #0d9488)', 'linear-gradient(145deg, #06b6d4, #0891b2)',  'linear-gradient(145deg, #3b82f6, #2563eb)',  'linear-gradient(145deg, #ff7f50, #ff4500)' ] },
    send: { id: 'send', baseColor: '#8b5cf6', schemes: ['linear-gradient(145deg, #8b5cf6, #6d28d9)', 'linear-gradient(145deg, #a855f7, #7e22ce)', 'linear-gradient(145deg, #d946ef, #a21caf)', 'linear-gradient(145deg, #c084fc, #9333ea)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    profile: { id: 'profile', baseColor: '#06b6d4', schemes: ['linear-gradient(145deg, #06b6d4, #0891b2)', 'linear-gradient(145deg, #0ea5e9, #0284c7)', 'linear-gradient(145deg, #14b8a6, #0d9488)', 'linear-gradient(145deg, #22d3ee, #06b6d4)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    update: { id: 'update', baseColor: '#10b981', schemes: ['linear-gradient(145deg, #10b981, #059669)', 'linear-gradient(145deg, #22c55e, #16a34a)','linear-gradient(145deg, #34d399, #10b981)', 'linear-gradient(145deg, #4ade80, #22c55e)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
    cancel: { id: 'cancel', baseColor: '#6b7280', schemes: [ 'linear-gradient(145deg, #6b7280, #4b5563)', 'linear-gradient(145deg, #9ca3af, #6b7280)', 'linear-gradient(145deg, #4b5563, #374151)', 'linear-gradient(145deg, #d1d5db, #9ca3af)', 'linear-gradient(145deg, #ff7f50, #ff4500)' ]},
};

// overall exportss
export const EditDeleteButton = ({ className,...props}) => <GlobalButton text="Edit / Delete" iconType="edit" navigateTo="/history" colorConfig={buttonColorConfigs.editDelete} styleOverride={{width: '10rem'}} {...props} />;
export const NewEntryButton = ({ className, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    try {
      if (window.entriesCount >= 5) {
        // Force scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // If message function exists, always trigger animation again
        if (typeof window.showLimitMessage === 'function') {
          window.showLimitMessage(true); // pass true to force re-animation
        }

        throw new Error('LIMIT_REACHED');
      }

    setTimeout(() => {
  navigate('/footprint');
}, 400);

    } catch (err) {
      if (err.message !== 'LIMIT_REACHED') {
        throw err;
      }
    }
  };
   return ( <GlobalButton text="New Entry" iconType="new" colorConfig={buttonColorConfigs.newEntry} styleOverride={{ width: '10rem' }} onClick={handleClick} {...props} /> );};
export const EditButton = ({ className,...props}) => <GlobalButton text="Edit" iconType="edit" colorConfig={buttonColorConfigs.editDelete} className={className}  styleOverride={{ width: '8rem', height: '3.5rem' }} {...props} />;
export const DeleteButton = ({ className,...props})=> <GlobalButton text="Delete" iconType="delete" colorConfig={buttonColorConfigs.delete} className={className}  styleOverride={{ width: '8rem', height: '3.5rem' }} {...props} />;
export const ClearAllButton = ({ className,...props}) => <GlobalButton text="Clear All" iconType="clear" colorConfig={buttonColorConfigs.clearAll} className={className} styleOverride={{ width: '14rem', height: '4rem', fontSize: '1.1rem' }} {...props} />;
export const SaveChangesButton = ({ className,...props}) => <GlobalButton text="Save Changes" iconType="save" colorConfig={buttonColorConfigs.save} className={className} {...props} />;
export const VerifyButton = ({ className,...props}) => <GlobalButton text="Verify" iconType="verify" colorConfig={buttonColorConfigs.verify} className={className} {...props} />;
export const DashboardButton = ({ text = 'Dashboard', ...props }) => ( <GlobalButton text={text} iconType="dashboard" navigateTo="/dashboard" colorConfig={buttonColorConfigs.dashboard} styleOverride={{ width: '10rem', height: '3.5rem' }} {...props} />);
export const VisualizeButton = ({ entries = [], className, onClick, ...props }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!entries || entries.length === 0) return null;

  const handleMainClick = (e) => {
    e.stopPropagation();
    if (entries.length === 1) {
      setTimeout(() => {
        if (onClick) onClick(entries[0]);
      }, 400);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const handleSelect = (index, e) => {
    e.stopPropagation();
    setOpen(false);
    setTimeout(() => {
      if (onClick) onClick(entries[index]);
    }, 400);
  };

  return (
    <div className="relative flex flex-col items-center" ref={containerRef}>
      {/* Main Visualize button */}
      <GlobalButton
        text="Visualize"
        iconType="visualize"
        colorConfig={buttonColorConfigs.visualize}
        className={className}
        styleOverride={{ width: '10rem', height: '3.5rem', ...props.styleOverride }}
        onClick={handleMainClick}
      />

      {/* Floating panel with secondary buttons */}
      <AnimatePresence>
        {open && entries.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="
              absolute top-[-10rem] sm:top-[-6rem] 
              bg-black/70 backdrop-blur-md rounded-xl shadow-lg p-4 
              flex flex-col  space-y-3 
              max-w-[90vw] sm:max-h-[10rem] max-h-[60vh] 
              overflow-y-auto sm:overflow-x-auto z-50
            "
          >
            {entries.map((entry, i) => {
  const emission = entry.totalEmissionKg ?? 0;
  const [intPart, decimalPart] = emission.toFixed(2).split('.');

  return (
    <GlobalButton
      key={i}
      text={
        <>
          E{i + 1}:{' '}
          <span>
            {intPart}
            <span className="hidden sm:inline">.{decimalPart}</span> kg
          </span>
        </>
      }
      iconType="visualize"
      colorConfig={buttonColorConfigs.visualize}
      styleOverride={{
        width: '10rem',
        height: '3rem',
        fontSize: '0.85rem',
        flex: '0 0 auto',
      }}
      onClick={(e) => handleSelect(i, e)}
    />
  );
})}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export const GoogleAuthButton = ({ text, className = '', disabled = false, ...props }) => {
  const location = useLocation();
  const [showDevMessage, setShowDevMessage] = useState(false);
  
  const routeText = (() => {
    if (location.pathname.endsWith('/login')) return 'Login with Google';
    if (location.pathname.endsWith('/register')) return 'Register with Google';
    return text;
  })();

  const handleGoogleAuth = () => {

    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = isDev 
      ? 'http://localhost:4950' 
      : 'https://cft-cj43.onrender.com';

    const source = (() => {
      if (location.pathname.endsWith('/login')) return 'login';
      if (location.pathname.endsWith('/register')) return 'register';
      return '';
    })();

    const redirectUrl = `${backendUrl}/api/auth/google${source ? `?source=${source}` : ''}`;
    window.location.href = redirectUrl;
  };

  return (
    <>
      <GlobalButton
        text={routeText}
        iconType="GI"
        onClick={handleGoogleAuth}
        disabled={disabled}
        colorConfig={buttonColorConfigs.google}
        {...props}
      />
      
      {/* <AnimatePresence>
        {showDevMessage && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className=" bg-amber-500/90 dark:bg-amber-600/90 text-white px-4 py-2 rounded-xl shadow-lg text-xs sm:text-sm font-intertight text-shadow-DEFAULT text-center z-50"
          >
            <span>🚧 Under Development <span className="animate-pulse">...</span></span>
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
};
export const VerifyEmailButton = ({ className, ...props }) => (
  <GlobalButton
    text="Verify Email"
    iconType="email"
    colorConfig={buttonColorConfigs.verifyEmail}
    className={className}
    styleOverride={{ width: '100%' }}
    {...props}
  />
);
export const CopyButton = ({ textToCopy, className, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlobalButton
      text={copied ? 'Solid Copy!' : 'Copy?'}
      iconType="copy"
      onClick={handleCopy}
      colorConfig={buttonColorConfigs.copy}
      className={className}
      {...props}
    />
  );
};
export const ShowMoreButton = ({ showAll, totalCount, visibleCount, onClick, className, ...props }) => {
  const displayText = showAll 
    ? 'Show Less' 
    : `Show more (${totalCount - visibleCount})`;
  
  const iconType = showAll ? 'showLess' : 'showMore';
  
  return (
    <GlobalButton
      text={displayText}
      iconType={iconType}
      onClick={onClick}
      colorConfig={buttonColorConfigs.showMore}
      className={className}
      styleOverride={{ 
        width: 'auto', 
        minWidth: '12rem',
        height: '3rem',
        fontSize: '0.95rem'
      }}
      {...props}
    />
  );
};
export const GetStartedButton = ({ onDismiss, compact = false, className, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onDismiss) {
      onDismiss();
    }

    try {
      if (window.entriesCount >= 5) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof window.showLimitMessage === 'function') {
          window.showLimitMessage(true);
        }
        throw new Error('LIMIT_REACHED');
      }

      setTimeout(() => {
        navigate('/footprint');
      }, 400);

    } catch (err) {
      if (err.message !== 'LIMIT_REACHED') {
        throw err;
      }
    }
  };

  return (
    <GlobalButton
      text={compact ? "Let's Start " : "Got it! Let's Start "}
      iconType="rocket"
      colorConfig={buttonColorConfigs.getStarted}
      onClick={handleClick}
      tooltipText="Create your first entry"
      styleOverride={compact ? { 
        width: '10rem',
        height: '3rem',
        fontSize: '0.85rem'
      } : { 
        width: '20%'
      }}
      className={className}
      {...props}
    />
  );
};
export const AboutButton = ({ className, ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    setTimeout(() => {
      navigate('/about');
    }, 400);
  };

  return (
    <GlobalButton
      text="About"
      iconType="info"
      colorConfig={buttonColorConfigs.about}
      onClick={handleClick}
      tooltipText="Know more about CFT" 
      styleOverride={{ 
        width: '7rem',
        height: '3rem',
        fontSize: '0.85rem'
      }}
      className={className}
      {...props}
    />
  );
};
export const FeedbackButton = ({ className, compact = false, userEmail, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
useEffect(() => {
  const app = document.getElementById("app-container");
  if (!app) return;

  if (isOpen) {
    app.style.filter = "blur(5px)";        // <--- BLUR APPLIED
  } else {
    app.style.filter = "";        // <--- RESET BLUR
  }

  return () => {
    app.style.filter = "";
  };
}, [isOpen]);


  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setErrorMessage('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitStatus(null);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const isDev = process.env.NODE_ENV === 'development';
      const backendUrl = isDev 
        ? 'http://localhost:4950' 
        : 'https://api.carbonft.app';

      const response = await fetch(`${backendUrl}/api/auth/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ feedback })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFeedback('');
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFeedback('');
    setSubmitStatus(null);
    setErrorMessage('');
  };

  return (
    <>
      <GlobalButton
        text={compact ? "Feedback" : "Send Feedback"}
        iconType="feedback"
        colorConfig={buttonColorConfigs.feedback}
        onClick={() => setIsOpen(true)}
        styleOverride={compact ? { 
          width: '8rem',
          height: '3rem',
          fontSize: '0.85rem'
        } : {
          width: '10rem',
          height: '3.5rem'
        }}
        className={className}
        userEmail={userEmail}
        {...props}
      />

      {/* Feedback Modal Overlay */}
      <AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800/90 rounded-3xl border border-white/10 w-full max-w-md overflow-hidden"
      >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-3 sm:p-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Icons.feedback isFlipping={false} isHovered={false} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white font-sriracha tracking-wide text-shadow-DEFAULT truncate">Send Feedback</h3>
                      <p className="text-xs text-gray-400 text-shadow-DEFAULT hidden sm:block">We'd love to hear from you!</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
                  >
                    <Icons.close isFlipping={false} isHovered={false} />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-6 sm:py-8 tracking-wide text-shadow-DEFAULT"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                      <Icons.verify isFlipping={false} isHovered={false} />
                    </motion.div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-2 font-sriracha">Thanks for your feedback!</h4>
                    <p className="text-gray-400 text-sm">We'll review it carefully.</p>
                  </motion.div>
                ) : (
                  <>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or report issues..."
                      className="w-full h-28 sm:h-32 bg-black/40 border border-white/10 rounded-xl p-3 sm:p-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-intertight"
                      disabled={isSubmitting}
                    />
                    
                    {errorMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs sm:text-sm mt-2"
                      >
                        {errorMessage}
                      </motion.p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClose}
                        className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-gray-800/50 border border-white/10 text-gray-300 font-semibold font-sriracha hover:bg-gray-800 transition-colors text-sm sm:text-base"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </motion.button>
                      
                      <div className="w-full sm:flex-1">
                        <GlobalButton
                          text={isSubmitting ? 'Sending...' : 'Send'}
                          iconType="send"
                          colorConfig={buttonColorConfigs.send}
                          onClick={handleSubmit}
                          disabled={isSubmitting || !feedback.trim()}
                          styleOverride={{ 
                            width: '100%',
                            height: '2.75rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center">
                      Limited to 1 submission per day.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export const ProfileButton = ({ className, ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    setTimeout(() => {
      navigate('/profile');
    }, 400);
  };

  return (
    <GlobalButton
      text="Profile"
      iconType="profile"
      colorConfig={buttonColorConfigs.profile}
      onClick={handleClick}
      styleOverride={{ 
        width: '10rem',
        height: '3rem',
        fontSize: '0.99rem'
      }}
      className={className}
      {...props}
    />
  );
};
export const UpdateButton = ({ className, ...props }) => (
  <GlobalButton
    text="Confirm"
    iconType="check"
    colorConfig={buttonColorConfigs.update}
    styleOverride={{
  height: '3rem',
  padding: '0',
  width: '7rem',
}}
    className={className}
    {...props}
  />
);
export const CancelButton = ({ className, ...props }) => (
  <GlobalButton
    text="Cancel"
    iconType="cancel"
    colorConfig={buttonColorConfigs.cancel}
    styleOverride={{
  height: '3rem',
  padding: '0',
  width: '7rem',
}}
    className={className}
    {...props}
  />
);
export const ProfileEditButton = ({ onClick, className, ...props }) => (
  <GlobalButton
    text="Edit"
    iconType="edit"
    colorConfig={buttonColorConfigs.editDelete}
    onClick={onClick}
    styleOverride={{ 
      width: '10rem',
      height: '3rem',
      fontSize: '0.85rem'
    }}
    className={className}
    {...props}
  />
);
export { StyleInjector };