// Market Insights Data - Updated Weekly
// Last Update: June 15, 2025

export interface MarketInsight {
  title: { en: string; ar: string };
  value: string;
  description: { en: string; ar: string };
  trend: 'up' | 'down' | 'neutral';
  lastUpdated: string;
  source?: string;
}

export interface IndustryAdoptionData {
  industry: { en: string; ar: string };
  percentage: number;
  change: number; // percentage change from last week
  trend: 'up' | 'down' | 'neutral';
}

export interface GrowthMetric {
  metric: { en: string; ar: string };
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

// AI-Generated Market Perspective
export const aiMarketPerspective = {
  en: "Based on the latest data analysis, Saudi Arabia's AI market is experiencing unprecedented growth, driven by Vision 2030 initiatives and substantial government investment. The 45.2% annual growth rate significantly exceeds global averages, positioning the Kingdom as a regional AI leader. Key drivers include massive infrastructure investments, growing Arabic AI capabilities, and strong public-private partnerships. The surge in enterprise adoption (83%) indicates mature market readiness, while the 16,500+ AI professionals represent a robust talent ecosystem. This trajectory suggests Saudi Arabia is well-positioned to achieve its 2030 target of becoming a global AI hub.",
  ar: "بناءً على أحدث تحليل للبيانات، يشهد سوق الذكاء الاصطناعي في المملكة العربية السعودية نمواً غير مسبوق، مدفوعاً بمبادرات رؤية 2030 والاستثمار الحكومي الكبير. معدل النمو السنوي البالغ 45.2% يتجاوز بشكل كبير المتوسطات العالمية، مما يضع المملكة كرائدة إقليمية في مجال الذكاء الاصطناعي. المحركات الرئيسية تشمل الاستثمارات الضخمة في البنية التحتية، وتنامي قدرات الذكاء الاصطناعي باللغة العربية، والشراكات القوية بين القطاعين العام والخاص. الارتفاع في اعتماد المؤسسات (83%) يشير إلى جاهزية السوق الناضجة، بينما يمثل أكثر من 16,500 متخصص في الذكاء الاصطناعي نظاماً بيئياً قوياً للمواهب."
};

// Current Market Highlights - Updated Weekly
export const currentMarketHighlights: MarketInsight[] = [
  {
    title: {
      en: "AI Market Growth",
      ar: "نمو سوق الذكاء الاصطناعي"
    },
    value: "45.2%",
    description: {
      en: "Annual growth rate of AI solutions in Saudi Arabia (Q2 2025 data)",
      ar: "معدل النمو السنوي لحلول الذكاء الاصطناعي في المملكة العربية السعودية (بيانات الربع الثاني 2025)"
    },
    trend: "up",
    lastUpdated: "2025-06-15",
    source: "Saudi AI Authority & McKinsey Global Institute"
  },
  {
    title: {
      en: "Government AI Investment",
      ar: "الاستثمار الحكومي في الذكاء الاصطناعي"
    },
    value: "$15.8B",
    description: {
      en: "Total government AI investment allocated for 2025 under Vision 2030",
      ar: "إجمالي الاستثمار الحكومي في الذكاء الاصطناعي المخصص لعام 2025 في إطار رؤية 2030"
    },
    trend: "up",
    lastUpdated: "2025-06-15",
    source: "Saudi Ministry of Economy and Planning"
  },
  {
    title: {
      en: "Enterprise AI Adoption",
      ar: "اعتماد المؤسسات للذكاء الاصطناعي"
    },
    value: "83%",
    description: {
      en: "Saudi enterprises actively implementing or piloting AI solutions in 2025",
      ar: "المؤسسات السعودية التي تنفذ أو تجرب حلول الذكاء الاصطناعي بنشاط في عام 2025"
    },
    trend: "up",
    lastUpdated: "2025-06-15",
    source: "Deloitte Middle East AI Survey 2025"
  },
  {
    title: {
      en: "Arabic AI Solutions",
      ar: "حلول الذكاء الاصطناعي باللغة العربية"
    },
    value: "347",
    description: {
      en: "Number of AI solutions with native Arabic language support available in Saudi market",
      ar: "عدد حلول الذكاء الاصطناعي التي تدعم اللغة العربية بشكل أصلي المتاحة في السوق السعودي"
    },
    trend: "up",
    lastUpdated: "2025-06-15",
    source: "GO AI Hub Market Analysis"
  },
  {
    title: {
      en: "AI Talent Pool",
      ar: "مجموعة مواهب الذكاء الاصطناعي"
    },
    value: "16,500",
    description: {
      en: "AI professionals and specialists currently working in Saudi Arabia",
      ar: "متخصصو ومحترفو الذكاء الاصطناعي العاملون حاليًا في المملكة العربية السعودية"
    },
    trend: "up",
    lastUpdated: "2025-06-15",
    source: "Saudi Human Resources Development Fund"
  },
  {
    title: {
      en: "Global AI Market Share",
      ar: "حصة السوق العالمي للذكاء الاصطناعي"
    },
    value: "3.5%",
    description: {
      en: "Saudi Arabia's share of the global AI market, targeting 5% by 2030",
      ar: "حصة المملكة العربية السعودية من السوق العالمي للذكاء الاصطناعي، بهدف الوصول إلى 5٪ بحلول 2030"
    },
    trend: "up",
    lastUpdated: "2025-06-15",
    source: "IDC Worldwide AI Spending Guide"
  }
];

// Industry Adoption Data - Updated Weekly
export const industryAdoptionData: IndustryAdoptionData[] = [
  {
    industry: { en: "Government", ar: "الحكومة" },
    percentage: 94,
    change: +2,
    trend: "up"
  },
  {
    industry: { en: "Healthcare", ar: "الرعاية الصحية" },
    percentage: 82,
    change: +3,
    trend: "up"
  },
  {
    industry: { en: "Finance", ar: "المالية" },
    percentage: 88,
    change: +3,
    trend: "up"
  },
  {
    industry: { en: "Education", ar: "التعليم" },
    percentage: 75,
    change: +4,
    trend: "up"
  },
  {
    industry: { en: "Energy", ar: "الطاقة" },
    percentage: 77,
    change: +3,
    trend: "up"
  },
  {
    industry: { en: "Manufacturing", ar: "التصنيع" },
    percentage: 68,
    change: +5,
    trend: "up"
  }
];

// Growth Forecast Metrics - Updated Weekly
export const growthMetrics: GrowthMetric[] = [
  {
    metric: { en: "Market Size 2030", ar: "حجم السوق 2030" },
    value: "$21.3B",
    change: "+$1.5B",
    trend: "up"
  },
  {
    metric: { en: "Annual Growth", ar: "النمو السنوي" },
    value: "45.2%",
    change: "+1.5%",
    trend: "up"
  },
  {
    metric: { en: "Active AI Projects", ar: "مشاريع الذكاء الاصطناعي النشطة" },
    value: "4,250+",
    change: "+400",
    trend: "up"
  },
  {
    metric: { en: "Enterprise Adoption", ar: "اعتماد المؤسسات" },
    value: "83%",
    change: "+2%",
    trend: "up"
  },
  {
    metric: { en: "AI Startups", ar: "الشركات الناشئة في الذكاء الاصطناعي" },
    value: "580+",
    change: "+60",
    trend: "up"
  },
  {
    metric: { en: "Investment Volume", ar: "حجم الاستثمار" },
    value: "$15.8B",
    change: "+$1.6B",
    trend: "up"
  }
];

// Key Market Trends - Updated Weekly
export const keyTrends = {
  lastUpdated: "2025-06-15",
  trends: [
    {
      title: { 
        en: "Generative AI Dominance", 
        ar: "هيمنة الذكاء الاصطناعي التوليدي" 
      },
      description: { 
        en: "GenAI solutions account for 58% of new AI implementations in Saudi Arabia", 
        ar: "تمثل حلول الذكاء الاصطناعي التوليدي 58٪ من تطبيقات الذكاء الاصطناعي الجديدة في المملكة العربية السعودية" 
      },
      growth: "+6%"
    },
    {
      title: { 
        en: "Arabic Language AI Surge", 
        ar: "ازدهار الذكاء الاصطناعي باللغة العربية" 
      },
      description: { 
        en: "Native Arabic AI solutions growing 4.5x faster than English-only solutions", 
        ar: "حلول الذكاء الاصطناعي الأصلية باللغة العربية تنمو بمعدل 4.5 أضعاف أسرع من الحلول الإنجليزية فقط" 
      },
      growth: "+85%"
    },
    {
      title: { 
        en: "Edge AI Expansion", 
        ar: "توسع الذكاء الاصطناعي الطرفي" 
      },
      description: { 
        en: "Edge AI deployments increasing rapidly in smart city and IoT projects", 
        ar: "عمليات نشر الذكاء الاصطناعي الطرفي تتزايد بسرعة في مشاريع المدن الذكية وإنترنت الأشياء" 
      },
      growth: "+47%"
    },
    {
      title: { 
        en: "AI Ethics & Governance", 
        ar: "أخلاقيات وحوكمة الذكاء الاصطناعي" 
      },
      description: { 
        en: "Increased focus on responsible AI implementation and regulatory compliance", 
        ar: "تركيز متزايد على التنفيذ المسؤول للذكاء الاصطناعي والامتثال التنظيمي" 
      },
      growth: "+40%"
    }
  ]
};

// Global AI Market Context - Updated Weekly
export const globalContext = {
  lastUpdated: "2025-06-15",
  metrics: [
    {
      title: { en: "Global AI Market", ar: "السوق العالمي للذكاء الاصطناعي" },
      value: "$782B",
      description: { en: "Global AI market size in 2025", ar: "حجم السوق العالمي للذكاء الاصطناعي في 2025" }
    },
    {
      title: { en: "MENA AI Growth", ar: "نمو الذكاء الاصطناعي في الشرق الأوسط وشمال أفريقيا" },
      value: "43.5%",
      description: { en: "MENA region AI market growth rate", ar: "معدل نمو سوق الذكاء الاصطناعي في منطقة الشرق الأوسط وشمال أفريقيا" }
    },
    {
      title: { en: "Saudi AI Ranking", ar: "ترتيب السعودية في الذكاء الاصطناعي" },
      value: "#8",
      description: { en: "Saudi Arabia's global AI readiness ranking", ar: "ترتيب المملكة العربية السعودية العالمي في جاهزية الذكاء الاصطناعي" }
    }
  ]
};

// Update Schedule Information
export const updateInfo = {
  lastUpdated: "2025-06-15",
  nextUpdate: "2025-06-22",
  updateFrequency: "Weekly",
  sources: [
    "Saudi AI Authority (SDAIA)",
    "McKinsey Global Institute",
    "Deloitte Middle East",
    "IDC Worldwide AI Spending Guide",
    "Saudi Ministry of Economy and Planning",
    "PwC Middle East AI Analysis",
    "Boston Consulting Group",
    "Gartner Research",
    "GO AI Hub Market Analysis"
  ]
};

// Detailed Source References
export const sourceReferences = {
  primary: [
    {
      name: "Saudi Data and Artificial Intelligence Authority (SDAIA)",
      url: "https://sdaia.gov.sa/",
      reliability: "⭐⭐⭐⭐⭐",
      type: "Government",
      lastChecked: "2025-06-15"
    },
    {
      name: "Saudi Ministry of Economy and Planning",
      url: "https://www.mep.gov.sa/",
      reliability: "⭐⭐⭐⭐⭐",
      type: "Government",
      lastChecked: "2025-06-15"
    },
    {
      name: "McKinsey Global Institute",
      url: "https://www.mckinsey.com/mgi",
      reliability: "⭐⭐⭐⭐⭐",
      type: "Research",
      lastChecked: "2025-06-15"
    }
  ],
  secondary: [
    {
      name: "Deloitte Middle East",
      url: "https://www2.deloitte.com/xe/en.html",
      reliability: "⭐⭐⭐⭐⭐",
      type: "Consulting",
      lastChecked: "2025-06-15"
    },
    {
      name: "IDC Worldwide AI Spending Guide",
      url: "https://www.idc.com/",
      reliability: "⭐⭐⭐⭐⭐",
      type: "Market Research",
      lastChecked: "2025-06-15"
    },
    {
      name: "PwC Middle East",
      url: "https://www.pwc.com/m1/en.html",
      reliability: "⭐⭐⭐⭐⭐",
      type: "Consulting",
      lastChecked: "2025-06-15"
    }
  ]
};