import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  onClick,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: '',
  };
  
  const baseClasses = 'bg-white rounded-2xl transition-all duration-200';
  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card; 