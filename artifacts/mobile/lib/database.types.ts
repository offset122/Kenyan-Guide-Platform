// ============================================================================
// Auto-mirrored from supabase/migrations/20260805000000_initial_schema.sql
// Keep in sync with the database schema.
// ============================================================================

export type AccountType = "customer" | "provider" | "business" | "employer" | "agent";
export type CategoryId = "providers" | "businesses" | "emergency" | "jobs" | "products" | "realestate";

// ---------------------------------------------------------------------------
// Table row types (what Supabase returns)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  name: string;
  phone: string;
  account_type: AccountType;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  category_id: CategoryId;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  county: string | null;
  price: string | null;
  phone: string;
  tags: string[];
  user_id: string;
  verified: boolean;
  available: boolean;
  badge: string | null;
  rating: number;
  review_count: number;
  search_vector: string | null; // tsvector — not used client-side
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number; // 1–5
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedListing {
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing_title: string;
  category_id: CategoryId;
  user_id: string;     // the person who inquired
  user_name: string;
  provider_id: string; // the listing owner
  provider_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Insert/update payload types (subsets used when writing to the DB)
// ---------------------------------------------------------------------------

export type ProfileUpdate = Partial<
  Pick<Profile, "name" | "phone" | "account_type" | "bio" | "location" | "avatar_url">
>;

export type ListingInsert = Pick<
  Listing,
  | "category_id"
  | "title"
  | "subtitle"
  | "description"
  | "location"
  | "county"
  | "price"
  | "phone"
  | "tags"
  | "available"
>;

export type ListingUpdate = Partial<ListingInsert & Pick<Listing, "available">>;

export type ReviewInsert = Pick<Review, "listing_id" | "rating" | "comment">;

export type MessageInsert = Pick<Message, "conversation_id" | "text">;

// ---------------------------------------------------------------------------
// Full Supabase Database type (for createClient<Database>())
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: ProfileUpdate;
      };
      listings: {
        Row: Listing;
        Insert: ListingInsert & { user_id: string };
        Update: ListingUpdate;
      };
      listing_images: {
        Row: ListingImage;
        Insert: Omit<ListingImage, "id" | "created_at">;
        Update: Partial<Pick<ListingImage, "url" | "sort_order">>;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert & { user_id: string };
        Update: Partial<Pick<Review, "rating" | "comment">>;
      };
      saved_listings: {
        Row: SavedListing;
        Insert: Pick<SavedListing, "user_id" | "listing_id">;
        Update: never;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "last_message" | "last_message_at" | "unread_count" | "created_at">;
        Update: Partial<Pick<Conversation, "last_message" | "last_message_at" | "unread_count">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "read" | "created_at">;
        Update: Partial<Pick<Message, "read">>;
      };
    };
    Functions: {
      search_listings: {
        Args: {
          query: string;
          p_category?: CategoryId | null;
          p_available?: boolean | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Listing[];
      };
      mark_conversation_read: {
        Args: { p_conversation_id: string };
        Returns: void;
      };
      get_or_create_conversation: {
        Args: {
          p_listing_id: string;
          p_provider_id: string;
          p_provider_name: string;
        };
        Returns: Conversation;
      };
    };
    Enums: {
      account_type: AccountType;
      category_id_enum: CategoryId;
    };
  };
}
