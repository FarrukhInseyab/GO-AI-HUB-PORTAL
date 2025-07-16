import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FAQItem {
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
}

const FAQPage = () => {
  const { language, translations } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: {
        en: "What is AI Solutions Hub?",
        ar: "ما هو منصة حلول الذكاء الاصطناعي؟"
      },
      answer: {
        en: "AI Solutions Hub is a platform launched by Go Telecom that connects international and local AI solution providers with government agencies and businesses in Saudi Arabia. We facilitate the discovery, evaluation, and implementation of AI solutions that drive digital transformation.",
        ar: "منصة حلول الذكاء الاصطناعي هي منصة أطلقتها شركة GO Telecom تربط مزودي حلول الذكاء الاصطناعي الدوليين والمحليين بالوكالات الحكومية والشركات في المملكة العربية السعودية. نحن نسهل اكتشاف وتقييم وتنفيذ حلول الذكاء الاصطناعي التي تقود التحول الرقمي."
      }
    },
    {
      question: {
        en: "How are AI solutions vetted on the platform?",
        ar: "كيف يتم فحص حلول الذكاء الاصطناعي على المنصة؟"
      },
      answer: {
        en: "Each solution undergoes a rigorous two-stage approval process: technical evaluation (assessing the technology, security, and implementation) and business evaluation (examining market fit, scalability, and compliance with local requirements). Only solutions that pass both stages are listed publicly.",
        ar: "تخضع كل حل لعملية موافقة صارمة من مرحلتين: التقييم التقني (تقييم التكنولوجيا والأمان والتنفيذ) والتقييم التجاري (فحص ملاءمة السوق وقابلية التوسع والامتثال للمتطلبات المحلية). فقط الحلول التي تجتاز كلا المرحلتين يتم إدراجها علنياً."
      }
    },
    {
      question: {
        en: "Can international companies list their solutions?",
        ar: "هل يمكن للشركات الدولية إدراج حلولها؟"
      },
      answer: {
        en: "Yes, we welcome AI solutions from around the world. However, providers must demonstrate their ability to support implementation in Saudi Arabia and comply with local regulations. Arabic language support is highly recommended but not mandatory.",
        ar: "نعم، نرحب بحلول الذكاء الاصطناعي من جميع أنحاء العالم. ومع ذلك، يجب على مقدمي الخدمات إثبات قدرتهم على دعم التنفيذ في المملكة العربية السعودية والامتثال للوائح المحلية. دعم اللغة العربية موصى به بشدة ولكنه ليس إلزامياً."
      }
    },
    {
      question: {
        en: "What types of AI solutions are accepted?",
        ar: "ما أنواع حلول الذكاء الاصطناعي المقبولة؟"
      },
      answer: {
        en: "We accept a wide range of AI solutions across various categories including computer vision, natural language processing, predictive analytics, and more. Solutions must be enterprise-ready and demonstrate clear business value for government or corporate applications.",
        ar: "نقبل مجموعة واسعة من حلول الذكاء الاصطناعي عبر فئات مختلفة بما في ذلك رؤية الكمبيوتر ومعالجة اللغة الطبيعية والتحليلات التنبؤية والمزيد. يجب أن تكون الحلول جاهزة للمؤسسات وتظهر قيمة تجارية واضحة للتطبيقات الحكومية أو الشركات."
      }
    },
    {
      question: {
        en: "How long does the approval process take?",
        ar: "كم من الوقت تستغرق عملية الموافقة؟"
      },
      answer: {
        en: "The typical approval process takes 2-4 weeks, including both technical and business evaluations. This timeline may vary depending on the complexity of the solution and the completeness of the submitted information.",
        ar: "تستغرق عملية الموافقة النموذجية من 2-4 أسابيع، بما في ذلك التقييمات التقنية والتجارية. قد يختلف هذا الجدول الزمني اعتماداً على تعقيد الحل واكتمال المعلومات المقدمة."
      }
    },
    {
      question: {
        en: "Is there a cost to list solutions?",
        ar: "هل هناك تكلفة لإدراج الحلول؟"
      },
      answer: {
        en: "Currently, listing solutions on AI Solutions Hub is free. We focus on curating high-quality solutions rather than charging listing fees. However, we may introduce premium features in the future.",
        ar: "حالياً، إدراج الحلول على منصة حلول الذكاء الاصطناعي مجاني. نحن نركز على تنسيق حلول عالية الجودة بدلاً من فرض رسوم الإدراج. ومع ذلك، قد نقدم ميزات مميزة في المستقبل."
      }
    },
    {
      question: {
        en: "How do you handle data security and privacy?",
        ar: "كيف تتعاملون مع أمان البيانات والخصوصية؟"
      },
      answer: {
        en: "We adhere to strict data protection standards and comply with Saudi Arabia's data sovereignty requirements. All solutions must demonstrate robust security measures and appropriate data handling practices.",
        ar: "نلتزم بمعايير حماية البيانات الصارمة ونمتثل لمتطلبات سيادة البيانات في المملكة العربية السعودية. يجب على جميع الحلول إثبات تدابير أمنية قوية وممارسات مناسبة للتعامل مع البيانات."
      }
    },
    {
      question: {
        en: "Can government agencies directly procure through the platform?",
        ar: "هل يمكن للوكالات الحكومية الشراء مباشرة من خلال المنصة؟"
      },
      answer: {
        en: "While we facilitate initial connections and evaluations, actual procurement happens outside the platform following standard government procurement procedures. We help streamline the discovery and evaluation phases.",
        ar: "بينما نسهل الاتصالات والتقييمات الأولية، يحدث الشراء الفعلي خارج المنصة باتباع إجراءات الشراء الحكومية المعيارية. نحن نساعد في تبسيط مراحل الاكتشاف والتقييم."
      }
    },
    {
      question: {
        en: "What support is provided for implementation?",
        ar: "ما الدعم المقدم للتنفيذ؟"
      },
      answer: {
        en: "We provide initial matchmaking and facilitate communication between solution providers and clients. Solution providers are required to detail their implementation methodology and support capabilities as part of their listing.",
        ar: "نقدم المطابقة الأولية ونسهل التواصل بين مقدمي الحلول والعملاء. يُطلب من مقدمي الحلول تفصيل منهجية التنفيذ وقدرات الدعم كجزء من إدراجهم."
      }
    },
    {
      question: {
        en: "How can I get started?",
        ar: "كيف يمكنني البدء؟"
      },
      answer: {
        en: "Solution providers can begin by clicking 'Get Listed' and following our guided submission process. Government agencies and businesses can browse solutions directly through the 'Discover' section or contact us for personalized assistance.",
        ar: "يمكن لمقدمي الحلول البدء بالنقر على 'سجل حلولك' واتباع عملية التقديم الموجهة. يمكن للوكالات الحكومية والشركات تصفح الحلول مباشرة من خلال قسم 'اكتشف الحلول' أو الاتصال بنا للحصول على مساعدة شخصية."
      }
    },
    {
      question: {
        en: "What is the difference between technical and business evaluation?",
        ar: "ما الفرق بين التقييم التقني والتقييم التجاري؟"
      },
      answer: {
        en: "Technical evaluation focuses on the solution's technology stack, security measures, scalability, and integration capabilities. Business evaluation examines market fit, pricing model, customer references, and compliance with local business requirements and regulations.",
        ar: "يركز التقييم التقني على مجموعة تقنيات الحل وتدابير الأمان وقابلية التوسع وقدرات التكامل. يفحص التقييم التجاري ملاءمة السوق ونموذج التسعير ومراجع العملاء والامتثال لمتطلبات الأعمال المحلية واللوائح."
      }
    },
    {
      question: {
        en: "Do you provide training for AI solutions?",
        ar: "هل تقدمون تدريباً على حلول الذكاء الاصطناعي؟"
      },
      answer: {
        en: "While we don't provide direct training, we connect organizations with solution providers who offer comprehensive training programs. Many of our listed solutions include training and support packages as part of their implementation services.",
        ar: "بينما لا نقدم تدريباً مباشراً، نربط المنظمات بمقدمي الحلول الذين يقدمون برامج تدريبية شاملة. تتضمن العديد من حلولنا المدرجة حزم التدريب والدعم كجزء من خدمات التنفيذ."
      }
    },
    {
      question: {
        en: "How do you ensure solution quality?",
        ar: "كيف تضمنون جودة الحلول؟"
      },
      answer: {
        en: "We maintain strict quality standards through our two-stage evaluation process, require detailed documentation, verify customer references, and conduct ongoing monitoring of listed solutions. We also collect feedback from users to continuously improve our curation process.",
        ar: "نحافظ على معايير جودة صارمة من خلال عملية التقييم ذات المرحلتين، ونطلب وثائق مفصلة، ونتحقق من مراجع العملاء، ونجري مراقبة مستمرة للحلول المدرجة. نجمع أيضاً ملاحظات من المستخدمين لتحسين عملية التنسيق باستمرار."
      }
    },
    {
      question: {
        en: "Can I update my solution information after listing?",
        ar: "هل يمكنني تحديث معلومات حلي بعد الإدراج؟"
      },
      answer: {
        en: "Yes, solution providers can update their information through their profile dashboard. Major changes may require re-evaluation, while minor updates like contact information or additional features can be updated immediately.",
        ar: "نعم، يمكن لمقدمي الحلول تحديث معلوماتهم من خلال لوحة تحكم ملفهم الشخصي. قد تتطلب التغييرات الكبيرة إعادة تقييم، بينما يمكن تحديث التحديثات الطفيفة مثل معلومات الاتصال أو الميزات الإضافية فوراً."
      }
    },
    {
      question: {
        en: "What happens if my solution is rejected?",
        ar: "ماذا يحدث إذا تم رفض حلي؟"
      },
      answer: {
        en: "If a solution is rejected, we provide detailed feedback explaining the reasons and suggestions for improvement. Providers can address the issues and resubmit their solution for another evaluation after making the necessary improvements.",
        ar: "إذا تم رفض حل، نقدم ملاحظات مفصلة تشرح الأسباب واقتراحات للتحسين. يمكن لمقدمي الخدمات معالجة المشاكل وإعادة تقديم حلهم لتقييم آخر بعد إجراء التحسينات اللازمة."
      }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      
      <main className="flex-grow pt-20 relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-secondary-900/10 to-primary-900/10"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 175, 175, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 175, 175, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Hero Section */}
        <div className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center mb-6">
                <Sparkles className="h-8 w-8 text-primary-500 mr-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {translations.faqTitle}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {translations.faqSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="group bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-primary-500/30 overflow-hidden shadow-lg hover:shadow-primary-500/20 transition-all duration-500"
                  >
                    <button
                      className="w-full px-6 py-4 text-left bg-transparent hover:bg-gray-700/30 flex items-center justify-between transition-all duration-300"
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                      <span className="font-semibold text-white pr-4 group-hover:text-primary-500 transition-colors duration-300">
                        {faq.question[language]}
                      </span>
                      <div className="flex-shrink-0">
                        {openIndex === index ? (
                          <ChevronUp className="h-5 w-5 text-primary-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                        )}
                      </div>
                    </button>
                    <div 
                      className={`px-6 bg-gray-800/30 backdrop-blur-sm transition-all duration-500 ease-in-out overflow-hidden ${
                        openIndex === index ? 'py-4 opacity-100 max-h-96' : 'py-0 opacity-0 max-h-0'
                      }`}
                    >
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Section */}
              <div className="mt-16 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30">
                    <Zap className="h-8 w-8 text-primary-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {language === 'ar' ? 'لم تجد إجابة لسؤالك؟' : "Didn't find what you're looking for?"}
                </h3>
                <p className="text-gray-300 mb-6">
                  {language === 'ar' 
                    ? 'فريقنا هنا لمساعدتك. تواصل معنا للحصول على دعم شخصي.'
                    : 'Our team is here to help. Contact us for personalized support.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:info@goaihub.ai"
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                  >
                    {language === 'ar' ? 'راسلنا عبر البريد الإلكتروني' : 'Email Us'}
                  </a>
                  <a 
                    href="tel:+966591364477"
                    className="bg-gray-700/50 hover:bg-gray-600/50 border border-primary-500/30 hover:border-primary-400/50 text-primary-500 hover:text-primary-400 px-6 py-3 rounded-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    {language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQPage;