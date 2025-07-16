-- Seed data for development and testing

-- Insert sample users
INSERT INTO users (id, email, contact_name, company_name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'john.doe@techcorp.com', 'John Doe', 'TechCorp Solutions'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah.smith@aiventures.com', 'Sarah Smith', 'AI Ventures'),
  ('550e8400-e29b-41d4-a716-446655440003', 'ahmed.hassan@smarttech.sa', 'Ahmed Hassan', 'SmartTech Saudi')
ON CONFLICT (id) DO NOTHING;

-- Insert sample profiles (evaluators)
INSERT INTO profiles (id, name, email, role) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Dr. Emily Chen', 'emily.chen@goaihub.ai', 'technical_evaluator'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Michael Rodriguez', 'michael.rodriguez@goaihub.ai', 'business_evaluator')
ON CONFLICT (id) DO NOTHING;

-- Insert sample solutions
INSERT INTO solutions (
  id, user_id, company_name, country, website, solution_name, summary, description,
  industry_focus, tech_categories, auto_tags, deployment_model, arabic_support,
  trl, deployment_status, contact_name, contact_email, status,
  tech_approval_status, business_approval_status
) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'TechCorp Solutions',
    'United States',
    'https://techcorp.com',
    'AI Document Processor',
    'Advanced AI-powered document processing solution for government agencies.',
    'Our AI Document Processor uses state-of-the-art NLP and computer vision to automatically extract, classify, and process documents at scale. Perfect for government agencies handling large volumes of paperwork.',
    '["Government", "Finance"]',
    '["NLP", "Computer Vision", "Machine Learning"]',
    '["document processing", "automation", "government"]',
    'Cloud',
    true,
    'TRL 8 - System complete and qualified',
    'Production',
    'John Doe',
    'john.doe@techcorp.com',
    'approved',
    'approved',
    'approved'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'AI Ventures',
    'United Kingdom',
    'https://aiventures.co.uk',
    'Smart City Analytics',
    'Comprehensive analytics platform for smart city management and optimization.',
    'Our Smart City Analytics platform leverages IoT data, machine learning, and predictive analytics to help cities optimize traffic flow, energy consumption, and public services.',
    '["Smart Cities", "Government"]',
    '["IoT", "Predictive Analytics", "Machine Learning"]',
    '["smart cities", "analytics", "optimization"]',
    'Hybrid',
    false,
    'TRL 7 - System prototype demonstration',
    'Pilot',
    'Sarah Smith',
    'sarah.smith@aiventures.com',
    'approved',
    'approved',
    'approved'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'SmartTech Saudi',
    'Saudi Arabia',
    'https://smarttech.sa',
    'Arabic Voice Assistant',
    'Native Arabic voice assistant for government customer service.',
    'Our Arabic Voice Assistant is specifically designed for Arabic speakers, providing natural language understanding and response generation for government customer service applications.',
    '["Government", "Telecommunications"]',
    '["NLP", "GenAI", "Neural Networks"]',
    '["arabic", "voice assistant", "customer service"]',
    'On-Premise',
    true,
    'TRL 6 - Technology demonstrated in relevant environment',
    'Development',
    'Ahmed Hassan',
    'ahmed.hassan@smarttech.sa',
    'pending',
    'pending',
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample interests
INSERT INTO interests (
  solution_id, user_id, company_name, contact_name, contact_email,
  message, status
) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    'AI Ventures',
    'Sarah Smith',
    'sarah.smith@aiventures.com',
    'We are interested in integrating your document processing solution with our smart city platform.',
    'New Interest'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    'SmartTech Saudi',
    'Ahmed Hassan',
    'ahmed.hassan@smarttech.sa',
    'This analytics platform could be very useful for our smart city initiatives in Riyadh.',
    'Lead Initiated'
  )
ON CONFLICT (id) DO NOTHING;

-- Refresh materialized views
SELECT refresh_daily_stats();