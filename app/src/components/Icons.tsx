import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const defaultProps = {
  size: 24,
  color: colors.text,
  strokeWidth: 1.5,
};

export const SearchIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const HeartIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const HeartFilledIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

export const MessageIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export const MapPinIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

export const StarIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

export const StarOutlineIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="15 18 9 12 15 6" />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const ShareIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <Polyline points="16 6 12 2 8 6" />
    <Line x1="12" y1="2" x2="12" y2="15" />
  </Svg>
);

export const FilterIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="4" y1="21" x2="4" y2="14" />
    <Line x1="4" y1="10" x2="4" y2="3" />
    <Line x1="12" y1="21" x2="12" y2="12" />
    <Line x1="12" y1="8" x2="12" y2="3" />
    <Line x1="20" y1="21" x2="20" y2="16" />
    <Line x1="20" y1="12" x2="20" y2="3" />
    <Line x1="1" y1="14" x2="7" y2="14" />
    <Line x1="9" y1="8" x2="15" y2="8" />
    <Line x1="17" y1="16" x2="23" y2="16" />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

export const SendIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="22" y1="2" x2="11" y2="13" />
    <Path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const XIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

export const DollarIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="1" x2="12" y2="23" />
    <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

export const FlagIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <Line x1="4" y1="22" x2="4" y2="15" />
  </Svg>
);

export const MapIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <Line x1="8" y1="2" x2="8" y2="18" />
    <Line x1="16" y1="6" x2="16" y2="22" />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

// ─── Help & Contact Icons ─────────────────────────────

export const MailIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <Polyline points="22,6 12,13 2,6" />
  </Svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <Polyline points="15 3 21 3 21 9" />
    <Line x1="10" y1="14" x2="21" y2="3" />
  </Svg>
);

export const AlertCircleIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="12" />
    <Line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
);

export const AccessibilityIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="4" r="1.5" />
    <Path d="M7 8h10" />
    <Path d="M12 8v4" />
    <Path d="M9 20l3-8 3 8" />
  </Svg>
);

// ─── Profile Menu Icons ───────────────────────────────

export const HelpCircleIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const ShieldIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const FileTextIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Polyline points="14 2 14 8 20 8" />
    <Line x1="16" y1="13" x2="8" y2="13" />
    <Line x1="16" y1="17" x2="8" y2="17" />
    <Polyline points="10 9 9 9 8 9" />
  </Svg>
);

export const LogOutIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Polyline points="16 17 21 12 16 7" />
    <Line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const UsersIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

// ─── Category Icons (for HomeScreen) ──────────────────

export const TrendingIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <Polyline points="17 6 23 6 23 12" />
  </Svg>
);

export const TruckIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="1" y="3" width="15" height="13" rx="2" />
    <Path d="M16 8h4l3 3v5h-7V8z" />
    <Circle cx="5.5" cy="18.5" r="2.5" />
    <Circle cx="18.5" cy="18.5" r="2.5" />
  </Svg>
);

export const MusicIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18V5l12-2v13" />
    <Circle cx="6" cy="18" r="3" />
    <Circle cx="18" cy="16" r="3" />
  </Svg>
);

export const UtensilsIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <Path d="M7 2v20" />
    <Path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </Svg>
);

export const RingsIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="14" r="6" />
    <Path d="M12 8L9 4h6l-3 4z" />
    <Line x1="9" y1="4" x2="7" y2="2" />
    <Line x1="15" y1="4" x2="17" y2="2" />
  </Svg>
);

export const SparklesIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <Path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
    <Path d="M6 17l.5 1.5L8 19l-1.5.5L6 21l-.5-1.5L4 19l1.5-.5L6 17z" />
  </Svg>
);

// ─── Analytics & Editing Icons ───────────────────────

export const TrendingUpIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <Polyline points="17 6 23 6 23 12" />
  </Svg>
);

export const TrendingDownIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <Polyline points="17 18 23 18 23 12" />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

export const BarChartIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="20" x2="12" y2="10" />
    <Line x1="18" y1="20" x2="18" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="16" />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="3 6 5 6 21 6" />
    <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);

export const EditPencilIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

export const AwardIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="8" r="7" />
    <Polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </Svg>
);

export const RefreshCwIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Polyline points="23 4 23 10 17 10" />
    <Polyline points="1 20 1 14 7 14" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Svg>
);

export const BellFilledIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);

export const BookmarkFilledIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);

export const TrophyIcon: React.FC<IconProps> = ({
  size = defaultProps.size, color = defaultProps.color, strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 9H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
    <Path d="M18 9h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3" />
    <Path d="M6 4h12v6a6 6 0 0 1-12 0V4z" />
    <Path d="M10 16h4" />
    <Path d="M12 16v4" />
    <Path d="M8 20h8" />
  </Svg>
);

// Dashboard icon for vendor tab (bar chart style)
export const DashboardIcon: React.FC<IconProps> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  strokeWidth = defaultProps.strokeWidth,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="3" width="7" height="7" />
    <Rect x="14" y="3" width="7" height="7" />
    <Rect x="14" y="14" width="7" height="7" />
    <Rect x="3" y="14" width="7" height="7" />
  </Svg>
);
