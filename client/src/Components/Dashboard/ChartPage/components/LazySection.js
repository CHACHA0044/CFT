import React, { Suspense } from 'react';
import useLazyMount from '../hooks/useLazyMount';
import SectionSkeleton from './skeletons/SectionSkeleton';

const LazySection = ({
  children,
  fallback: Fallback,
  minHeight = '200px',
  rootMargin = '200px 0px',
  className = ''
}) => {
  const [ref, isVisible] = useLazyMount({ rootMargin });
  const FallbackComponent = Fallback || SectionSkeleton;

  return (
    <div ref={ref} className={className} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? (
        <Suspense fallback={<FallbackComponent />}>
          {children}
        </Suspense>
      ) : (
        <FallbackComponent />
      )}
    </div>
  );
};

export default React.memo(LazySection);
