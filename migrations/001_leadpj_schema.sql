-- Lead PJ Schema — Paperjam Leads
-- Run this in Supabase SQL Editor

-- Users table (simple auth, not Supabase Auth)
CREATE TABLE leadpj_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO leadpj_users (username, password_hash, display_name) VALUES
    ('valentin', 'Paperjamclub1!', 'Valentin'),
    ('ivan', 'Paperjamclub1!', 'Ivan');

-- Settings table (calendly link, caller name, etc.)
CREATE TABLE leadpj_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO leadpj_settings (key, value) VALUES
    ('calendly_link', ''),
    ('caller_name', 'Valentin'),
    ('company_name', 'Paperjam Club');

-- Leads table
CREATE TABLE leadpj_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    contact_title TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    phone_type TEXT DEFAULT 'mobile' CHECK (phone_type IN ('mobile', 'landline')),
    website TEXT,
    source TEXT DEFAULT 'manual',
    industry TEXT,
    employees TEXT,
    city TEXT DEFAULT 'Luxembourg',
    status TEXT DEFAULT 'nuevo' CHECK (status IN (
        'nuevo', 'contactado', 'en_negociacion', 'cerrado_ganado', 'cerrado_perdido'
    )),
    assigned_to UUID REFERENCES leadpj_users(id),
    value DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    lost_reason TEXT,
    quality_score INTEGER DEFAULT 5 CHECK (quality_score >= 1 AND quality_score <= 10),
    -- Tracking checkboxes
    is_member BOOLEAN DEFAULT false,
    is_contacted BOOLEAN DEFAULT false,
    has_responded BOOLEAN DEFAULT false,
    call_scheduled BOOLEAN DEFAULT false,
    became_member BOOLEAN DEFAULT false,
    --
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leadpj_leads_status ON leadpj_leads(status);
CREATE INDEX idx_leadpj_leads_assigned ON leadpj_leads(assigned_to);
CREATE INDEX idx_leadpj_leads_quality ON leadpj_leads(quality_score DESC);
CREATE INDEX idx_leadpj_leads_industry ON leadpj_leads(industry);

-- Activities table
CREATE TABLE leadpj_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leadpj_leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES leadpj_users(id),
    type TEXT NOT NULL CHECK (type IN (
        'note', 'status_change', 'call', 'email', 'meeting', 'task', 'created', 'template_sent'
    )),
    description TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leadpj_activities_lead ON leadpj_activities(lead_id);
CREATE INDEX idx_leadpj_activities_date ON leadpj_activities(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE leadpj_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE leadpj_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE leadpj_settings;
