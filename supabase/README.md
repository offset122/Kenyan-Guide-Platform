# My Kenyan Guide — Supabase Setup

## Step 1 — Apply the schema

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor** → **New query**
3. Paste the full contents of `migrations/20260805000000_initial_schema.sql`
4. Click **Run**

This creates all tables, enums, triggers, indexes, RLS policies, and enables Realtime on `messages`, `conversations`, and `listings`.

## Step 2 — Load seed data

In the same SQL Editor, open a **new query**, paste `seed.sql`, and run it.

This inserts:
- A system seed user (`seed@mykenyanguide.internal`)
- **34 listings** across all 6 categories with realistic Kenyan data

## Step 3 — Enable Realtime (if not auto-applied)

Go to **Database → Replication** and toggle the publication on for:
- `public.messages`
- `public.conversations`
- `public.listings`

The schema migration already runs `alter publication supabase_realtime add table …` — this step is only needed if that statement was skipped.

## Step 4 — Storage bucket (for listing images)

In **Storage → New bucket**, create a bucket named `listing-images` with **public** access.

Apply this policy so authenticated users can upload:

```sql
create policy "listing-images: auth upload"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid() is not null
  );

create policy "listing-images: public read"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing-images: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Step 5 — Auth settings

In **Authentication → Settings**:
- Enable **Email** provider
- Set **Site URL** to your Expo dev domain (found in the Replit preview bar)
- Add the Expo redirect URL to **Additional Redirect URLs**:
  `exp://your-expo-domain/--/auth/callback`

---

## Schema overview

| Table | Description |
|---|---|
| `profiles` | One row per auth user. Auto-created on sign-up via trigger. |
| `listings` | All service/job/product/property listings. |
| `listing_images` | Multiple images per listing, ordered by `sort_order`. |
| `reviews` | One review per user per listing. Triggers update `listing.rating` and `listing.review_count`. |
| `saved_listings` | Bookmarks (user_id, listing_id) — composite PK. |
| `conversations` | One thread per (user, listing) pair. |
| `messages` | Individual chat messages. Triggers update conversation summary. |

## RPC functions

| Function | Description |
|---|---|
| `search_listings(query, p_category, p_available, p_limit, p_offset)` | Full-text + trigram search on listings. |
| `mark_conversation_read(p_conversation_id)` | Marks all messages in a thread as read for the calling user. |
| `get_or_create_conversation(p_listing_id, p_provider_id, p_provider_name)` | Idempotent conversation creation. |

## Automatic behaviours

- **`updated_at`** — auto-set on every update for `profiles`, `listings`, `reviews`.
- **`rating` + `review_count`** — recalculated on `reviews` insert/update/delete.
- **`badge`** — auto-computed from rating, review count, and verified status.
- **`search_vector`** — auto-updated when title, subtitle, description, location, or tags change.
- **New user profile** — created automatically via trigger when a user signs up.
