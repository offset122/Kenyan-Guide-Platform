-- =============================================================================
-- My Kenyan Guide — Initial Database Schema
-- Apply in Supabase SQL Editor (Project → SQL Editor → New Query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";      -- trigram full-text search
create extension if not exists "unaccent";      -- accent-insensitive search

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.account_type as enum (
    'customer', 'provider', 'business', 'employer', 'agent'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.category_id_enum as enum (
    'providers', 'businesses', 'emergency', 'jobs', 'products', 'realestate'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. Shared trigger: auto-set updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. profiles  (one row per auth.users entry)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  name          text        not null default '',
  phone         text        not null default '',
  account_type  public.account_type not null default 'customer',
  bio           text,
  location      text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(
      (new.raw_user_meta_data->>'account_type')::public.account_type,
      'customer'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. listings
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id              uuid                      primary key default uuid_generate_v4(),
  category_id     public.category_id_enum   not null,
  title           text                      not null,
  subtitle        text                      not null default '',
  description     text                      not null default '',
  location        text                      not null default '',
  county          text,
  price           text,
  phone           text                      not null default '',
  tags            text[]                    not null default '{}',
  user_id         uuid                      not null references public.profiles(id) on delete cascade,
  verified        boolean                   not null default false,
  available       boolean                   not null default true,
  -- badge is auto-computed but can also be set manually by admins
  badge           text,
  -- rating & review_count maintained by trigger on reviews
  rating          numeric(3,2)              not null default 0 check (rating between 0 and 5),
  review_count    integer                   not null default 0 check (review_count >= 0),
  -- full-text search vector (auto-updated by trigger)
  search_vector   tsvector,
  created_at      timestamptz               not null default now(),
  updated_at      timestamptz               not null default now()
);

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Full-text search vector
create or replace function public.listings_search_vector(
  title text, subtitle text, description text, location text, tags text[]
) returns tsvector language sql immutable as $$
  select
    setweight(to_tsvector('english', coalesce(unaccent(title), '')), 'A')       ||
    setweight(to_tsvector('english', coalesce(unaccent(subtitle), '')), 'B')    ||
    setweight(to_tsvector('english', coalesce(unaccent(location), '')), 'C')    ||
    setweight(to_tsvector('english', coalesce(unaccent(description), '')), 'D') ||
    setweight(to_tsvector('english', coalesce(unaccent(array_to_string(tags, ' ')), '')), 'B');
$$;

create or replace function public.update_listing_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector := public.listings_search_vector(
    new.title, new.subtitle, new.description, new.location, new.tags
  );
  return new;
end;
$$;

drop trigger if exists trg_listings_search_vector on public.listings;
create trigger trg_listings_search_vector
  before insert or update of title, subtitle, description, location, tags
  on public.listings
  for each row execute function public.update_listing_search_vector();

-- Auto-compute badge based on rating + review_count + verified
create or replace function public.compute_listing_badge(
  p_rating numeric, p_review_count integer, p_verified boolean, p_created_at timestamptz
) returns text language sql immutable as $$
  select case
    when p_rating >= 4.8 and p_review_count >= 100 then 'Top Rated'
    when p_verified and p_rating >= 4.5              then 'Verified Pro'
    when p_review_count >= 50                        then 'Popular'
    when p_created_at > now() - interval '14 days'  then 'New'
    else null
  end;
$$;

create or replace function public.update_listing_badge()
returns trigger language plpgsql as $$
begin
  -- Only auto-compute if badge not explicitly overridden by an admin
  new.badge := public.compute_listing_badge(
    new.rating, new.review_count, new.verified, new.created_at
  );
  return new;
end;
$$;

drop trigger if exists trg_listings_badge on public.listings;
create trigger trg_listings_badge
  before insert or update of rating, review_count, verified
  on public.listings
  for each row execute function public.update_listing_badge();

-- ---------------------------------------------------------------------------
-- 5. listing_images
-- ---------------------------------------------------------------------------
create table if not exists public.listing_images (
  id          uuid        primary key default uuid_generate_v4(),
  listing_id  uuid        not null references public.listings(id) on delete cascade,
  url         text        not null,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid        primary key default uuid_generate_v4(),
  listing_id  uuid        not null references public.listings(id) on delete cascade,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  rating      integer     not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- one review per user per listing
  unique (listing_id, user_id)
);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Recalculate listing rating + review_count after any review change
create or replace function public.refresh_listing_rating()
returns trigger language plpgsql as $$
declare
  v_listing_id uuid;
begin
  v_listing_id := coalesce(new.listing_id, old.listing_id);

  update public.listings
  set
    rating       = coalesce((select avg(rating) from public.reviews where listing_id = v_listing_id), 0),
    review_count = (select count(*) from public.reviews where listing_id = v_listing_id)
  where id = v_listing_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_refresh_rating on public.reviews;
create trigger trg_reviews_refresh_rating
  after insert or update of rating or delete
  on public.reviews
  for each row execute function public.refresh_listing_rating();

-- ---------------------------------------------------------------------------
-- 7. saved_listings  (bookmarks)
-- ---------------------------------------------------------------------------
create table if not exists public.saved_listings (
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  listing_id  uuid        not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------------------------------------------------------------------------
-- 8. conversations
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id              uuid                    primary key default uuid_generate_v4(),
  listing_id      uuid                    not null references public.listings(id) on delete cascade,
  listing_title   text                    not null default '',
  category_id     public.category_id_enum not null,
  -- user_id  = the person who reached out (customer/inquirer)
  user_id         uuid                    not null references public.profiles(id) on delete cascade,
  user_name       text                    not null default '',
  -- provider_id = the listing owner
  provider_id     uuid                    not null references public.profiles(id) on delete cascade,
  provider_name   text                    not null default '',
  last_message    text,
  last_message_at timestamptz,
  -- unread count from the perspective of whoever is not the last sender
  unread_count    integer                 not null default 0 check (unread_count >= 0),
  created_at      timestamptz             not null default now(),
  -- one thread per (inquirer, listing) pair
  unique (listing_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 9. messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id              uuid        primary key default uuid_generate_v4(),
  conversation_id uuid        not null references public.conversations(id) on delete cascade,
  sender_id       uuid        not null references public.profiles(id) on delete cascade,
  sender_name     text        not null default '',
  text            text        not null,
  read            boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- After a message is inserted, update conversation summary + unread count
create or replace function public.handle_new_message()
returns trigger language plpgsql as $$
begin
  update public.conversations
  set
    last_message    = new.text,
    last_message_at = new.created_at,
    unread_count    = unread_count + 1
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_messages_update_conversation on public.messages;
create trigger trg_messages_update_conversation
  after insert on public.messages
  for each row execute function public.handle_new_message();

-- ---------------------------------------------------------------------------
-- 10. Indexes
-- ---------------------------------------------------------------------------
-- listings
create index if not exists idx_listings_category    on public.listings (category_id);
create index if not exists idx_listings_user        on public.listings (user_id);
create index if not exists idx_listings_available   on public.listings (available) where available = true;
create index if not exists idx_listings_verified    on public.listings (verified) where verified = true;
create index if not exists idx_listings_rating      on public.listings (rating desc);
create index if not exists idx_listings_created     on public.listings (created_at desc);
create index if not exists idx_listings_fts         on public.listings using gin (search_vector);
create index if not exists idx_listings_tags        on public.listings using gin (tags);

-- reviews
create index if not exists idx_reviews_listing     on public.reviews (listing_id);
create index if not exists idx_reviews_user        on public.reviews (user_id);

-- saved_listings
create index if not exists idx_saved_user          on public.saved_listings (user_id);
create index if not exists idx_saved_listing       on public.saved_listings (listing_id);

-- conversations
create index if not exists idx_conversations_user      on public.conversations (user_id);
create index if not exists idx_conversations_provider  on public.conversations (provider_id);
create index if not exists idx_conversations_listing   on public.conversations (listing_id);
create index if not exists idx_conversations_updated   on public.conversations (last_message_at desc nulls last);

-- messages
create index if not exists idx_messages_conversation  on public.messages (conversation_id, created_at);
create index if not exists idx_messages_unread        on public.messages (conversation_id, read) where read = false;

-- listing_images
create index if not exists idx_listing_images_listing on public.listing_images (listing_id, sort_order);

-- ---------------------------------------------------------------------------
-- 11. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.listings        enable row level security;
alter table public.listing_images  enable row level security;
alter table public.reviews         enable row level security;
alter table public.saved_listings  enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;

-- ---- profiles ----
drop policy if exists "profiles: public read"      on public.profiles;
drop policy if exists "profiles: own update"       on public.profiles;
drop policy if exists "profiles: own insert"       on public.profiles;

create policy "profiles: public read"
  on public.profiles for select
  using (true);

create policy "profiles: own insert"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles: own update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- listings ----
drop policy if exists "listings: public read"      on public.listings;
drop policy if exists "listings: auth insert"      on public.listings;
drop policy if exists "listings: own update"       on public.listings;
drop policy if exists "listings: own delete"       on public.listings;

create policy "listings: public read"
  on public.listings for select
  using (true);

create policy "listings: auth insert"
  on public.listings for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "listings: own update"
  on public.listings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "listings: own delete"
  on public.listings for delete
  using (user_id = auth.uid());

-- ---- listing_images ----
drop policy if exists "listing_images: public read"  on public.listing_images;
drop policy if exists "listing_images: owner write"  on public.listing_images;

create policy "listing_images: public read"
  on public.listing_images for select
  using (true);

create policy "listing_images: owner write"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

-- ---- reviews ----
drop policy if exists "reviews: public read"    on public.reviews;
drop policy if exists "reviews: auth insert"    on public.reviews;
drop policy if exists "reviews: own update"     on public.reviews;
drop policy if exists "reviews: own delete"     on public.reviews;

create policy "reviews: public read"
  on public.reviews for select
  using (true);

create policy "reviews: auth insert"
  on public.reviews for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "reviews: own update"
  on public.reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reviews: own delete"
  on public.reviews for delete
  using (user_id = auth.uid());

-- ---- saved_listings ----
drop policy if exists "saved: own all"  on public.saved_listings;

create policy "saved: own all"
  on public.saved_listings for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- conversations ----
drop policy if exists "conversations: participant read"   on public.conversations;
drop policy if exists "conversations: auth insert"        on public.conversations;
drop policy if exists "conversations: participant update" on public.conversations;

create policy "conversations: participant read"
  on public.conversations for select
  using (user_id = auth.uid() or provider_id = auth.uid());

create policy "conversations: auth insert"
  on public.conversations for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "conversations: participant update"
  on public.conversations for update
  using (user_id = auth.uid() or provider_id = auth.uid());

-- ---- messages ----
drop policy if exists "messages: participant read"   on public.messages;
drop policy if exists "messages: participant insert" on public.messages;
drop policy if exists "messages: own update"         on public.messages;

create policy "messages: participant read"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or c.provider_id = auth.uid())
    )
  );

create policy "messages: participant insert"
  on public.messages for insert
  with check (
    auth.uid() is not null
    and sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or c.provider_id = auth.uid())
    )
  );

create policy "messages: own update"
  on public.messages for update
  using (sender_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 12. Enable Realtime on live-data tables
-- ---------------------------------------------------------------------------
-- Run in Supabase Dashboard → Database → Replication if not already enabled,
-- or execute the statements below.
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.listings;

-- ---------------------------------------------------------------------------
-- 13. Helper RPC functions (callable from the app via supabase.rpc())
-- ---------------------------------------------------------------------------

-- Full-text + trigram search on listings
create or replace function public.search_listings(
  query        text,
  p_category   public.category_id_enum default null,
  p_available  boolean                 default true,
  p_limit      integer                 default 20,
  p_offset     integer                 default 0
)
returns setof public.listings
language sql stable as $$
  select l.*
  from public.listings l
  where
    (p_available is null or l.available = p_available)
    and (p_category is null or l.category_id = p_category)
    and (
      query is null or query = ''
      or l.search_vector @@ plainto_tsquery('english', unaccent(query))
      or l.title         ilike '%' || query || '%'
      or l.subtitle      ilike '%' || query || '%'
      or l.location      ilike '%' || query || '%'
      or exists (
        select 1 from unnest(l.tags) t where t ilike '%' || query || '%'
      )
    )
  order by
    case when query is not null and query <> ''
      then ts_rank(l.search_vector, plainto_tsquery('english', unaccent(query)))
      else 0
    end desc,
    l.rating desc,
    l.created_at desc
  limit  p_limit
  offset p_offset;
$$;

-- Mark all messages in a conversation as read for the calling user
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.messages
  set read = true
  where conversation_id = p_conversation_id
    and sender_id <> auth.uid()
    and read = false;

  update public.conversations
  set unread_count = 0
  where id = p_conversation_id
    and (user_id = auth.uid() or provider_id = auth.uid());
end;
$$;

-- Get or create a conversation for a listing
create or replace function public.get_or_create_conversation(
  p_listing_id    uuid,
  p_provider_id   uuid,
  p_provider_name text
)
returns public.conversations
language plpgsql security definer set search_path = public as $$
declare
  v_conv  public.conversations;
  v_title text;
  v_cat   public.category_id_enum;
  v_name  text;
begin
  -- Try to find existing conversation
  select * into v_conv
  from public.conversations
  where listing_id = p_listing_id and user_id = auth.uid();

  if found then
    return v_conv;
  end if;

  -- Look up listing details
  select title, category_id into v_title, v_cat
  from public.listings where id = p_listing_id;

  -- Get caller's name
  select name into v_name from public.profiles where id = auth.uid();

  -- Create conversation
  insert into public.conversations
    (listing_id, listing_title, category_id, user_id, user_name, provider_id, provider_name)
  values
    (p_listing_id, v_title, v_cat, auth.uid(), v_name, p_provider_id, p_provider_name)
  returning * into v_conv;

  return v_conv;
end;
$$;
