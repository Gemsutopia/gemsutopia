-- Seed FAQ section title
INSERT INTO site_content (section, key, value, content_type, is_active)
VALUES ('faq', 'title', 'Frequently Asked Questions', 'text', true)
ON CONFLICT (section, key) DO NOTHING;
