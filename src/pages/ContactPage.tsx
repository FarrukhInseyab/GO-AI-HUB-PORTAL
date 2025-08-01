import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button, Input } from '../components/ui';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ContactPage = () => {
  const { translations, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error(language === 'ar' ? 'الاسم مطلوب' : 'Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error(language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      }
      if (!formData.subject.trim()) {
        throw new Error(language === 'ar' ? 'الموضوع مطلوب' : 'Subject is required');
      }
      if (!formData.message.trim()) {
        throw new Error(language === 'ar' ? 'الرسالة مطلوبة' : 'Message is required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error(language === 'ar' ? 'صيغة البريد الإلكتروني غير صالحة' : 'Invalid email format');
      }

      // Prepare email content
      const emailSubject = `Contact Form: ${formData.subject}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #049394;">New Contact Form Submission - GO AI HUB</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
          </div>
          
          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Message</h2>
            <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
            <p>This message was sent from the GO AI HUB contact form.<br>
            Submitted on: ${new Date().toLocaleString()}<br>
            Reply to: ${formData.email}</p>
          </div>
        </div>
      `;

      // Send email using the email service
      const emailServiceUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'https://goaihub.ai/email/api';
      
      const response = await fetch(`${emailServiceUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'farrukh.khan@inseyab.com',
          type: 'custom',
          subject: emailSubject,
          html: emailHtml
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      setIsSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: ''
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error sending contact form:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </h1>
              </div>
              <p className="text-xl text-gray-300">
                {language === 'ar' 
                  ? 'نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو دعم تحتاجه.'
                  : 'We\'re here to help. Reach out to us for any questions or support you need.'}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="p-3 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl border border-primary-500/30 mr-4">
                      <Mail className="h-6 w-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </h3>
                      <a 
                        href="mailto:info@goaihub.ai" 
                        className="text-primary-500 hover:text-primary-400 transition-colors duration-300"
                      >
                        info@goaihub.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="p-3 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 rounded-xl border border-secondary-500/30 mr-4">
                      <Phone className="h-6 w-6 text-secondary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {language === 'ar' ? 'الهاتف' : 'Phone'}
                      </h3>
                      <a 
                        href="tel:+966591364477" 
                        className="text-secondary-500 hover:text-secondary-400 transition-colors duration-300"
                      >
                        +966 59 136 4477
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="p-3 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/30 mr-4">
                      <MapPin className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {language === 'ar' ? 'العنوان' : 'Address'}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        3758 King Abdullah Road<br />
                        Al Maghrazat District<br />
                        Riyadh 12482 6514<br />
                        Saudi Arabia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                  <h3 className="font-semibold text-white mb-3">
                    {language === 'ar' ? 'ساعات العمل' : 'Business Hours'}
                  </h3>
                  <p className="text-gray-300">
                    {language === 'ar' 
                      ? 'الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً (بتوقيت السعودية)'
                      : 'Sunday - Thursday: 9:00 AM - 5:00 PM (KSA Time)'}
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary-500/20 shadow-xl shadow-primary-500/10 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message'}
                </h2>

                {isSuccess && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg flex items-start backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">
                      {language === 'ar' 
                        ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
                        : 'Your message has been sent successfully! We\'ll get back to you soon.'}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg flex items-start backdrop-blur-sm">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={language === 'ar' ? 'الاسم *' : 'Name *'}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                    />
                    
                    <Input
                      label={language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'your@email.com'}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={language === 'ar' ? 'الشركة' : 'Company'}
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder={language === 'ar' ? 'اسم شركتك' : 'Your company name'}
                    />
                    
                    <Input
                      label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder={language === 'ar' ? 'رقم هاتفك' : 'Your phone number'}
                    />
                  </div>

                  <Input
                    label={language === 'ar' ? 'الموضوع *' : 'Subject *'}
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder={language === 'ar' ? 'موضوع رسالتك' : 'What is this about?'}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {language === 'ar' ? 'الرسالة *' : 'Message *'}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      rows={6}
                      className="w-full px-4 py-3 bg-[#016774] border border-[#4CEADB]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CEADB] focus:border-[#4CEADB] text-white placeholder-gray-400 transition-all duration-300 resize-vertical"
                      placeholder={language === 'ar' 
                        ? 'اكتب رسالتك هنا...'
                        : 'Write your message here...'}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting 
                      ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                      : (language === 'ar' ? 'إرسال الرسالة' : 'Send Message')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;