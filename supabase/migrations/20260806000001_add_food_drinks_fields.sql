-- =============================================================================
-- My Kenyan Guide — Food & Drinks Category Fields
-- Adds food_category, delivery, and price_range columns to listings.
-- Apply in Supabase SQL Editor (Project → SQL Editor → New Query)
-- =============================================================================

alter table public.listings
  add column if not exists food_category text not null default '',
  add column if not exists delivery boolean not null default false,
  add column if not exists price_range text not null default '';

-- ---------------------------------------------------------------------------
-- Update search_vector to include new columns
-- ---------------------------------------------------------------------------
drop trigger if exists trg_listings_search_vector on public.listings;

create or replace function public.listings_search_vector(
  title text, subtitle text, description text, location text, tags text[],
  constituency text, area_code text, keywords text[], service_type text,
  food_category text, price_range text
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
    setweight(to_tsvector('english', coalesce(unaccent(price_range), '')), 'C');
$$;

create or replace function public.update_listing_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector := public.listings_search_vector(
    new.title, new.subtitle, new.description, new.location, new.tags,
    new.constituency, new.area_code, new.keywords, new.service_type,
    new.food_category, new.price_range
  );
  return new;
end;
$$;

create trigger trg_listings_search_vector
  before insert or update of title, subtitle, description, location, tags, constituency, area_code, keywords, service_type, food_category, price_range
  on public.listings
  for each row execute function public.update_listing_search_vector();

-- ---------------------------------------------------------------------------
-- New indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_listings_food_category on public.listings (food_category);
create index if not exists idx_listings_delivery on public.listings (delivery);
create index if not exists idx_listings_price_range on public.listings (price_range);

-- ---------------------------------------------------------------------------
-- Update search_listings RPC to support fuzzy search on new columns
-- ---------------------------------------------------------------------------
drop function if exists public.search_listings;

create or replace function public.search_listings(
  query        text,
  p_category   public.category_id_enum default null,
  p_available  boolean                 default true,
  p_limit      integer                 default 20,
  p_offset     integer                 default 0
)
returns setof public.listings
language plpgsql stable as $$
declare
  v_query text := trim(coalesce(query, ''));
begin
  return query
    select l.*
    from public.listings l
    where
      (p_available is null or l.available = p_available)
      and (p_category is null or l.category_id = p_category)
      and (
        v_query = ''
        or l.search_vector @@ plainto_tsquery('english', unaccent(v_query))
        or l.title         ilike '%' || v_query || '%'
        or l.subtitle      ilike '%' || v_query || '%'
        or l.location      ilike '%' || v_query || '%'
        or l.constituency  ilike '%' || v_query || '%'
        or l.area_code     ilike '%' || v_query || '%'
        or l.food_category ilike '%' || v_query || '%'
        or l.price_range   ilike '%' || v_query || '%'
        or exists (select 1 from unnest(l.tags) t where t ilike '%' || v_query || '%')
        or exists (select 1 from unnest(l.keywords) k where k ilike '%' || v_query || '%')
        or exists (select 1 from unnest(l.keywords) k where k % v_query)
        or l.service_type  ilike '%' || v_query || '%'
      )
    order by
      case when v_query <> ''
        then greatest(
          ts_rank(l.search_vector, plainto_tsquery('english', unaccent(v_query))),
          (select similarity(l.title, v_query)),
          (select similarity(l.location, v_query)),
          (select max(similarity(k, v_query)) from unnest(l.keywords) k)
        )
        else 0
      end desc,
      l.rating desc,
      l.created_at desc
    limit  p_limit
    offset p_offset;
$$;