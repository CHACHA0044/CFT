import { useState, useEffect, useRef } from 'react';

const useLazyMount = (options = {}) => {
  const {
    rootMargin = '200px 0px',
    threshold = 0,
    once = true
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, once]);

  return [ref, isVisible];
};

export default useLazyMount;
