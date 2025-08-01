// Application constants - refactored for better organization
export const APP_CONFIG = {
  name: 'GO AI HUB',
  description: 'Bridge to AI Solutions for Government & Enterprise',
  version: '1.0.0',
  contact: {
    email: 'info@goaihub.ai',
    phone: '+966 59 136 4477',
    address: '3758 King Abdullah Road, Al Maghrazat District, Riyadh 12482 6514, Riyadh 12431'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  DISCOVER: '/discover',
  VENDOR_ONBOARDING: '/vendor-onboarding',
  SUBMISSION_FORM: '/submission-form',
  SOLUTION_DETAILS: '/solutions/:id',
  AI_RECOMMENDATION: '/solutions/:id/recommendation',
  ABOUT: '/about',
  FAQ: '/faq',
  HOW_IT_WORKS: '/how-it-works',
  PRIVACY: '/privacy',
  COOKIES: '/cookies',
  SUCCESS_STORIES: '/success-stories',
  MARKET_INSIGHTS: '/market-insights',
  GO_ADVANTAGE: '/go-advantage',
  PROFILE: '/profile',
  AUTH_CALLBACK: '/auth/callback',
  GOAI_AGENT: '/goai-agent'
  CONTACT: '/contact'
} as const;

// Form options - organized by category
export const FORM_OPTIONS = {
  industries: [
    'Government',
    'Healthcare',
    'Education',
    'Finance',
    'Smart Cities',
    'Energy',
    'Transportation',
    'Security',
    'Defense',
    'Retail',
    'Manufacturing',
    'Agriculture',
    'Media',
    'Telecommunications',
    'Business',
    'Other'
  ],
  
  techCategories: [
    'NLP',
    'Computer Vision',
    'Machine Learning',
    'Predictive Analytics',
    'IoT',
    'Edge AI',
    'RPA',
    'Deep Learning',
    'Neural Networks',
    'GenAI',
    'Blockchain',
    'Cloud Computing',
    'VR/AR',
    'Quantum Computing',
    'Other'
  ],
  
  deploymentModels: [
    'Cloud',
    'On-Premise',
    'Hybrid',
    'Edge',
    'SaaS',
    'API'
  ],
  
  trlLevels: [
    'TRL 1 - Basic principles observed',
    'TRL 2 - Technology concept formulated',
    'TRL 3 - Experimental proof of concept',
    'TRL 4 - Technology validated in lab',
    'TRL 5 - Technology validated in relevant environment',
    'TRL 6 - Technology demonstrated in relevant environment',
    'TRL 7 - System prototype demonstration',
    'TRL 8 - System complete and qualified',
    'TRL 9 - Actual system proven in operational environment'
  ],
  
  deploymentStatus: [
    'Production',
    'Pilot',
    'Development',
    'Planning',
    'Concept',
    'Proof of Concept'
  ],
  
  revenue: [
    'Pre-revenue',
    'Less than 1M USD',
    '1-10M USD',
    '10-50M USD',
    'More than 50M USD'
  ],
  
  employees: [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ],
  
  positions: [
    'CEO',
    'CTO',
    'VP Engineering',
    'Product Manager',
    'Sales Director',
    'Business Development',
    'Other'
  ]
} as const;

// Export individual arrays for backward compatibility
export const INDUSTRY_OPTIONS = FORM_OPTIONS.industries;
export const TECH_CATEGORIES = FORM_OPTIONS.techCategories;
export const DEPLOYMENT_MODELS = FORM_OPTIONS.deploymentModels;
export const TRL_LEVELS = FORM_OPTIONS.trlLevels;
export const DEPLOYMENT_STATUS_OPTIONS = FORM_OPTIONS.deploymentStatus;
export const REVENUE_OPTIONS = FORM_OPTIONS.revenue;
export const EMPLOYEE_OPTIONS = FORM_OPTIONS.employees;
export const POSITION_OPTIONS = FORM_OPTIONS.positions;

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
] as const;

// UI Constants
export const UI_CONFIG = {
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070
  }
} as const;