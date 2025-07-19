import {
  BarChart3,
  CheckCircle,
  Target,
  PartyPopper,
  TrendingUp,
  Gift,
  Plus,
  Building2,
  Settings,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Menu,
  Home,
  User,
  LogOut,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  Check,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Bookmark,
  BookmarkPlus,
  Tag,
  DollarSign,
  Percent,
} from 'lucide-react';

// Dashboard-specific icon mapping
export const DashboardIcons = {
  // Analytics icons
  analytics: BarChart3,
  views: BarChart3,
  claims: CheckCircle,
  conversion: Target,
  redeemed: PartyPopper,
  redemption: TrendingUp,
  rewards: Gift,
  
  // Quick action icons
  create: Plus,
  addBusiness: Building2,
  settings: Settings,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  
  // Navigation
  arrowRight: ArrowRight,
  arrowLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  menu: Menu,
  home: Home,
  
  // User & Auth
  user: User,
  users: Users,
  logout: LogOut,
  lock: Lock,
  unlock: Unlock,
  
  // Contact & Location
  mail: Mail,
  phone: Phone,
  globe: Globe,
  mapPin: MapPin,
  
  // Content & Media
  calendar: Calendar,
  clock: Clock,
  star: Star,
  heart: Heart,
  share: Share2,
  copy: Copy,
  externalLink: ExternalLink,
  
  // Alerts & Feedback
  alert: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertTriangle,
  
  // Loading & States
  loading: Loader2,
  refresh: RefreshCw,
  
  // Media Controls
  play: Play,
  pause: Pause,
  volume: Volume2,
  mute: VolumeX,
  maximize: Maximize2,
  minimize: Minimize2,
  rotateLeft: RotateCcw,
  rotateRight: RotateCw,
  zoomIn: ZoomIn,
  zoomOut: ZoomOut,
  
  // Data & Lists
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,
  grid: Grid,
  list: List,
  bookmark: Bookmark,
  bookmarkAdd: BookmarkPlus,
  tag: Tag,
  
  // Financial
  dollar: DollarSign,
  percent: Percent,
};

// Type for icon names
export type DashboardIconName = keyof typeof DashboardIcons;

// Dashboard icon component with consistent styling
interface DashboardIconProps {
  name: DashboardIconName;
  size?: number;
  className?: string;
  color?: string;
}

export function DashboardIcon({ name, size = 24, className = "", color }: DashboardIconProps) {
  const IconComponent = DashboardIcons[name];
  
  if (!IconComponent) {
    console.warn(`Dashboard icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className}
      color={color}
    />
  );
}

// Convenience components for common icon sizes
export const DashboardIconSm = ({ name, className, color }: Omit<DashboardIconProps, 'size'>) => (
  <DashboardIcon name={name} size={16} className={className} color={color} />
);

export const DashboardIconMd = ({ name, className, color }: Omit<DashboardIconProps, 'size'>) => (
  <DashboardIcon name={name} size={24} className={className} color={color} />
);

export const DashboardIconLg = ({ name, className, color }: Omit<DashboardIconProps, 'size'>) => (
  <DashboardIcon name={name} size={32} className={className} color={color} />
);

export const DashboardIconXl = ({ name, className, color }: Omit<DashboardIconProps, 'size'>) => (
  <DashboardIcon name={name} size={48} className={className} color={color} />
);

// Export individual icons for direct use
export {
  BarChart3,
  CheckCircle,
  Target,
  PartyPopper,
  TrendingUp,
  Gift,
  Plus,
  Building2,
  Settings,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Menu,
  Home,
  User,
  LogOut,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  Check,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Bookmark,
  BookmarkPlus,
  Tag,
  DollarSign,
  Percent,
}; 