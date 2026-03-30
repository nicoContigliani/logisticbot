// ============================================
// MUI Compatibility Layer
// Maps old @mui/material imports to new Metro components
// This allows gradual migration without breaking existing code
// ============================================

import * as Metro from './metro';

// Re-export all Metro components with MUI-compatible names
export const Box = Metro.Box;
export const Container = Metro.Container;
export const Flex = Metro.Flex;
export const Grid = Metro.Grid;
export const Typography = Metro.Typography;
export const Button = Metro.Button;
export const IconButton = Metro.IconButton;
export const Input = Metro.Input;
export const TextField = Metro.Input; // Alias
export const Select = Metro.Select;
export const Checkbox = Metro.Checkbox;
export const Card = Metro.Card;
export const Paper = Metro.Paper;
export const Divider = Metro.Divider;
export const Spacer = Metro.Spacer;
export const Dialog = Metro.Dialog;
export const Tabs = Metro.Tabs;
export const Tab = Metro.Tab;
export const Menu = Metro.Menu;
export const MenuItem = Metro.MenuItem;
export const Alert = Metro.Alert;
export const Chip = Metro.Chip;
export const Badge = Metro.Badge;
export const CircularProgress = Metro.CircularProgress;
export const LinearProgress = Metro.LinearProgress;
export const Skeleton = Metro.Skeleton;
export const Table = Metro.Table;
export const TableHead = Metro.TableHead;
export const TableBody = Metro.TableBody;
export const TableRow = Metro.TableRow;
export const TableCell = Metro.TableCell;
export const List = Metro.List;
export const ListItem = Metro.ListItem;
export const Avatar = Metro.Avatar;
export const Backdrop = Metro.Backdrop;

// Form controls
export const TextFieldProps = Metro.Input;
export const FormControlLabel = Metro.Checkbox;
export const FormControl = Metro.Box;
export const FormGroup = Metro.Box;
export const InputLabel = Metro.Typography;
export const InputBase = Metro.Input;

// Layout extras
export const Stack = Metro.Flex;
export const Grid2 = Metro.Grid;
export const Collapse = Metro.Box;
export const Portal = Metro.Box;

// Additional MUI components we need to mock
export const Drawer = Metro.Box;
export const AppBar = Metro.Box;
export const Toolbar = Metro.Box;
export const Tooltip = Metro.Box;
export const Popover = Metro.Box;
export const Modal = Metro.Dialog;
export const Fade = Metro.Fade;

// Icons (placeholder - simple emoji/text icons)
export const icons = {
  Add: () => '+',
  Delete: () => '🗑',
  Edit: () => '✏️',
  CheckCircle: () => '✓',
  RadioButtonUnchecked: () => '○',
  PlayArrow: () => '▶',
  ContentCopy: () => '📋',
  AutoAwesome: () => '✨',
  Psychology: () => '🧠',
  Person: () => '👤',
  Download: () => '⬇️',
  Upload: () => '⬆️',
  ExpandMore: () => '▼',
  School: () => '🏫',
  CalendarMonth: () => '📅',
  Language: () => '🌐',
  Calculate: () => '🔢',
  Science: () => '🔬',
  Code: () => '💻',
  HistoryEdu: () => '📜',
  ArrowForward: () => '→',
  ArrowBack: () => '←',
  Check: () => '✓',
  Close: () => '×',
  Menu: () => '☰',
  Settings: () => '⚙️',
  Star: () => '⭐',
  StarBorder: () => '☆',
  Home: () => '🏠',
  Search: () => '🔍',
  Notifications: () => '🔔',
  Email: () => '📧',
  Lock: () => '🔒',
  Visibility: () => '👁',
  MoreVert: () => '⋮',
  Refresh: () => '🔄',
};

// For backward compatibility
export default {
  Box,
  Container,
  Flex,
  Grid,
  Typography,
  Button,
  IconButton,
  Input,
  TextField,
  Select,
  Checkbox,
  Card,
  Paper,
  Divider,
  Spacer,
  Dialog,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Alert,
  Chip,
  Badge,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  Avatar,
  Backdrop,
  icons,
};