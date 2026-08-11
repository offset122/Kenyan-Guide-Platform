-- =============================================================================
-- My Kenyan Guide — Category-Specific Fields
-- Adds columns for Emergency, Real Estate, Automobiles, Jobs, and Events
-- Apply in Supabase SQL Editor (Project → SQL Editor → New Query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add new columns to listings
-- ---------------------------------------------------------------------------
alter table public.listings
  add column if not exists facility_type text not null default '',
  add column if not exists available_247 boolean not null default false,
  add column if not exists property_type text not null default '',
  add column if not exists listing_for text not null default '',
  add column if not exists vehicle_type text not null default '',
  add column if not exists condition text not null default '',
  add column if not exists job_type text not null default '',
  add column if not exists employment_type text not null default '',
  add column if not exists salary text not null default '',
  add column if not exists education text not null default '',
  add column if not exists experience text not null default '',
  add column if not exists profile_photo text not null default '',
  add column if not exists cv_url text not null default '',
  add column if not exists event_category text not null default '',
  add column if not exists event_date text not null default '',
  add column if not exists event_time text not null default '',
  add column if not exists venue text not null default '',
  add column if not exists ticket_price text not null default '';

-- ---------------------------------------------------------------------------
-- 2. Update search_vector to include new columns
-- ---------------------------------------------------------------------------
drop trigger if exists trg_listings_search_vector on public.listings;

create or replace function public.listings_search_vector(
  title text, subtitle text, description text, location text, tags text[],
  constituency text, area_code text, keywords text[], service_type text,
  food_category text, price_range text, facility_type text, property_type text,
  vehicle_type text, job_type text, event_category text, venue text
) returns tsvector language sql immutable as $$
  select
    setweight(to_tsvector('english', coalesce(unaccent(title), '')), 'A')       ||
    setweight(to_tsvector('english', coalesce(unaccent(subtitle), '')), 'B')    ||
    setweight(to_tsvector('english', coalesce(unaccent(location), '')), 'C')    ||
    setweight(to_tsvector('english', coalesce(unaccent(description), '')), 'D') ||
    setweight(to_tsvector('english', coalesce(unaccent(array_to_string(tags, ' ')), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(constituency), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(unaccent(area_code), '')), 'C')   ||
    setweight(to_tsvector('english', coalesce(unaccent(array_to_string(keywords, ' ')), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(service_type), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(food_category), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(price_range), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(unaccent(facility_type), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(property_type), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(vehicle_type), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(job_type), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(event_category), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(unaccent(venue), '')), 'C');
$$;

create or replace function public.update_listing_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector := public.listings_search_vector(
    new.title, new.subtitle, new.description, new.location, new.tags,
    new.constituency, new.area_code, new.keywords, new.service_type,
    new.food_category, new.price_range, new.facility_type, new.property_type,
    new.vehicle_type, new.job_type, new.event_category, new.venue
  );
  return new;
end;
$$;

create trigger trg_listings_search_vector
  before insert or update of title, subtitle, description, location, tags, constituency, area_code, keywords, service_type, food_category, price_range, facility_type, property_type, vehicle_type, job_type, event_category, venue
  on public.listings
  for each row execute function public.update_listing_search_vector();

-- ---------------------------------------------------------------------------
-- 3. New indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_listings_facility_type on public.listings (facility_type);
create index if not exists idx_listings_available_247 on public.listings (available_247);
create index if not exists idx_listings_property_type on public.listings (property_type);
create index if not exists idx_listings_listing_for on public.listings (listing_for);
create index if not exists idx_listings_vehicle_type on public.listings (vehicle_type);
create index if not exists idx_listings_condition on public.listings (condition);
create index if not exists idx_listings_job_type on public.listings (job_type);
create index if not exists idx_listings_employment_type on public.listings (employment_type);
create index if not exists idx_listings_event_category on public.listings (event_category);
create index if not exists idx_listings_event_date on public.listings (event_date);
create index if not exists idx_listings_venue on public.listings (venue);
