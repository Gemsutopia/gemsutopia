-- Homepage Content Seed Data
-- This populates the site_content table with all homepage sections

-- Clear existing homepage content
DELETE FROM site_content WHERE section IN ('hero', 'about', 'earth_to_you', 'quality', 'cta', 'featured', 'reviews');

-- Hero Section
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('hero', 'title', 'text', 'Ethically Sourced, Naturally Found Minerals and Gems', true),
('hero', 'images', 'json', '[{"id":1,"name":"Ammolite","image":"/images/products/gem.png"},{"id":2,"name":"Labradorite","image":"/images/products/gem2.png"},{"id":3,"name":"Opal","image":"/images/products/gem3.png"},{"id":4,"name":"Tourmaline","image":"/images/products/gem4.png"},{"id":5,"name":"Ruby","image":"/images/products/gem7.png"},{"id":6,"name":"Amethyst","image":"/images/products/gem8.png"},{"id":7,"name":"Topaz","image":"/images/products/gem9.png"}]', true),
('hero', 'cta_primary_text', 'text', 'Shop Now', true),
('hero', 'cta_primary_link', 'text', '/shop', true),
('hero', 'cta_secondary_text', 'text', 'Learn More', true),
('hero', 'cta_secondary_link', 'text', '/about', true);

-- About Section
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('about', 'title', 'text', 'About Gemsutopia.', true),
('about', 'text', 'text', 'Gemsutopia is an independently owned Canadian business built on a genuine love for minerals. Our stock is carefully selected from trusted sources, with some stock collected firsthand through rockhounding trips!

Every piece in our collection tells a story millions of years in the making. From the iridescent flash of labradorite to the ancient beauty of ammolite, we take pride in offering specimens that capture nature''s artistry at its finest.

Whether you''re a seasoned collector or just beginning your journey into the world of minerals, we''re here to help you find that perfect piece. Each gem is hand-inspected and photographed to ensure what you see is exactly what you''ll receive.', true),
('about', 'image', 'image', '/images/products/gem.png', true);

-- From Earth to You Section
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('earth_to_you', 'title', 'text', 'From Earth to You.', true),
('earth_to_you', 'text', 'text', 'Our journey begins in the rugged landscapes of Canada, where we personally venture on rockhounding expeditions to uncover nature''s hidden treasures. There''s nothing quite like the thrill of discovering a stunning specimen in its natural habitat.

We''ve built relationships with ethical miners and trusted suppliers across the globe, ensuring every piece meets our strict standards for quality and authenticity. From remote mountain ranges to coastal shores, we go where the gems are.

Each stone passes through our hands before reaching yours. We clean, inspect, and photograph every specimen to showcase its true character—no filters, no enhancements, just pure natural beauty.', true),
('earth_to_you', 'image', 'image', '/images/products/gem2.png', true);

-- Quality You Can Trust Section
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('quality', 'title', 'text', 'Quality You Can Trust.', true),
('quality', 'text', 'text', 'We believe in complete transparency. Every listing includes detailed photographs taken in natural lighting, accurate measurements, and honest descriptions of any natural inclusions or characteristics that make each piece unique.

Our packaging is designed with care—each gem is wrapped securely and shipped in protective materials to ensure it arrives in perfect condition. We treat every order as if we''re sending a piece of our own collection.

Not satisfied? We stand behind our products with a hassle-free return policy. Your trust means everything to us, and we work hard to earn it with every transaction.', true),
('quality', 'image', 'image', '/images/products/gem4.png', true);

-- CTA Section
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('cta', 'title', 'text', 'Ready to Start Collecting?', true),
('cta', 'text', 'text', 'Explore our handpicked selection of ethically sourced gems and find the perfect piece for your collection.', true);

-- Featured Section Title
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('featured', 'title', 'text', 'Featured Collection', true);

-- Reviews Section Title
INSERT INTO site_content (section, key, content_type, value, is_active) VALUES
('reviews', 'title', 'text', 'Reviews from our Friends!', true);

-- Stats Seed Data (using the stats table)
DELETE FROM stats;
INSERT INTO stats (title, value, description, icon, data_source, is_real_time, sort_order, is_active) VALUES
<<<<<<< HEAD
('Years in Business', '5+', 'Years serving gem collectors', 'calendar', 'manual', false, 1, true),
('Five-Star Reviews', '175+', 'Customer satisfaction rating', 'star', 'reviews', true, 2, true),
('Countries Served', '12+', 'International shipping', 'trending-up', 'manual', false, 3, true),
('Orders Shipped', '250+', 'Premium gemstones delivered', 'package', 'manual', false, 4, true),
('Authentic Material', '100%', 'Verified authentic material', 'package', 'manual', false, 5, true);
=======
('Years in Business', '3+', 'Years serving gem collectors', 'calendar', 'manual', false, 1, true),
('Rocks Sold', '250+', 'Premium gemstones delivered', 'package', 'manual', false, 2, true),
('5 Star Reviews', '175+', 'Customer satisfaction rating', 'star', 'reviews', true, 3, true),
('Countries Served', '12+', 'International shipping', 'trending-up', 'manual', false, 4, true),
('Error-Free Orders', '200+', 'Perfect order fulfillment', 'package', 'manual', false, 5, true);
>>>>>>> bb3ed5ed1183a5b7b1183ac4f0395192fd320452
