import type { IconType } from "react-icons/lib";
import { Mail, Globe } from "lucide-react";
import {
  SiGithub,
  SiInstagram,
  SiLeetcode,
  SiX,
  SiFacebook,
  SiReddit,
  SiYoutube,
  SiTiktok,
  SiDiscord,
  SiTwitch,
  SiSpotify,
  SiTelegram,
  SiWhatsapp,
  SiMedium,
  SiDevdotto,
  SiBehance,
  SiDribbble,
  SiStackoverflow,
  SiPinterest,
  SiThreads,
  SiGitlab,
  SiCodeforces,
  SiHackerrank,
  SiKaggle,
  SiSnapchat,
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";

export interface PlatformDef {
  key: string;
  label: string;
  icon: IconType;
  /** Official (or closest widely-recognized) brand color, used as the icon's fill. */
  color: string;
  placeholder: string;
}

// Brand colors aren't bundled with react-icons — Simple Icons ships them as
// separate metadata we don't pull in, so each is hand-set from the platform's
// published brand guidelines. LinkedIn's mark comes from react-icons/fa6
// (Font Awesome) because Simple Icons stopped shipping it after a takedown
// request; everything else uses Simple Icons for a closer official match.
export const PLATFORMS: Record<string, PlatformDef> = {
  github: { key: "github", label: "GitHub", icon: SiGithub, color: "#e6edf3", placeholder: "https://github.com/username" },
  linkedin: { key: "linkedin", label: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", placeholder: "https://linkedin.com/in/username" },
  instagram: { key: "instagram", label: "Instagram", icon: SiInstagram, color: "#E4405F", placeholder: "https://instagram.com/username" },
  leetcode: { key: "leetcode", label: "LeetCode", icon: SiLeetcode, color: "#FFA116", placeholder: "https://leetcode.com/u/username" },
  x: { key: "x", label: "X", icon: SiX, color: "#e6edf3", placeholder: "https://x.com/username" },
  facebook: { key: "facebook", label: "Facebook", icon: SiFacebook, color: "#0866FF", placeholder: "https://facebook.com/username" },
  reddit: { key: "reddit", label: "Reddit", icon: SiReddit, color: "#FF4500", placeholder: "https://reddit.com/u/username" },
  youtube: { key: "youtube", label: "YouTube", icon: SiYoutube, color: "#FF0000", placeholder: "https://youtube.com/@username" },
  tiktok: { key: "tiktok", label: "TikTok", icon: SiTiktok, color: "#e6edf3", placeholder: "https://tiktok.com/@username" },
  discord: { key: "discord", label: "Discord", icon: SiDiscord, color: "#5865F2", placeholder: "https://discord.gg/invite" },
  twitch: { key: "twitch", label: "Twitch", icon: SiTwitch, color: "#9146FF", placeholder: "https://twitch.tv/username" },
  spotify: { key: "spotify", label: "Spotify", icon: SiSpotify, color: "#1DB954", placeholder: "https://open.spotify.com/user/username" },
  telegram: { key: "telegram", label: "Telegram", icon: SiTelegram, color: "#26A5E4", placeholder: "https://t.me/username" },
  whatsapp: { key: "whatsapp", label: "WhatsApp", icon: SiWhatsapp, color: "#25D366", placeholder: "https://wa.me/15551234567" },
  medium: { key: "medium", label: "Medium", icon: SiMedium, color: "#e6edf3", placeholder: "https://medium.com/@username" },
  devto: { key: "devto", label: "DEV Community", icon: SiDevdotto, color: "#e6edf3", placeholder: "https://dev.to/username" },
  behance: { key: "behance", label: "Behance", icon: SiBehance, color: "#1769FF", placeholder: "https://behance.net/username" },
  dribbble: { key: "dribbble", label: "Dribbble", icon: SiDribbble, color: "#EA4C89", placeholder: "https://dribbble.com/username" },
  stackoverflow: { key: "stackoverflow", label: "Stack Overflow", icon: SiStackoverflow, color: "#F58025", placeholder: "https://stackoverflow.com/users/id/username" },
  pinterest: { key: "pinterest", label: "Pinterest", icon: SiPinterest, color: "#BD081C", placeholder: "https://pinterest.com/username" },
  threads: { key: "threads", label: "Threads", icon: SiThreads, color: "#e6edf3", placeholder: "https://threads.net/@username" },
  gitlab: { key: "gitlab", label: "GitLab", icon: SiGitlab, color: "#FC6D26", placeholder: "https://gitlab.com/username" },
  codeforces: { key: "codeforces", label: "Codeforces", icon: SiCodeforces, color: "#1F8ACB", placeholder: "https://codeforces.com/profile/username" },
  hackerrank: { key: "hackerrank", label: "HackerRank", icon: SiHackerrank, color: "#00EA64", placeholder: "https://hackerrank.com/username" },
  kaggle: { key: "kaggle", label: "Kaggle", icon: SiKaggle, color: "#20BEFF", placeholder: "https://kaggle.com/username" },
  snapchat: { key: "snapchat", label: "Snapchat", icon: SiSnapchat, color: "#FFFC00", placeholder: "https://snapchat.com/add/username" },
  email: { key: "email", label: "Email", icon: Mail, color: "#9fe7b5", placeholder: "mailto:you@example.com" },
  website: { key: "website", label: "Website", icon: Globe, color: "#9fe7b5", placeholder: "https://example.com" },
};

export const PLATFORM_KEYS = Object.keys(PLATFORMS);

export function getPlatform(key: string): PlatformDef {
  return PLATFORMS[key] ?? PLATFORMS.website;
}
