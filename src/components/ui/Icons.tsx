import {
  Plus,
  BarChart3,
  Building2,
  Settings,
  CheckCircle,
  Search,
  FileText,
  Gift,
  Smartphone,
  Target,
  Zap,
  TrendingUp,
  Award,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  X,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
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

// Icon mapping for common use cases
export const Icons = {
  // Business & Analytics
  analytics: BarChart3,
  business: Building2,
  settings: Settings,
  create: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  download: Download,
  upload: Upload,
  
  // Status & Actions
  success: CheckCircle,
  check: Check,
  search: Search,
  target: Target,
  zap: Zap,
  trending: TrendingUp,
  award: Award,
  gift: Gift,
  smartphone: Smartphone,
  
  // Navigation
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  menu: Menu,
  home: Home,
  close: X,
  
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
  file: FileText,
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
  
  // Legacy emoji replacements
  add: Plus,
  chart: BarChart3,
  building: Building2,
  gear: Settings,
  checkmark: CheckCircle,
  magnifying: Search,
  document: FileText,
  present: Gift,
  mobile: Smartphone,
  bullseye: Target,
  lightning: Zap,
  graph: TrendingUp,
  trophy: Award,
  people: Users,
  location: MapPin,
  email: Mail,
  telephone: Phone,
  world: Globe,
  rightArrow: ArrowRight,
  leftArrow: ArrowLeft,
  exit: X,
  pencil: Edit,
  trash: Trash2,
  viewIcon: Eye,
  save: Download,
  send: Upload,
  date: Calendar,
  time: Clock,
  favorite: Star,
  like: Heart,
  shareIcon: Share2,
  duplicate: Copy,
  link: ExternalLink,
  dropdown: ChevronDown,
  upArrow: ChevronUp,
  nextArrow: ChevronRight,
  prevArrow: ChevronLeft,
  hamburger: Menu,
  house: Home,
  person: User,
  signout: LogOut,
  secure: Lock,
  unsecure: Unlock,
  notification: AlertCircle,
  information: Info,
  caution: AlertTriangle,
  successIcon: Check,
  triangle: AlertTriangle,
  spinner: Loader2,
  reload: RefreshCw,
  start: Play,
  stop: Pause,
  sound: Volume2,
  silent: VolumeX,
  expand: Maximize2,
  contract: Minimize2,
  turnLeft: RotateCcw,
  turnRight: RotateCw,
  enlarge: ZoomIn,
  shrink: ZoomOut,
  funnel: Filter,
  upSort: SortAsc,
  downSort: SortDesc,
  gridView: Grid,
  listView: List,
  saveIcon: Bookmark,
  saveAdd: BookmarkPlus,
  label: Tag,
  money: DollarSign,
  percentage: Percent,
};

// Type for icon names
export type IconName = keyof typeof Icons;

// Icon component with consistent styling
interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

export function Icon({ name, size = 24, className = "", color }: IconProps) {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
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
export const IconSm = ({ name, className, color }: Omit<IconProps, 'size'>) => (
  <Icon name={name} size={16} className={className} color={color} />
);

export const IconMd = ({ name, className, color }: Omit<IconProps, 'size'>) => (
  <Icon name={name} size={24} className={className} color={color} />
);

export const IconLg = ({ name, className, color }: Omit<IconProps, 'size'>) => (
  <Icon name={name} size={32} className={className} color={color} />
);

export const IconXl = ({ name, className, color }: Omit<IconProps, 'size'>) => (
  <Icon name={name} size={48} className={className} color={color} />
);

// Export individual icons for direct use
export {
  Plus,
  BarChart3,
  Building2,
  Settings,
  CheckCircle,
  Search,
  FileText,
  Gift,
  Smartphone,
  Target,
  Zap,
  TrendingUp,
  Award,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  X,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
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