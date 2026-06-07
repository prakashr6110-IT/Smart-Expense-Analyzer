/**
 * Professional InitialsAvatar component.
 * Shows the user's first letter(s) in a styled circular badge.
 * No external APIs, no storage, no DB, no uploads.
 */

// Extract a display-friendly name from email or user data
export const getUserDisplayName = (user, profile) => {
  if (profile?.full_name) return profile.full_name;
  if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
  if (user?.user_metadata?.name) return user.user_metadata.name;
  if (user?.email) {
    const prefix = user.email.split('@')[0];
    return prefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  }
  if (user?.id) return user.id.substring(0, 8);
  return 'User';
};

// Generate a consistent gradient color pair based on name hash
const GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-indigo-500 to-indigo-700',
  'from-pink-500 to-pink-700',
  'from-teal-500 to-teal-700',
  'from-cyan-500 to-cyan-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-sky-500 to-sky-700',
  'from-fuchsia-500 to-fuchsia-700',
];

const getGradient = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

const getInitials = (displayName) => {
  const parts = displayName.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || 'U').toUpperCase();
};

const SIZE_CONFIG = {
  sm: { ring: 'ring-2', size: 'w-8 h-8', text: 'text-xs font-bold' },
  md: { ring: 'ring-2', size: 'w-10 h-10 sm:w-12 sm:h-12', text: 'text-sm sm:text-base font-bold' },
  lg: { ring: 'ring-3', size: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-2xl sm:text-3xl font-bold' },
  xl: { ring: 'ring-4', size: 'w-20 h-20 sm:w-24 sm:h-24', text: 'text-3xl sm:text-4xl font-bold' },
};

const UserAvatar = ({
  user,
  profile,
  size = 'md',
  showName = false,
  namePosition = 'right',
  className = '',
  ringColor = 'ring-accent-primary/50',
}) => {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const displayName = getUserDisplayName(user, profile);
  const initials = getInitials(displayName);
  const gradient = getGradient(displayName);

  const avatarElement = (
    <div
      className={`relative rounded-full ${config.ring} ${ringColor} shadow-lg shadow-accent-primary/10 overflow-hidden bg-gradient-to-br ${gradient} transition-all duration-300 hover:shadow-xl hover:shadow-accent-primary/20 hover:scale-105 flex-shrink-0 flex items-center justify-center select-none ${className}`}
      title={displayName}
    >
      <span className={`${config.size} ${config.text} flex items-center justify-center text-white leading-none`}>
        {initials}
      </span>
    </div>
  );

  if (!showName) return avatarElement;

  if (namePosition === 'below') {
    return (
      <div className="flex flex-col items-center gap-2">
        {avatarElement}
        <span className="font-semibold text-txt-primary text-center leading-tight">
          {displayName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {avatarElement}
      <span className="font-semibold text-txt-primary leading-tight">
        {displayName}
      </span>
    </div>
  );
};

export default UserAvatar;
