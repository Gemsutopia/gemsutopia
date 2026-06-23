-- =============================================
-- GEMSUTOPIA DATABASE SCHEMA
-- 010_content.sql - CMS Content
-- =============================================

-- Static pages (About, Privacy Policy, Terms, etc.)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,

  -- Layout
  template TEXT DEFAULT 'default', -- 'default', 'full-width', 'sidebar'
  featured_image TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_in_menu BOOLEAN DEFAULT false,
  menu_order INTEGER DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,

  -- Access
  requires_auth BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- FAQ entries
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Organization
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Stats
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gem facts (educational content)
CREATE TABLE IF NOT EXISTS gem_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  short_content TEXT, -- For tooltips/previews

  -- Media
  image TEXT,
  video_url TEXT,

  -- Classification
  gemstone_type TEXT, -- e.g., 'Ruby', 'Diamond', etc.
  category TEXT DEFAULT 'general', -- 'history', 'care', 'buying_guide', etc.

  -- Display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Source
  source TEXT,
  source_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Homepage banners/sliders
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  -- Media
  image TEXT NOT NULL,
  mobile_image TEXT, -- Different image for mobile
  video_url TEXT,

  -- Link
  link_url TEXT,
  link_text TEXT,
  link_target TEXT DEFAULT '_self', -- '_self', '_blank'

  -- Display
  position TEXT DEFAULT 'homepage_hero', -- Where banner appears
  sort_order INTEGER DEFAULT 0,

  -- Timing
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  -- Style
  text_color TEXT DEFAULT '#ffffff',
  overlay_color TEXT,
  overlay_opacity DECIMAL(3,2) DEFAULT 0.3,
  text_position TEXT DEFAULT 'center', -- 'left', 'center', 'right'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'spam', 'archived')),
  replied_at TIMESTAMP WITH TIME ZONE,
  reply_message TEXT,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'contact_form',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_menu ON pages(is_in_menu, menu_order) WHERE is_in_menu = true;
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq(is_active, sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gem_facts_type ON gem_facts(gemstone_type);
CREATE INDEX IF NOT EXISTS idx_gem_facts_active ON gem_facts(is_active, sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position, sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);

-- Triggers
DROP TRIGGER IF EXISTS trigger_pages_updated_at ON pages;
CREATE TRIGGER trigger_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_faq_updated_at ON faq;
CREATE TRIGGER trigger_faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gem_facts_updated_at ON gem_facts;
CREATE TRIGGER trigger_gem_facts_updated_at
  BEFORE UPDATE ON gem_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_banners_updated_at ON banners;
CREATE TRIGGER trigger_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
