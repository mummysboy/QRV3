"use client";



interface DefaultLogoProps {
  businessName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function DefaultLogo({ businessName, size = 'md', className = '' }: DefaultLogoProps) {
  // Generate initials from business name
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'QR';
    
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first two letters
      return name.substring(0, 2).toUpperCase();
    } else {
      // Multiple words - take first letter of each word
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    }
  };

  // Generate a consistent color based on business name
  const getColorFromName = (name: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-violet-600',
      'from-orange-500 to-red-600',
      'from-teal-500 to-cyan-600',
      'from-pink-500 to-rose-600',
      'from-yellow-500 to-amber-600',
      'from-indigo-500 to-blue-600',
      'from-emerald-500 to-green-600',
      'from-violet-500 to-purple-600',
    ];
    
    // Simple hash function to get consistent color for same business name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(businessName);
  const gradientClass = getColorFromName(businessName);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-28 h-28 text-2xl',
  };

  return (
    <div 
      className={`
        rounded-full bg-gradient-to-br ${gradientClass} 
        flex items-center justify-center text-white font-bold shadow-lg
        ${sizeClasses[size]} ${className}
      `}
    >
      {initials}
    </div>
  );
} 