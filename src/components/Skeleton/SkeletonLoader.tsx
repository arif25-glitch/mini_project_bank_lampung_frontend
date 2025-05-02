import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  type?: 'text' | 'title' | 'avatar' | 'thumbnail' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  type = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  // Generate width and height styles based on the prop or default for type
  const getStyle = () => {
    const style: React.CSSProperties = {};
    
    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }
    
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }
    
    // Default sizes based on type
    if (!width) {
      switch (type) {
        case 'title':
          style.width = '70%';
          style.height = '28px';
          break;
        case 'text':
          style.width = '100%';
          style.height = '16px';
          break;
        case 'avatar':
          style.width = '50px';
          style.height = '50px';
          style.borderRadius = '50%';
          break;
        case 'thumbnail':
          style.width = '100%';
          style.height = '200px';
          break;
        case 'circle':
          style.width = '50px';
          style.height = '50px';
          style.borderRadius = '50%';
          break;
        case 'rect':
          style.width = '100%';
          style.height = '80px';
          break;
      }
    }
    
    return style;
  };

  // Generate skeleton items based on count
  const renderSkeleton = () => {
    return Array(count).fill(0).map((_, index) => (
      <div 
        key={index} 
        className={`skeleton-item skeleton-${type} ${className}`} 
        style={getStyle()} 
      />
    ));
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;