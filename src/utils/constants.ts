// Extracted constants for better organization
export const APP_METADATA = {
  name: 'GO AI HUB',
  description: 'Bridge to AI Solutions for Government & Enterprise',
  version: '1.0.0',
  author: 'GO Telecom',
} as const;

export const CONTACT_INFO = {
  email: 'info@goaihub.ai',
  phone: '+966 59 136 4477',
  address: '3758 King Abdullah Road, Al Maghrazat District, Riyadh 12482 6514, Riyadh 12431'
} as const;

export const EXTERNAL_LINKS = {
  pexels: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=400',
  github: 'https://github.com/your-username/go-ai-hub.git',
  linkedin: 'https://linkedin.com/company/go-telecom',
  twitter: 'https://twitter.com/go_telecom'
} as const;

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;