-- Seed all page content into site_content table
-- Uses ON CONFLICT to avoid overwriting any existing edits

-- ===================== ABOUT PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('about', 'subtitle', 'A small Canadian passion project', 'text', true),
('about', 'paragraph_1', E'First of all, thanks for stopping by! I''m Reese, founder of Gemsutopia and a proud Canadian rockhound based in Alberta.', 'text', true),
('about', 'paragraph_2', E'At Gemsutopia, we focus on minerals with integrity. Every specimen is hand-selected and personally inspected for quality. Some pieces, like our Blue Jay sapphires, Alberta peridot, and a few of our other Canadian minerals, are collected during my own rockhounding trips. The rest are sourced from trusted small-scale miners and suppliers who value ethical practices.', 'text', true),
('about', 'paragraph_3', E'This isn''t just a business... it''s a passion. I don''t list anything I wouldn''t be proud to have in my own collection. Each order is thoughtfully packed by my amazing spouse (she''s the best), and we often include a small bonus gift as a thank-you for supporting our dream.', 'text', true),
('about', 'paragraph_4', E'Thanks so much for supporting Gemsutopia. You''re not just buying a gem... you''re also investing in a story, a journey, and a small Canadian business that truly cares.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== SHIPPING PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('shipping', 'subtitle', 'Fast and secure delivery', 'text', true),
('shipping', 'processing_time', E'1\u20132 business days', 'text', true),
('shipping', 'canada_time', E'3\u201315 business days estimated delivery', 'text', true),
('shipping', 'usa_time', E'5\u201320 business days estimated delivery', 'text', true),
('shipping', 'international_note', 'Contact us for international shipping options and estimates.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== RETURNS PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('returns', 'subtitle', 'Your satisfaction matters to us', 'text', true),
('returns', 'intro', E'If for any reason you''re not completely happy with your purchase, we''re here to help.', 'text', true),
('returns', 'policy', 'You may return most items within 30 days of delivery for a full refund. Items must be in their original condition with all packaging intact.', 'text', true),
('returns', 'how_to_return', E'\u2022 Contact us to initiate your return\n\u2022 We''ll provide return instructions and shipping address\n\u2022 Pack your item securely in its original packaging\n\u2022 Ship the item back (return shipping is buyer''s responsibility)', 'text', true),
('returns', 'exchanges', E'Want to exchange for a different item? Contact us and we''ll help you find the perfect piece. Exchanges are subject to availability.', 'text', true),
('returns', 'damaged_items', E'If your item arrives damaged, contact us immediately with photos. We''ll make it right with a replacement or full refund, including shipping costs.', 'text', true),
('returns', 'non_returnable', 'Custom or personalized items and sale/clearance items marked as final sale cannot be returned unless they arrive damaged or defective.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== SUPPORT PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('support', 'email_address', 'gemsutopia@gmail.com', 'text', true),
('support', 'response_time_value', '24 hours', 'text', true),
('support', 'faq_1_question', 'How do I track my order?', 'text', true),
('support', 'faq_1_answer', E'Once your order is shipped, you''ll receive a tracking number via email. You can use this number to track your package on our shipping partner''s website.', 'text', true),
('support', 'faq_2_question', 'What is your return policy?', 'text', true),
('support', 'faq_2_answer', 'We offer a 30-day return policy for all items in original condition. Please contact us at gemsutopia@gmail.com for detailed return information.', 'text', true),
('support', 'faq_3_question', 'Are your gemstones authentic?', 'text', true),
('support', 'faq_3_answer', 'Yes, all our gemstones come with certificates of authenticity and are sourced from trusted suppliers worldwide.', 'text', true),
('support', 'faq_4_question', 'How long does shipping take?', 'text', true),
('support', 'faq_4_answer', 'Standard shipping takes 3-5 business days. Express shipping options are available at checkout for faster delivery.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== GEM GUIDE PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('gem-guide', 'title', 'Gem Guide', 'text', true),
('gem-guide', 'subtitle', E'Understanding nature''s treasures', 'text', true),
('gem-guide', 'section_1_title', 'What Makes a Gemstone Valuable', 'text', true),
('gem-guide', 'section_1_content', E'The value of a gemstone is determined by the four Cs: color, clarity, cut, and carat weight. However, rarity and origin also play significant roles. A stone''s provenance can dramatically affect its desirability among collectors.', 'text', true),
('gem-guide', 'section_2_title', 'Color & Clarity', 'text', true),
('gem-guide', 'section_2_content', E'Color is often the most important factor. The most prized specimens exhibit vivid, saturated hues with even distribution. Clarity refers to the absence of inclusions\u2014though some inclusions, like rutile needles in quartz, can actually enhance a stone''s beauty and value.', 'text', true),
('gem-guide', 'section_3_title', 'Natural vs. Enhanced', 'text', true),
('gem-guide', 'section_3_content', E'We specialize in natural, untreated specimens. While heat treatment and other enhancements are common in the industry, our collection focuses on stones that showcase nature''s artistry without artificial modification.', 'text', true),
('gem-guide', 'section_4_title', 'Identifying Authenticity', 'text', true),
('gem-guide', 'section_4_content', E'Authentic gemstones often contain natural inclusions, growth patterns, and slight imperfections that distinguish them from synthetics. We provide detailed photographs and honest descriptions so you know exactly what you''re acquiring.', 'text', true),
('gem-guide', 'section_5_title', 'Building Your Collection', 'text', true),
('gem-guide', 'section_5_content', E'Start with stones that speak to you personally. Whether drawn to the flash of labradorite or the ancient beauty of ammolite, collecting should be a journey of discovery. Quality over quantity is the collector''s golden rule.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== HOW IT WORKS PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('how-it-works', 'title', 'How It Works', 'text', true),
('how-it-works', 'subtitle', 'From earth to your collection', 'text', true),
('how-it-works', 'section_1_title', 'Discovery & Sourcing', 'text', true),
('how-it-works', 'section_1_content', E'Every piece begins with careful sourcing. Some specimens are personally collected during rockhounding expeditions across Canada, while others come from trusted small-scale miners and suppliers who share our commitment to ethical practices.', 'text', true),
('how-it-works', 'section_2_title', 'Selection & Inspection', 'text', true),
('how-it-works', 'section_2_content', E'Each gemstone undergoes thorough inspection before joining our collection. We evaluate color, clarity, and overall quality, ensuring only specimens we''d proudly add to our own collection make it to yours.', 'text', true),
('how-it-works', 'section_3_title', 'Documentation & Photography', 'text', true),
('how-it-works', 'section_3_content', E'We photograph every piece in natural lighting from multiple angles. Our listings include accurate measurements, weight, and honest descriptions of any natural characteristics. What you see is exactly what you''ll receive.', 'text', true),
('how-it-works', 'section_4_title', 'Secure Packaging', 'text', true),
('how-it-works', 'section_4_content', E'Your gemstone is carefully wrapped in protective materials and placed in a secure box designed to prevent movement during transit. We treat every shipment as if we''re sending a piece of our personal collection.', 'text', true),
('how-it-works', 'section_5_title', 'Delivery & Support', 'text', true),
('how-it-works', 'section_5_content', E'Once shipped, you''ll receive tracking information via email. Our support doesn''t end at delivery\u2014we''re here to answer questions about your specimen, provide care advice, or assist with any concerns.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== ETHICAL SOURCING PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('sourcing', 'title', 'Ethical Sourcing', 'text', true),
('sourcing', 'subtitle', 'Integrity in every specimen', 'text', true),
('sourcing', 'section_1_title', 'Our Commitment', 'text', true),
('sourcing', 'section_1_content', E'We believe beautiful gemstones shouldn''t come at the cost of environmental damage or unfair labor practices. Every specimen in our collection is sourced with careful consideration for both people and planet.', 'text', true),
('sourcing', 'section_2_title', 'Direct Relationships', 'text', true),
('sourcing', 'section_2_content', 'We work directly with small-scale miners and family-operated businesses whenever possible. These partnerships ensure fair compensation reaches the people who actually extract these treasures from the earth.', 'text', true),
('sourcing', 'section_3_title', 'Canadian Specimens', 'text', true),
('sourcing', 'section_3_content', 'Many pieces in our collection are personally collected during rockhounding expeditions across Alberta and other Canadian locations. These firsthand discoveries allow us to offer specimens with complete provenance.', 'text', true),
('sourcing', 'section_4_title', 'Transparency', 'text', true),
('sourcing', 'section_4_content', E'We provide detailed origin information for our specimens whenever available. If we don''t know exactly where a stone came from, we''ll tell you. Honesty builds the trust that lasting relationships require.', 'text', true),
('sourcing', 'section_5_title', 'Sustainable Practices', 'text', true),
('sourcing', 'section_5_content', E'We prioritize suppliers who employ sustainable extraction methods and rehabilitate mining sites. The mineral world has existed for millions of years\u2014we''re committed to practices that honor that legacy.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== CARE GUIDE PAGE =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('care-guide', 'title', 'Care Guide', 'text', true),
('care-guide', 'subtitle', E'Preserving nature''s beauty', 'text', true),
('care-guide', 'section_1_title', 'General Handling', 'text', true),
('care-guide', 'section_1_content', 'Always handle your specimens with clean, dry hands. Natural oils and lotions can affect the surface of certain minerals over time. When possible, hold pieces by their edges or base rather than their display faces.', 'text', true),
('care-guide', 'section_2_title', 'Cleaning Your Specimens', 'text', true),
('care-guide', 'section_2_content', E'Most specimens can be gently dusted with a soft brush. For deeper cleaning, use lukewarm water and mild soap, then dry thoroughly. Avoid ultrasonic cleaners and harsh chemicals\u2014they can damage delicate surfaces and alter colors.', 'text', true),
('care-guide', 'section_3_title', 'Display & Storage', 'text', true),
('care-guide', 'section_3_content', 'Keep specimens away from direct sunlight, which can fade certain minerals like amethyst and rose quartz. Store pieces individually in soft cloth or padded containers to prevent scratching. Humidity control helps preserve specimens long-term.', 'text', true),
('care-guide', 'section_4_title', 'Temperature Considerations', 'text', true),
('care-guide', 'section_4_content', 'Avoid exposing your gemstones to extreme temperature changes. Rapid shifts can cause thermal shock, potentially leading to fractures in some specimens. Room temperature with stable conditions is ideal.', 'text', true),
('care-guide', 'section_5_title', 'Special Care Notes', 'text', true),
('care-guide', 'section_5_content', E'Some minerals require specific care. Labradorite should be kept dry. Ammolite benefits from occasional light oiling. If you''re unsure about caring for a specific specimen, reach out\u2014we''re happy to provide guidance tailored to your piece.', 'text', true)
ON CONFLICT (section, key) DO NOTHING;

-- ===================== SOCIALS =====================
INSERT INTO site_content (section, key, value, content_type, is_active) VALUES
('socials', 'instagram', 'https://www.instagram.com/shop.gemsutopia/', 'text', true),
('socials', 'tiktok', 'https://www.tiktok.com/@gemsutopia.shop', 'text', true),
('socials', 'youtube', 'https://www.youtube.com/channel/UC9FUB2IsVVbZly_ZGwOD2aQ', 'text', true),
('socials', 'twitter', 'https://x.com/gemsutopia_shop', 'text', true),
('socials', 'facebook_business', 'https://www.facebook.com/gemsutopia', 'text', true),
('socials', 'facebook_personal', '', 'text', true),
('socials', 'patreon', '', 'text', true),
('socials', 'gemrockauctions', '', 'text', true),
('socials', 'email', 'gemsutopia@gmail.com', 'text', true)
ON CONFLICT (section, key) DO NOTHING;
