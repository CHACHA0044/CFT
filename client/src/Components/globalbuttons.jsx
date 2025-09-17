import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

const saveButtonState = (userEmail, newState) => {
  try {
    const key = `buttonState_${userEmail || 'guest'}`;
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString(); // 1 year expiry
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
      JSON.stringify(newState)
    )}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error("Failed to save button state:", e);
  }
};

const StyleInjector = () => {
  // useEffect(() => {
  //   // Restart shimmer animations on mount
  //   const restartAnimations = () => {
  //     document.querySelectorAll(".animate-shimmer").forEach(el => {
  //       el.style.animation = "none";
  //       // Trigger reflow to reset animation
  //       void el.offsetWidth;
  //       el.style.animation = "";
  //     });
  //   };

  //   restartAnimations();
  // }, []);

  const styles = `
    @keyframes shimmer-effect-metallic {
      0% {
        transform: translateX(-150%) skewX(-30deg);
      }
      100% {
        transform: translateX(250%) skewX(-30deg);
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

const Icons = {
  new: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></motion.svg>,
  edit: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></motion.svg>,
  delete: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></motion.svg>,
  save: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></motion.svg>,
  verify: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></motion.svg>,
  clear: ({ isFlipping, isHovered }) => <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 3.5 12.5"/><path d="M2 12.5a10 10 0 0 0 18.5-1"/></motion.svg>,
  logout: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></motion.svg>),
  visualize: ({ isFlipping, isHovered }) => ( <motion.svg animate={ isFlipping ? { rotateY: [0, 180, 360] } : isHovered ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }} transition={isFlipping ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.4 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <circle cx="12" cy="12" r="10" />  <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /> <circle cx="12" cy="12" r="3" /> </motion.svg>),
};

const GlobalButton = ({ text, iconType, onClick, disabled = false, colorConfig, navigateTo, type, styleOverride, userEmail }) => {
    const [isHovered, setIsHovered] = useState(false);
const [isFlipping, setIsFlipping] = useState(false);

useEffect(() => {
  if (disabled && text === 'Processing...') {
    setIsFlipping(true);  // start continuous flip while loading
  } else {
    setIsFlipping(false); // stop flip when not loading
  }
}, [disabled, text]);

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
}, delay); // delay matches flip duration
    };

    const tapAnimation = {
  scale: 0.90,
  y: 2,
 boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
  filter: "brightness(1.15)",
  transition: { type: 'spring', stiffness: 500, damping:26}
};

const glowColor = currentScheme.includes('linear-gradient')
  ? currentScheme.match(/#([0-9a-f]{3,8})/i)?.[0] || baseColor
  : currentScheme;

    return (
        <motion.div className="relative" onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
          <motion.button
        type={type || "button"}
        whileTap={tapAnimation}
        whileHover={{
        scale: 1.05,
        rotateX: 2, rotateY: -2,
        boxShadow: `
    0 0 20px ${glowColor}80,
    0 0 10px ${glowColor}80,
    inset 0 2px 4px rgba(255,255,255,0.1),
    inset 0 -3px 6px rgba(0,0,0,0.4)
  `,
        transition: {
        scale: { type: 'spring', stiffness: 1000, damping: 30 },
        boxShadow: { duration: 0.1 } }}}
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
      0 6px 12px rgba(0,0,0,0.35),           /* Strong base shadow */
      inset 0 2px 4px rgba(255,255,255,0.15), /* Top light highlight */
      inset 0 -3px 6px rgba(0,0,0,0.4)        /* Bottom depth */
    `,
  backdropFilter: isTransparent ? 'none' : 'blur(2px)',
          color: isTransparent ? baseColor : 'white',
          transition: 'background 0.4s, border 0.4s, color 0.4s ',
          ...styleOverride, // <- Applied styleOverride here
        }}
      >
   <div className="animate-shimmer ring-1 ring-white/10 transition-opacity duration-300" style={{ opacity: isTransparent ? 0 : 1 }} />
                <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                    <IconComponent isFlipping={isFlipping} isHovered={isHovered} />
                    <span>{text}</span>
                </div>
            </motion.button>
        </motion.div>
    );
};
// --- FORM SUBMISSION BUTTONS ---

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
export const HomeHeaderButton = ({ text, navigateTo, iconType }) => {

  const [isFlipping, setIsFlipping] = useState(false);
  const IconComponent = Icons[iconType] || (() => null);
  const [isHovered, setIsHovered] = useState(false);

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

      className="
  relative flex items-center justify-center gap-2
  h-6 px-2 text-sm
  sm:h-10 sm:px-5 sm:text-base
  md:h-12 md:px-6 md:text-lg
  sm:rounded-xl rounded-lg font-semibold font-sriracha sm:tracking-wide shadow-lg overflow-hidden dark:text-gray-100 text-emerald-500 
"

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
  // The class list remains the same to ensure it's a drop-in replacement.
  // The key class 'animate-shimmer' now applies the new, improved glossy effect.
  className="pointer-events-none absolute inset-0 z-0 animate-shimmer rounded-xl"
  
  // The inline 'style' attribute with 'maskImage' is no longer necessary.
  // The improved CSS in the new 'StyleInjector' creates a superior gradient
  // and metallic effect on its own. Removing the mask simplifies the code
  // and allows the new 'mix-blend-mode' to work correctly.
/>


      {/* Icon + Text */}
      <div className="relative z-10 flex items-center gap-1">
        <IconComponent isHovered={isHovered} isFlipping={isFlipping} />
        <span>{text}</span>
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


// --- PRE-CONFIGURED BUTTONS FOR EASY USE ---

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
};

// Dashboard Button
export const EditDeleteButton = ({ className,...props}) => <GlobalButton text="Edit / Delete" iconType="edit" navigateTo="/history" colorConfig={buttonColorConfigs.editDelete} styleOverride={{width: '10rem'}} {...props} />;

// History Page Buttons (or anywhere else)
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

  return (
    <GlobalButton
      text="New Entry"
      iconType="new"
      colorConfig={buttonColorConfigs.newEntry}
      styleOverride={{ width: '10rem' }}
      onClick={handleClick}
      {...props}
    />
  );
};

export const EditButton = ({ className,...props}) => <GlobalButton text="Edit" iconType="edit" colorConfig={buttonColorConfigs.editDelete} className={className}  styleOverride={{ width: '8rem', height: '3.5rem' }} {...props} />;
export const DeleteButton = ({ className,...props})=> <GlobalButton text="Delete" iconType="delete" colorConfig={buttonColorConfigs.delete} className={className}  styleOverride={{ width: '8rem', height: '3.5rem' }} {...props} />;
export const ClearAllButton = ({ className,...props}) => <GlobalButton text="Clear All" iconType="clear" colorConfig={buttonColorConfigs.clearAll} className={className} styleOverride={{ width: '14rem', height: '4rem', fontSize: '1.1rem' }} {...props} />;
export const SaveChangesButton = ({ className,...props}) => <GlobalButton text="Save Changes" iconType="save" colorConfig={buttonColorConfigs.save} className={className} {...props} />;
export const VerifyButton = ({ className,...props}) => <GlobalButton text="Verify" iconType="verify" colorConfig={buttonColorConfigs.verify} className={className} {...props} />;

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
              flex flex-col sm:space-x-3 space-y-3 sm:space-y-0 
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


// You must include the StyleInjector once in your main App layout
export { StyleInjector };