import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_legal_documents_document" AS ENUM('legal-notice', 'terms-of-sale', 'terms-of-use', 'privacy');
  CREATE TYPE "public"."enum__legal_documents_v_version_document" AS ENUM('legal-notice', 'terms-of-sale', 'terms-of-use', 'privacy');
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_w480_url" varchar,
  	"sizes_w480_width" numeric,
  	"sizes_w480_height" numeric,
  	"sizes_w480_mime_type" varchar,
  	"sizes_w480_filesize" numeric,
  	"sizes_w480_filename" varchar,
  	"sizes_w960_url" varchar,
  	"sizes_w960_width" numeric,
  	"sizes_w960_height" numeric,
  	"sizes_w960_mime_type" varchar,
  	"sizes_w960_filesize" numeric,
  	"sizes_w960_filename" varchar,
  	"sizes_w1440_url" varchar,
  	"sizes_w1440_width" numeric,
  	"sizes_w1440_height" numeric,
  	"sizes_w1440_mime_type" varchar,
  	"sizes_w1440_filesize" numeric,
  	"sizes_w1440_filename" varchar,
  	"sizes_w2048_url" varchar,
  	"sizes_w2048_width" numeric,
  	"sizes_w2048_height" numeric,
  	"sizes_w2048_mime_type" varchar,
  	"sizes_w2048_filesize" numeric,
  	"sizes_w2048_filename" varchar
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"version_sizes_w480_url" varchar,
  	"version_sizes_w480_width" numeric,
  	"version_sizes_w480_height" numeric,
  	"version_sizes_w480_mime_type" varchar,
  	"version_sizes_w480_filesize" numeric,
  	"version_sizes_w480_filename" varchar,
  	"version_sizes_w960_url" varchar,
  	"version_sizes_w960_width" numeric,
  	"version_sizes_w960_height" numeric,
  	"version_sizes_w960_mime_type" varchar,
  	"version_sizes_w960_filesize" numeric,
  	"version_sizes_w960_filename" varchar,
  	"version_sizes_w1440_url" varchar,
  	"version_sizes_w1440_width" numeric,
  	"version_sizes_w1440_height" numeric,
  	"version_sizes_w1440_mime_type" varchar,
  	"version_sizes_w1440_filesize" numeric,
  	"version_sizes_w1440_filename" varchar,
  	"version_sizes_w2048_url" varchar,
  	"version_sizes_w2048_width" numeric,
  	"version_sizes_w2048_height" numeric,
  	"version_sizes_w2048_mime_type" varchar,
  	"version_sizes_w2048_filesize" numeric,
  	"version_sizes_w2048_filename" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"detail" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_awards_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_year" numeric NOT NULL,
  	"version_title" varchar NOT NULL,
  	"version_summary" varchar NOT NULL,
  	"version_detail" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "legal_documents_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"anchor" varchar NOT NULL,
  	"content" jsonb NOT NULL
  );
  
  CREATE TABLE "legal_documents_appendices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"anchor" varchar NOT NULL,
  	"content" jsonb NOT NULL
  );
  
  CREATE TABLE "legal_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"document" "enum_legal_documents_document" NOT NULL,
  	"title" varchar NOT NULL,
  	"effective_date" timestamp(3) with time zone NOT NULL,
  	"preamble" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_legal_documents_v_version_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"anchor" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_legal_documents_v_version_appendices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"anchor" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_legal_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_document" "enum__legal_documents_v_version_document" NOT NULL,
  	"version_title" varchar NOT NULL,
  	"version_effective_date" timestamp(3) with time zone NOT NULL,
  	"version_preamble" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "families" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" varchar NOT NULL,
  	"name" varchar,
  	"photo_id" integer,
  	"introduction" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_families_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category" varchar NOT NULL,
  	"version_name" varchar,
  	"version_photo_id" integer,
  	"version_introduction" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_stories_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "product_stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product" varchar NOT NULL,
  	"name" varchar,
  	"making" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_product_stories_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_product" varchar NOT NULL,
  	"version_name" varchar,
  	"version_making" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "_users_v_version_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "_users_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_email" varchar NOT NULL,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_reset_password_requested_at" timestamp(3) with time zone,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"awards_id" integer,
  	"legal_documents_id" integer,
  	"families_id" integer,
  	"product_stories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_estate_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "home_miniatures_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_text" varchar,
  	"hero_cta_label" varchar NOT NULL,
  	"hero_cta_url" varchar NOT NULL,
  	"hero_photo_start_id" integer,
  	"hero_photo_id" integer,
  	"hero_photo_end_id" integer,
  	"cellar_title" varchar NOT NULL,
  	"estate_title" varchar NOT NULL,
  	"estate_photo_id" integer,
  	"orchard_title" varchar NOT NULL,
  	"orchard_text" varchar,
  	"orchard_link_label" varchar NOT NULL,
  	"orchard_link_url" varchar NOT NULL,
  	"families_title" varchar NOT NULL,
  	"miniatures_title" varchar NOT NULL,
  	"miniatures_text" varchar,
  	"miniatures_cta_label" varchar NOT NULL,
  	"miniatures_cta_url" varchar NOT NULL,
  	"awards_title" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_home_v_version_estate_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_miniatures_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_text" varchar,
  	"version_hero_cta_label" varchar NOT NULL,
  	"version_hero_cta_url" varchar NOT NULL,
  	"version_hero_photo_start_id" integer,
  	"version_hero_photo_id" integer,
  	"version_hero_photo_end_id" integer,
  	"version_cellar_title" varchar NOT NULL,
  	"version_estate_title" varchar NOT NULL,
  	"version_estate_photo_id" integer,
  	"version_orchard_title" varchar NOT NULL,
  	"version_orchard_text" varchar,
  	"version_orchard_link_label" varchar NOT NULL,
  	"version_orchard_link_url" varchar NOT NULL,
  	"version_families_title" varchar NOT NULL,
  	"version_miniatures_title" varchar NOT NULL,
  	"version_miniatures_text" varchar,
  	"version_miniatures_cta_label" varchar NOT NULL,
  	"version_miniatures_cta_url" varchar NOT NULL,
  	"version_awards_title" varchar NOT NULL,
  	"version_seo_title" varchar NOT NULL,
  	"version_seo_description" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_home_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "shop" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_text" varchar,
  	"quote_text" varchar NOT NULL,
  	"quote_caption" varchar,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_shop_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_text" varchar,
  	"version_quote_text" varchar NOT NULL,
  	"version_quote_caption" varchar,
  	"version_seo_title" varchar NOT NULL,
  	"version_seo_description" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "product_page_details_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "product_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"story_making_title" varchar NOT NULL,
  	"story_steps_title" varchar NOT NULL,
  	"tasting_title" varchar NOT NULL,
  	"tasting_text" varchar,
  	"tasting_photo_id" integer,
  	"related_title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_product_page_v_version_details_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_product_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_story_making_title" varchar NOT NULL,
  	"version_story_steps_title" varchar NOT NULL,
  	"version_tasting_title" varchar NOT NULL,
  	"version_tasting_text" varchar,
  	"version_tasting_photo_id" integer,
  	"version_related_title" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "estate_family_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "estate_made_here_workshops" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"photo_id" integer
  );
  
  CREATE TABLE "estate_activities_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL
  );
  
  CREATE TABLE "estate" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_text" varchar,
  	"hero_photo_id" integer,
  	"family_title" varchar NOT NULL,
  	"family_link_label" varchar NOT NULL,
  	"family_link_url" varchar NOT NULL,
  	"family_photo_id" integer,
  	"figures_text" varchar NOT NULL,
  	"made_here_title" varchar NOT NULL,
  	"made_here_text" varchar,
  	"awards_title" varchar NOT NULL,
  	"activities_title" varchar NOT NULL,
  	"activities_text" varchar,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"search_summary" varchar NOT NULL,
  	"search_keywords" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_estate_v_version_family_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_estate_v_version_made_here_workshops" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_estate_v_version_activities_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_estate_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_text" varchar,
  	"version_hero_photo_id" integer,
  	"version_family_title" varchar NOT NULL,
  	"version_family_link_label" varchar NOT NULL,
  	"version_family_link_url" varchar NOT NULL,
  	"version_family_photo_id" integer,
  	"version_figures_text" varchar NOT NULL,
  	"version_made_here_title" varchar NOT NULL,
  	"version_made_here_text" varchar,
  	"version_awards_title" varchar NOT NULL,
  	"version_activities_title" varchar NOT NULL,
  	"version_activities_text" varchar,
  	"version_seo_title" varchar NOT NULL,
  	"version_seo_description" varchar NOT NULL,
  	"version_search_summary" varchar NOT NULL,
  	"version_search_keywords" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orchard_apples_varieties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "orchard_pears_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "orchard_harvest_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "orchard_animals_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "orchard" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_text" varchar,
  	"hero_photo_id" integer,
  	"apples_title" varchar NOT NULL,
  	"apples_text" varchar,
  	"pears_title" varchar NOT NULL,
  	"pears_link_label" varchar NOT NULL,
  	"pears_link_url" varchar NOT NULL,
  	"pears_photo_id" integer,
  	"harvest_title" varchar NOT NULL,
  	"additives_title" varchar NOT NULL,
  	"additives_text" varchar,
  	"animals_title" varchar NOT NULL,
  	"animals_link_label" varchar NOT NULL,
  	"animals_link_url" varchar NOT NULL,
  	"animals_photo_id" integer,
  	"taste_title" varchar NOT NULL,
  	"taste_cta_label" varchar NOT NULL,
  	"taste_cta_url" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"search_summary" varchar NOT NULL,
  	"search_keywords" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_orchard_v_version_apples_varieties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orchard_v_version_pears_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orchard_v_version_harvest_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orchard_v_version_animals_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orchard_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_text" varchar,
  	"version_hero_photo_id" integer,
  	"version_apples_title" varchar NOT NULL,
  	"version_apples_text" varchar,
  	"version_pears_title" varchar NOT NULL,
  	"version_pears_link_label" varchar NOT NULL,
  	"version_pears_link_url" varchar NOT NULL,
  	"version_pears_photo_id" integer,
  	"version_harvest_title" varchar NOT NULL,
  	"version_additives_title" varchar NOT NULL,
  	"version_additives_text" varchar,
  	"version_animals_title" varchar NOT NULL,
  	"version_animals_link_label" varchar NOT NULL,
  	"version_animals_link_url" varchar NOT NULL,
  	"version_animals_photo_id" integer,
  	"version_taste_title" varchar NOT NULL,
  	"version_taste_cta_label" varchar NOT NULL,
  	"version_taste_cta_url" varchar NOT NULL,
  	"version_seo_title" varchar NOT NULL,
  	"version_seo_description" varchar NOT NULL,
  	"version_search_summary" varchar NOT NULL,
  	"version_search_keywords" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "weddings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_text" varchar,
  	"hero_cta_label" varchar NOT NULL,
  	"hero_photo_id" integer,
  	"offer_title" varchar NOT NULL,
  	"offer_miniatures_title" varchar NOT NULL,
  	"offer_miniatures_text" varchar,
  	"offer_miniatures_product" varchar,
  	"offer_miniatures_photo_id" integer,
  	"offer_drinks_title" varchar NOT NULL,
  	"offer_drinks_text" varchar,
  	"offer_drinks_photo_id" integer,
  	"offer_venue_title" varchar NOT NULL,
  	"offer_venue_text" varchar,
  	"offer_venue_link_label" varchar NOT NULL,
  	"offer_venue_link_url" varchar NOT NULL,
  	"quote_title" varchar NOT NULL,
  	"quote_text" varchar,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"search_summary" varchar NOT NULL,
  	"search_keywords" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_weddings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_text" varchar,
  	"version_hero_cta_label" varchar NOT NULL,
  	"version_hero_photo_id" integer,
  	"version_offer_title" varchar NOT NULL,
  	"version_offer_miniatures_title" varchar NOT NULL,
  	"version_offer_miniatures_text" varchar,
  	"version_offer_miniatures_product" varchar,
  	"version_offer_miniatures_photo_id" integer,
  	"version_offer_drinks_title" varchar NOT NULL,
  	"version_offer_drinks_text" varchar,
  	"version_offer_drinks_photo_id" integer,
  	"version_offer_venue_title" varchar NOT NULL,
  	"version_offer_venue_text" varchar,
  	"version_offer_venue_link_label" varchar NOT NULL,
  	"version_offer_venue_link_url" varchar NOT NULL,
  	"version_quote_title" varchar NOT NULL,
  	"version_quote_text" varchar,
  	"version_seo_title" varchar NOT NULL,
  	"version_seo_description" varchar NOT NULL,
  	"version_search_summary" varchar NOT NULL,
  	"version_search_keywords" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "help_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"anchor" varchar
  );
  
  CREATE TABLE "help" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_text" varchar,
  	"contact_title" varchar NOT NULL,
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"search_summary" varchar NOT NULL,
  	"search_keywords" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_help_v_version_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"anchor" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_help_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_text" varchar,
  	"version_contact_title" varchar NOT NULL,
  	"version_seo_title" varchar NOT NULL,
  	"version_seo_description" varchar NOT NULL,
  	"version_search_summary" varchar NOT NULL,
  	"version_search_keywords" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_search_v_version_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_search_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "order_confirmation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"pickup_day_title" varchar NOT NULL,
  	"pickup_day_text" varchar,
  	"pickup_day_link_label" varchar NOT NULL,
  	"pickup_day_link_url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_order_confirmation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_photo_id" integer,
  	"version_pickup_day_title" varchar NOT NULL,
  	"version_pickup_day_text" varchar,
  	"version_pickup_day_link_label" varchar NOT NULL,
  	"version_pickup_day_link_url" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_main" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"short_label" varchar
  );
  
  CREATE TABLE "header_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"short_label" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"announcement" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_header_v_version_main" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"short_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v_version_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"short_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_announcement" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"short_label" varchar
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"families" boolean
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"newsletter_title" varchar NOT NULL,
  	"newsletter_text" varchar,
  	"newsletter_note" varchar,
  	"health_warning" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_footer_v_version_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"short_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"families" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_newsletter_title" varchar NOT NULL,
  	"version_newsletter_text" varchar,
  	"version_newsletter_note" varchar,
  	"version_health_warning" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "common" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"visit_title" varchar NOT NULL,
  	"visit_photo_id" integer,
  	"age_gate_title" varchar NOT NULL,
  	"age_gate_text" varchar NOT NULL,
  	"age_gate_health_warning" varchar NOT NULL,
  	"age_gate_photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_common_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_visit_title" varchar NOT NULL,
  	"version_visit_photo_id" integer,
  	"version_age_gate_title" varchar NOT NULL,
  	"version_age_gate_text" varchar NOT NULL,
  	"version_age_gate_health_warning" varchar NOT NULL,
  	"version_age_gate_photo_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_hours_monday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings_hours_tuesday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings_hours_wednesday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings_hours_thursday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings_hours_friday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings_hours_saturday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings_hours_sunday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_phone" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"contact_address_place" varchar,
  	"contact_address_street" varchar NOT NULL,
  	"contact_address_postal_code" varchar NOT NULL,
  	"contact_address_city" varchar NOT NULL,
  	"contact_address_region" varchar,
  	"contact_address_country_code" varchar DEFAULT 'fr' NOT NULL,
  	"legal_legal_name" varchar NOT NULL,
  	"legal_legal_form" varchar NOT NULL,
  	"legal_siren" varchar NOT NULL,
  	"legal_siret" varchar NOT NULL,
  	"legal_address" varchar NOT NULL,
  	"legal_registration" varchar,
  	"legal_vat_number" varchar,
  	"legal_share_capital" varchar,
  	"legal_publication_director" varchar,
  	"host_name" varchar,
  	"host_phone" varchar,
  	"host_address" varchar,
  	"mediator_name" varchar,
  	"mediator_website" varchar,
  	"mediator_address" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_settings_v_version_hours_monday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_hours_tuesday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_hours_wednesday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_hours_thursday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_hours_friday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_hours_saturday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v_version_hours_sunday" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_contact_phone" varchar NOT NULL,
  	"version_contact_email" varchar NOT NULL,
  	"version_contact_address_place" varchar,
  	"version_contact_address_street" varchar NOT NULL,
  	"version_contact_address_postal_code" varchar NOT NULL,
  	"version_contact_address_city" varchar NOT NULL,
  	"version_contact_address_region" varchar,
  	"version_contact_address_country_code" varchar DEFAULT 'fr' NOT NULL,
  	"version_legal_legal_name" varchar NOT NULL,
  	"version_legal_legal_form" varchar NOT NULL,
  	"version_legal_siren" varchar NOT NULL,
  	"version_legal_siret" varchar NOT NULL,
  	"version_legal_address" varchar NOT NULL,
  	"version_legal_registration" varchar,
  	"version_legal_vat_number" varchar,
  	"version_legal_share_capital" varchar,
  	"version_legal_publication_director" varchar,
  	"version_host_name" varchar,
  	"version_host_phone" varchar,
  	"version_host_address" varchar,
  	"version_mediator_name" varchar,
  	"version_mediator_website" varchar,
  	"version_mediator_address" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_parent_id_awards_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."awards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents_articles" ADD CONSTRAINT "legal_documents_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_documents_appendices" ADD CONSTRAINT "legal_documents_appendices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_documents_v_version_articles" ADD CONSTRAINT "_legal_documents_v_version_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_documents_v_version_appendices" ADD CONSTRAINT "_legal_documents_v_version_appendices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_parent_id_legal_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "families" ADD CONSTRAINT "families_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_families_v" ADD CONSTRAINT "_families_v_parent_id_families_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."families"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_families_v" ADD CONSTRAINT "_families_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_stories_steps" ADD CONSTRAINT "product_stories_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_stories_v_version_steps" ADD CONSTRAINT "_product_stories_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_stories_v" ADD CONSTRAINT "_product_stories_v_parent_id_product_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_sessions" ADD CONSTRAINT "_users_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_families_fk" FOREIGN KEY ("families_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_stories_fk" FOREIGN KEY ("product_stories_id") REFERENCES "public"."product_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_estate_paragraphs" ADD CONSTRAINT "home_estate_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_miniatures_facts" ADD CONSTRAINT "home_miniatures_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_photo_start_id_media_id_fk" FOREIGN KEY ("hero_photo_start_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_photo_end_id_media_id_fk" FOREIGN KEY ("hero_photo_end_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_estate_photo_id_media_id_fk" FOREIGN KEY ("estate_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_texts" ADD CONSTRAINT "home_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_estate_paragraphs" ADD CONSTRAINT "_home_v_version_estate_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_miniatures_facts" ADD CONSTRAINT "_home_v_version_miniatures_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_photo_start_id_media_id_fk" FOREIGN KEY ("version_hero_photo_start_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_photo_id_media_id_fk" FOREIGN KEY ("version_hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_photo_end_id_media_id_fk" FOREIGN KEY ("version_hero_photo_end_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_estate_photo_id_media_id_fk" FOREIGN KEY ("version_estate_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_texts" ADD CONSTRAINT "_home_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_page_details_items" ADD CONSTRAINT "product_page_details_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_page" ADD CONSTRAINT "product_page_tasting_photo_id_media_id_fk" FOREIGN KEY ("tasting_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_product_page_v_version_details_items" ADD CONSTRAINT "_product_page_v_version_details_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_product_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_product_page_v" ADD CONSTRAINT "_product_page_v_version_tasting_photo_id_media_id_fk" FOREIGN KEY ("version_tasting_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "estate_family_paragraphs" ADD CONSTRAINT "estate_family_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."estate"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "estate_made_here_workshops" ADD CONSTRAINT "estate_made_here_workshops_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "estate_made_here_workshops" ADD CONSTRAINT "estate_made_here_workshops_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."estate"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "estate_activities_items" ADD CONSTRAINT "estate_activities_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."estate"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "estate" ADD CONSTRAINT "estate_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "estate" ADD CONSTRAINT "estate_family_photo_id_media_id_fk" FOREIGN KEY ("family_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_estate_v_version_family_paragraphs" ADD CONSTRAINT "_estate_v_version_family_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_estate_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_estate_v_version_made_here_workshops" ADD CONSTRAINT "_estate_v_version_made_here_workshops_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_estate_v_version_made_here_workshops" ADD CONSTRAINT "_estate_v_version_made_here_workshops_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_estate_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_estate_v_version_activities_items" ADD CONSTRAINT "_estate_v_version_activities_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_estate_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_estate_v" ADD CONSTRAINT "_estate_v_version_hero_photo_id_media_id_fk" FOREIGN KEY ("version_hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_estate_v" ADD CONSTRAINT "_estate_v_version_family_photo_id_media_id_fk" FOREIGN KEY ("version_family_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orchard_apples_varieties" ADD CONSTRAINT "orchard_apples_varieties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orchard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orchard_pears_paragraphs" ADD CONSTRAINT "orchard_pears_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orchard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orchard_harvest_steps" ADD CONSTRAINT "orchard_harvest_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orchard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orchard_animals_paragraphs" ADD CONSTRAINT "orchard_animals_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orchard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orchard" ADD CONSTRAINT "orchard_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orchard" ADD CONSTRAINT "orchard_pears_photo_id_media_id_fk" FOREIGN KEY ("pears_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orchard" ADD CONSTRAINT "orchard_animals_photo_id_media_id_fk" FOREIGN KEY ("animals_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orchard_v_version_apples_varieties" ADD CONSTRAINT "_orchard_v_version_apples_varieties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orchard_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orchard_v_version_pears_paragraphs" ADD CONSTRAINT "_orchard_v_version_pears_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orchard_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orchard_v_version_harvest_steps" ADD CONSTRAINT "_orchard_v_version_harvest_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orchard_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orchard_v_version_animals_paragraphs" ADD CONSTRAINT "_orchard_v_version_animals_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orchard_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orchard_v" ADD CONSTRAINT "_orchard_v_version_hero_photo_id_media_id_fk" FOREIGN KEY ("version_hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orchard_v" ADD CONSTRAINT "_orchard_v_version_pears_photo_id_media_id_fk" FOREIGN KEY ("version_pears_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orchard_v" ADD CONSTRAINT "_orchard_v_version_animals_photo_id_media_id_fk" FOREIGN KEY ("version_animals_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "weddings" ADD CONSTRAINT "weddings_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "weddings" ADD CONSTRAINT "weddings_offer_miniatures_photo_id_media_id_fk" FOREIGN KEY ("offer_miniatures_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "weddings" ADD CONSTRAINT "weddings_offer_drinks_photo_id_media_id_fk" FOREIGN KEY ("offer_drinks_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_weddings_v" ADD CONSTRAINT "_weddings_v_version_hero_photo_id_media_id_fk" FOREIGN KEY ("version_hero_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_weddings_v" ADD CONSTRAINT "_weddings_v_version_offer_miniatures_photo_id_media_id_fk" FOREIGN KEY ("version_offer_miniatures_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_weddings_v" ADD CONSTRAINT "_weddings_v_version_offer_drinks_photo_id_media_id_fk" FOREIGN KEY ("version_offer_drinks_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "help_questions" ADD CONSTRAINT "help_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."help"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_help_v_version_questions" ADD CONSTRAINT "_help_v_version_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_help_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_suggestions" ADD CONSTRAINT "search_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_v_version_suggestions" ADD CONSTRAINT "_search_v_version_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "order_confirmation" ADD CONSTRAINT "order_confirmation_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_order_confirmation_v" ADD CONSTRAINT "_order_confirmation_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_main" ADD CONSTRAINT "header_main_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menu" ADD CONSTRAINT "header_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_main" ADD CONSTRAINT "_header_v_version_main_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_menu" ADD CONSTRAINT "_header_v_version_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "common" ADD CONSTRAINT "common_visit_photo_id_media_id_fk" FOREIGN KEY ("visit_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "common" ADD CONSTRAINT "common_age_gate_photo_id_media_id_fk" FOREIGN KEY ("age_gate_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_common_v" ADD CONSTRAINT "_common_v_version_visit_photo_id_media_id_fk" FOREIGN KEY ("version_visit_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_common_v" ADD CONSTRAINT "_common_v_version_age_gate_photo_id_media_id_fk" FOREIGN KEY ("version_age_gate_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_hours_monday" ADD CONSTRAINT "settings_hours_monday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_hours_tuesday" ADD CONSTRAINT "settings_hours_tuesday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_hours_wednesday" ADD CONSTRAINT "settings_hours_wednesday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_hours_thursday" ADD CONSTRAINT "settings_hours_thursday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_hours_friday" ADD CONSTRAINT "settings_hours_friday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_hours_saturday" ADD CONSTRAINT "settings_hours_saturday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_hours_sunday" ADD CONSTRAINT "settings_hours_sunday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_monday" ADD CONSTRAINT "_settings_v_version_hours_monday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_tuesday" ADD CONSTRAINT "_settings_v_version_hours_tuesday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_wednesday" ADD CONSTRAINT "_settings_v_version_hours_wednesday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_thursday" ADD CONSTRAINT "_settings_v_version_hours_thursday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_friday" ADD CONSTRAINT "_settings_v_version_hours_friday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_saturday" ADD CONSTRAINT "_settings_v_version_hours_saturday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_settings_v_version_hours_sunday" ADD CONSTRAINT "_settings_v_version_hours_sunday_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_w480_sizes_w480_filename_idx" ON "media" USING btree ("sizes_w480_filename");
  CREATE INDEX "media_sizes_w960_sizes_w960_filename_idx" ON "media" USING btree ("sizes_w960_filename");
  CREATE INDEX "media_sizes_w1440_sizes_w1440_filename_idx" ON "media" USING btree ("sizes_w1440_filename");
  CREATE INDEX "media_sizes_w2048_sizes_w2048_filename_idx" ON "media" USING btree ("sizes_w2048_filename");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_sizes_w480_version_sizes_w480_filename_idx" ON "_media_v" USING btree ("version_sizes_w480_filename");
  CREATE INDEX "_media_v_version_sizes_w960_version_sizes_w960_filename_idx" ON "_media_v" USING btree ("version_sizes_w960_filename");
  CREATE INDEX "_media_v_version_sizes_w1440_version_sizes_w1440_filenam_idx" ON "_media_v" USING btree ("version_sizes_w1440_filename");
  CREATE INDEX "_media_v_version_sizes_w2048_version_sizes_w2048_filenam_idx" ON "_media_v" USING btree ("version_sizes_w2048_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "awards_updated_at_idx" ON "awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "awards" USING btree ("created_at");
  CREATE INDEX "_awards_v_parent_idx" ON "_awards_v" USING btree ("parent_id");
  CREATE INDEX "_awards_v_version_version_updated_at_idx" ON "_awards_v" USING btree ("version_updated_at");
  CREATE INDEX "_awards_v_version_version_created_at_idx" ON "_awards_v" USING btree ("version_created_at");
  CREATE INDEX "_awards_v_created_at_idx" ON "_awards_v" USING btree ("created_at");
  CREATE INDEX "_awards_v_updated_at_idx" ON "_awards_v" USING btree ("updated_at");
  CREATE INDEX "legal_documents_articles_order_idx" ON "legal_documents_articles" USING btree ("_order");
  CREATE INDEX "legal_documents_articles_parent_id_idx" ON "legal_documents_articles" USING btree ("_parent_id");
  CREATE INDEX "legal_documents_appendices_order_idx" ON "legal_documents_appendices" USING btree ("_order");
  CREATE INDEX "legal_documents_appendices_parent_id_idx" ON "legal_documents_appendices" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "legal_documents_document_idx" ON "legal_documents" USING btree ("document");
  CREATE INDEX "legal_documents_updated_at_idx" ON "legal_documents" USING btree ("updated_at");
  CREATE INDEX "legal_documents_created_at_idx" ON "legal_documents" USING btree ("created_at");
  CREATE INDEX "_legal_documents_v_version_articles_order_idx" ON "_legal_documents_v_version_articles" USING btree ("_order");
  CREATE INDEX "_legal_documents_v_version_articles_parent_id_idx" ON "_legal_documents_v_version_articles" USING btree ("_parent_id");
  CREATE INDEX "_legal_documents_v_version_appendices_order_idx" ON "_legal_documents_v_version_appendices" USING btree ("_order");
  CREATE INDEX "_legal_documents_v_version_appendices_parent_id_idx" ON "_legal_documents_v_version_appendices" USING btree ("_parent_id");
  CREATE INDEX "_legal_documents_v_parent_idx" ON "_legal_documents_v" USING btree ("parent_id");
  CREATE INDEX "_legal_documents_v_version_version_document_idx" ON "_legal_documents_v" USING btree ("version_document");
  CREATE INDEX "_legal_documents_v_version_version_updated_at_idx" ON "_legal_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_documents_v_version_version_created_at_idx" ON "_legal_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_documents_v_created_at_idx" ON "_legal_documents_v" USING btree ("created_at");
  CREATE INDEX "_legal_documents_v_updated_at_idx" ON "_legal_documents_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "families_category_idx" ON "families" USING btree ("category");
  CREATE INDEX "families_photo_idx" ON "families" USING btree ("photo_id");
  CREATE INDEX "families_updated_at_idx" ON "families" USING btree ("updated_at");
  CREATE INDEX "families_created_at_idx" ON "families" USING btree ("created_at");
  CREATE INDEX "_families_v_parent_idx" ON "_families_v" USING btree ("parent_id");
  CREATE INDEX "_families_v_version_version_category_idx" ON "_families_v" USING btree ("version_category");
  CREATE INDEX "_families_v_version_version_photo_idx" ON "_families_v" USING btree ("version_photo_id");
  CREATE INDEX "_families_v_version_version_updated_at_idx" ON "_families_v" USING btree ("version_updated_at");
  CREATE INDEX "_families_v_version_version_created_at_idx" ON "_families_v" USING btree ("version_created_at");
  CREATE INDEX "_families_v_created_at_idx" ON "_families_v" USING btree ("created_at");
  CREATE INDEX "_families_v_updated_at_idx" ON "_families_v" USING btree ("updated_at");
  CREATE INDEX "product_stories_steps_order_idx" ON "product_stories_steps" USING btree ("_order");
  CREATE INDEX "product_stories_steps_parent_id_idx" ON "product_stories_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "product_stories_product_idx" ON "product_stories" USING btree ("product");
  CREATE INDEX "product_stories_updated_at_idx" ON "product_stories" USING btree ("updated_at");
  CREATE INDEX "product_stories_created_at_idx" ON "product_stories" USING btree ("created_at");
  CREATE INDEX "_product_stories_v_version_steps_order_idx" ON "_product_stories_v_version_steps" USING btree ("_order");
  CREATE INDEX "_product_stories_v_version_steps_parent_id_idx" ON "_product_stories_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_product_stories_v_parent_idx" ON "_product_stories_v" USING btree ("parent_id");
  CREATE INDEX "_product_stories_v_version_version_product_idx" ON "_product_stories_v" USING btree ("version_product");
  CREATE INDEX "_product_stories_v_version_version_updated_at_idx" ON "_product_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_product_stories_v_version_version_created_at_idx" ON "_product_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_product_stories_v_created_at_idx" ON "_product_stories_v" USING btree ("created_at");
  CREATE INDEX "_product_stories_v_updated_at_idx" ON "_product_stories_v" USING btree ("updated_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "_users_v_version_sessions_order_idx" ON "_users_v_version_sessions" USING btree ("_order");
  CREATE INDEX "_users_v_version_sessions_parent_id_idx" ON "_users_v_version_sessions" USING btree ("_parent_id");
  CREATE INDEX "_users_v_parent_idx" ON "_users_v" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_version_updated_at_idx" ON "_users_v" USING btree ("version_updated_at");
  CREATE INDEX "_users_v_version_version_created_at_idx" ON "_users_v" USING btree ("version_created_at");
  CREATE INDEX "_users_v_version_version_email_idx" ON "_users_v" USING btree ("version_email");
  CREATE INDEX "_users_v_created_at_idx" ON "_users_v" USING btree ("created_at");
  CREATE INDEX "_users_v_updated_at_idx" ON "_users_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_legal_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_documents_id");
  CREATE INDEX "payload_locked_documents_rels_families_id_idx" ON "payload_locked_documents_rels" USING btree ("families_id");
  CREATE INDEX "payload_locked_documents_rels_product_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("product_stories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_estate_paragraphs_order_idx" ON "home_estate_paragraphs" USING btree ("_order");
  CREATE INDEX "home_estate_paragraphs_parent_id_idx" ON "home_estate_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "home_miniatures_facts_order_idx" ON "home_miniatures_facts" USING btree ("_order");
  CREATE INDEX "home_miniatures_facts_parent_id_idx" ON "home_miniatures_facts" USING btree ("_parent_id");
  CREATE INDEX "home_hero_hero_photo_start_idx" ON "home" USING btree ("hero_photo_start_id");
  CREATE INDEX "home_hero_hero_photo_idx" ON "home" USING btree ("hero_photo_id");
  CREATE INDEX "home_hero_hero_photo_end_idx" ON "home" USING btree ("hero_photo_end_id");
  CREATE INDEX "home_estate_estate_photo_idx" ON "home" USING btree ("estate_photo_id");
  CREATE INDEX "home_texts_order_parent" ON "home_texts" USING btree ("order","parent_id");
  CREATE INDEX "_home_v_version_estate_paragraphs_order_idx" ON "_home_v_version_estate_paragraphs" USING btree ("_order");
  CREATE INDEX "_home_v_version_estate_paragraphs_parent_id_idx" ON "_home_v_version_estate_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_miniatures_facts_order_idx" ON "_home_v_version_miniatures_facts" USING btree ("_order");
  CREATE INDEX "_home_v_version_miniatures_facts_parent_id_idx" ON "_home_v_version_miniatures_facts" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_hero_version_hero_photo_start_idx" ON "_home_v" USING btree ("version_hero_photo_start_id");
  CREATE INDEX "_home_v_version_hero_version_hero_photo_idx" ON "_home_v" USING btree ("version_hero_photo_id");
  CREATE INDEX "_home_v_version_hero_version_hero_photo_end_idx" ON "_home_v" USING btree ("version_hero_photo_end_id");
  CREATE INDEX "_home_v_version_estate_version_estate_photo_idx" ON "_home_v" USING btree ("version_estate_photo_id");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_texts_order_parent" ON "_home_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_shop_v_created_at_idx" ON "_shop_v" USING btree ("created_at");
  CREATE INDEX "_shop_v_updated_at_idx" ON "_shop_v" USING btree ("updated_at");
  CREATE INDEX "product_page_details_items_order_idx" ON "product_page_details_items" USING btree ("_order");
  CREATE INDEX "product_page_details_items_parent_id_idx" ON "product_page_details_items" USING btree ("_parent_id");
  CREATE INDEX "product_page_tasting_tasting_photo_idx" ON "product_page" USING btree ("tasting_photo_id");
  CREATE INDEX "_product_page_v_version_details_items_order_idx" ON "_product_page_v_version_details_items" USING btree ("_order");
  CREATE INDEX "_product_page_v_version_details_items_parent_id_idx" ON "_product_page_v_version_details_items" USING btree ("_parent_id");
  CREATE INDEX "_product_page_v_version_tasting_version_tasting_photo_idx" ON "_product_page_v" USING btree ("version_tasting_photo_id");
  CREATE INDEX "_product_page_v_created_at_idx" ON "_product_page_v" USING btree ("created_at");
  CREATE INDEX "_product_page_v_updated_at_idx" ON "_product_page_v" USING btree ("updated_at");
  CREATE INDEX "estate_family_paragraphs_order_idx" ON "estate_family_paragraphs" USING btree ("_order");
  CREATE INDEX "estate_family_paragraphs_parent_id_idx" ON "estate_family_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "estate_made_here_workshops_order_idx" ON "estate_made_here_workshops" USING btree ("_order");
  CREATE INDEX "estate_made_here_workshops_parent_id_idx" ON "estate_made_here_workshops" USING btree ("_parent_id");
  CREATE INDEX "estate_made_here_workshops_photo_idx" ON "estate_made_here_workshops" USING btree ("photo_id");
  CREATE INDEX "estate_activities_items_order_idx" ON "estate_activities_items" USING btree ("_order");
  CREATE INDEX "estate_activities_items_parent_id_idx" ON "estate_activities_items" USING btree ("_parent_id");
  CREATE INDEX "estate_hero_hero_photo_idx" ON "estate" USING btree ("hero_photo_id");
  CREATE INDEX "estate_family_family_photo_idx" ON "estate" USING btree ("family_photo_id");
  CREATE INDEX "_estate_v_version_family_paragraphs_order_idx" ON "_estate_v_version_family_paragraphs" USING btree ("_order");
  CREATE INDEX "_estate_v_version_family_paragraphs_parent_id_idx" ON "_estate_v_version_family_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_estate_v_version_made_here_workshops_order_idx" ON "_estate_v_version_made_here_workshops" USING btree ("_order");
  CREATE INDEX "_estate_v_version_made_here_workshops_parent_id_idx" ON "_estate_v_version_made_here_workshops" USING btree ("_parent_id");
  CREATE INDEX "_estate_v_version_made_here_workshops_photo_idx" ON "_estate_v_version_made_here_workshops" USING btree ("photo_id");
  CREATE INDEX "_estate_v_version_activities_items_order_idx" ON "_estate_v_version_activities_items" USING btree ("_order");
  CREATE INDEX "_estate_v_version_activities_items_parent_id_idx" ON "_estate_v_version_activities_items" USING btree ("_parent_id");
  CREATE INDEX "_estate_v_version_hero_version_hero_photo_idx" ON "_estate_v" USING btree ("version_hero_photo_id");
  CREATE INDEX "_estate_v_version_family_version_family_photo_idx" ON "_estate_v" USING btree ("version_family_photo_id");
  CREATE INDEX "_estate_v_created_at_idx" ON "_estate_v" USING btree ("created_at");
  CREATE INDEX "_estate_v_updated_at_idx" ON "_estate_v" USING btree ("updated_at");
  CREATE INDEX "orchard_apples_varieties_order_idx" ON "orchard_apples_varieties" USING btree ("_order");
  CREATE INDEX "orchard_apples_varieties_parent_id_idx" ON "orchard_apples_varieties" USING btree ("_parent_id");
  CREATE INDEX "orchard_pears_paragraphs_order_idx" ON "orchard_pears_paragraphs" USING btree ("_order");
  CREATE INDEX "orchard_pears_paragraphs_parent_id_idx" ON "orchard_pears_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "orchard_harvest_steps_order_idx" ON "orchard_harvest_steps" USING btree ("_order");
  CREATE INDEX "orchard_harvest_steps_parent_id_idx" ON "orchard_harvest_steps" USING btree ("_parent_id");
  CREATE INDEX "orchard_animals_paragraphs_order_idx" ON "orchard_animals_paragraphs" USING btree ("_order");
  CREATE INDEX "orchard_animals_paragraphs_parent_id_idx" ON "orchard_animals_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "orchard_hero_hero_photo_idx" ON "orchard" USING btree ("hero_photo_id");
  CREATE INDEX "orchard_pears_pears_photo_idx" ON "orchard" USING btree ("pears_photo_id");
  CREATE INDEX "orchard_animals_animals_photo_idx" ON "orchard" USING btree ("animals_photo_id");
  CREATE INDEX "_orchard_v_version_apples_varieties_order_idx" ON "_orchard_v_version_apples_varieties" USING btree ("_order");
  CREATE INDEX "_orchard_v_version_apples_varieties_parent_id_idx" ON "_orchard_v_version_apples_varieties" USING btree ("_parent_id");
  CREATE INDEX "_orchard_v_version_pears_paragraphs_order_idx" ON "_orchard_v_version_pears_paragraphs" USING btree ("_order");
  CREATE INDEX "_orchard_v_version_pears_paragraphs_parent_id_idx" ON "_orchard_v_version_pears_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_orchard_v_version_harvest_steps_order_idx" ON "_orchard_v_version_harvest_steps" USING btree ("_order");
  CREATE INDEX "_orchard_v_version_harvest_steps_parent_id_idx" ON "_orchard_v_version_harvest_steps" USING btree ("_parent_id");
  CREATE INDEX "_orchard_v_version_animals_paragraphs_order_idx" ON "_orchard_v_version_animals_paragraphs" USING btree ("_order");
  CREATE INDEX "_orchard_v_version_animals_paragraphs_parent_id_idx" ON "_orchard_v_version_animals_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_orchard_v_version_hero_version_hero_photo_idx" ON "_orchard_v" USING btree ("version_hero_photo_id");
  CREATE INDEX "_orchard_v_version_pears_version_pears_photo_idx" ON "_orchard_v" USING btree ("version_pears_photo_id");
  CREATE INDEX "_orchard_v_version_animals_version_animals_photo_idx" ON "_orchard_v" USING btree ("version_animals_photo_id");
  CREATE INDEX "_orchard_v_created_at_idx" ON "_orchard_v" USING btree ("created_at");
  CREATE INDEX "_orchard_v_updated_at_idx" ON "_orchard_v" USING btree ("updated_at");
  CREATE INDEX "weddings_hero_hero_photo_idx" ON "weddings" USING btree ("hero_photo_id");
  CREATE INDEX "weddings_offer_miniatures_offer_miniatures_photo_idx" ON "weddings" USING btree ("offer_miniatures_photo_id");
  CREATE INDEX "weddings_offer_drinks_offer_drinks_photo_idx" ON "weddings" USING btree ("offer_drinks_photo_id");
  CREATE INDEX "_weddings_v_version_hero_version_hero_photo_idx" ON "_weddings_v" USING btree ("version_hero_photo_id");
  CREATE INDEX "_weddings_v_version_offer_miniatures_version_offer_minia_idx" ON "_weddings_v" USING btree ("version_offer_miniatures_photo_id");
  CREATE INDEX "_weddings_v_version_offer_drinks_version_offer_drinks_ph_idx" ON "_weddings_v" USING btree ("version_offer_drinks_photo_id");
  CREATE INDEX "_weddings_v_created_at_idx" ON "_weddings_v" USING btree ("created_at");
  CREATE INDEX "_weddings_v_updated_at_idx" ON "_weddings_v" USING btree ("updated_at");
  CREATE INDEX "help_questions_order_idx" ON "help_questions" USING btree ("_order");
  CREATE INDEX "help_questions_parent_id_idx" ON "help_questions" USING btree ("_parent_id");
  CREATE INDEX "_help_v_version_questions_order_idx" ON "_help_v_version_questions" USING btree ("_order");
  CREATE INDEX "_help_v_version_questions_parent_id_idx" ON "_help_v_version_questions" USING btree ("_parent_id");
  CREATE INDEX "_help_v_created_at_idx" ON "_help_v" USING btree ("created_at");
  CREATE INDEX "_help_v_updated_at_idx" ON "_help_v" USING btree ("updated_at");
  CREATE INDEX "search_suggestions_order_idx" ON "search_suggestions" USING btree ("_order");
  CREATE INDEX "search_suggestions_parent_id_idx" ON "search_suggestions" USING btree ("_parent_id");
  CREATE INDEX "_search_v_version_suggestions_order_idx" ON "_search_v_version_suggestions" USING btree ("_order");
  CREATE INDEX "_search_v_version_suggestions_parent_id_idx" ON "_search_v_version_suggestions" USING btree ("_parent_id");
  CREATE INDEX "_search_v_created_at_idx" ON "_search_v" USING btree ("created_at");
  CREATE INDEX "_search_v_updated_at_idx" ON "_search_v" USING btree ("updated_at");
  CREATE INDEX "order_confirmation_photo_idx" ON "order_confirmation" USING btree ("photo_id");
  CREATE INDEX "_order_confirmation_v_version_version_photo_idx" ON "_order_confirmation_v" USING btree ("version_photo_id");
  CREATE INDEX "_order_confirmation_v_created_at_idx" ON "_order_confirmation_v" USING btree ("created_at");
  CREATE INDEX "_order_confirmation_v_updated_at_idx" ON "_order_confirmation_v" USING btree ("updated_at");
  CREATE INDEX "header_main_order_idx" ON "header_main" USING btree ("_order");
  CREATE INDEX "header_main_parent_id_idx" ON "header_main" USING btree ("_parent_id");
  CREATE INDEX "header_menu_order_idx" ON "header_menu" USING btree ("_order");
  CREATE INDEX "header_menu_parent_id_idx" ON "header_menu" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_main_order_idx" ON "_header_v_version_main" USING btree ("_order");
  CREATE INDEX "_header_v_version_main_parent_id_idx" ON "_header_v_version_main" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_menu_order_idx" ON "_header_v_version_menu" USING btree ("_order");
  CREATE INDEX "_header_v_version_menu_parent_id_idx" ON "_header_v_version_menu" USING btree ("_parent_id");
  CREATE INDEX "_header_v_created_at_idx" ON "_header_v" USING btree ("created_at");
  CREATE INDEX "_header_v_updated_at_idx" ON "_header_v" USING btree ("updated_at");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "common_visit_visit_photo_idx" ON "common" USING btree ("visit_photo_id");
  CREATE INDEX "common_age_gate_age_gate_photo_idx" ON "common" USING btree ("age_gate_photo_id");
  CREATE INDEX "_common_v_version_visit_version_visit_photo_idx" ON "_common_v" USING btree ("version_visit_photo_id");
  CREATE INDEX "_common_v_version_age_gate_version_age_gate_photo_idx" ON "_common_v" USING btree ("version_age_gate_photo_id");
  CREATE INDEX "_common_v_created_at_idx" ON "_common_v" USING btree ("created_at");
  CREATE INDEX "_common_v_updated_at_idx" ON "_common_v" USING btree ("updated_at");
  CREATE INDEX "settings_hours_monday_order_idx" ON "settings_hours_monday" USING btree ("_order");
  CREATE INDEX "settings_hours_monday_parent_id_idx" ON "settings_hours_monday" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_tuesday_order_idx" ON "settings_hours_tuesday" USING btree ("_order");
  CREATE INDEX "settings_hours_tuesday_parent_id_idx" ON "settings_hours_tuesday" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_wednesday_order_idx" ON "settings_hours_wednesday" USING btree ("_order");
  CREATE INDEX "settings_hours_wednesday_parent_id_idx" ON "settings_hours_wednesday" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_thursday_order_idx" ON "settings_hours_thursday" USING btree ("_order");
  CREATE INDEX "settings_hours_thursday_parent_id_idx" ON "settings_hours_thursday" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_friday_order_idx" ON "settings_hours_friday" USING btree ("_order");
  CREATE INDEX "settings_hours_friday_parent_id_idx" ON "settings_hours_friday" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_saturday_order_idx" ON "settings_hours_saturday" USING btree ("_order");
  CREATE INDEX "settings_hours_saturday_parent_id_idx" ON "settings_hours_saturday" USING btree ("_parent_id");
  CREATE INDEX "settings_hours_sunday_order_idx" ON "settings_hours_sunday" USING btree ("_order");
  CREATE INDEX "settings_hours_sunday_parent_id_idx" ON "settings_hours_sunday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_monday_order_idx" ON "_settings_v_version_hours_monday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_monday_parent_id_idx" ON "_settings_v_version_hours_monday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_tuesday_order_idx" ON "_settings_v_version_hours_tuesday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_tuesday_parent_id_idx" ON "_settings_v_version_hours_tuesday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_wednesday_order_idx" ON "_settings_v_version_hours_wednesday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_wednesday_parent_id_idx" ON "_settings_v_version_hours_wednesday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_thursday_order_idx" ON "_settings_v_version_hours_thursday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_thursday_parent_id_idx" ON "_settings_v_version_hours_thursday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_friday_order_idx" ON "_settings_v_version_hours_friday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_friday_parent_id_idx" ON "_settings_v_version_hours_friday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_saturday_order_idx" ON "_settings_v_version_hours_saturday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_saturday_parent_id_idx" ON "_settings_v_version_hours_saturday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_version_hours_sunday_order_idx" ON "_settings_v_version_hours_sunday" USING btree ("_order");
  CREATE INDEX "_settings_v_version_hours_sunday_parent_id_idx" ON "_settings_v_version_hours_sunday" USING btree ("_parent_id");
  CREATE INDEX "_settings_v_created_at_idx" ON "_settings_v" USING btree ("created_at");
  CREATE INDEX "_settings_v_updated_at_idx" ON "_settings_v" USING btree ("updated_at");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "media" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "awards" CASCADE;
  DROP TABLE "_awards_v" CASCADE;
  DROP TABLE "legal_documents_articles" CASCADE;
  DROP TABLE "legal_documents_appendices" CASCADE;
  DROP TABLE "legal_documents" CASCADE;
  DROP TABLE "_legal_documents_v_version_articles" CASCADE;
  DROP TABLE "_legal_documents_v_version_appendices" CASCADE;
  DROP TABLE "_legal_documents_v" CASCADE;
  DROP TABLE "families" CASCADE;
  DROP TABLE "_families_v" CASCADE;
  DROP TABLE "product_stories_steps" CASCADE;
  DROP TABLE "product_stories" CASCADE;
  DROP TABLE "_product_stories_v_version_steps" CASCADE;
  DROP TABLE "_product_stories_v" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "_users_v_version_sessions" CASCADE;
  DROP TABLE "_users_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_estate_paragraphs" CASCADE;
  DROP TABLE "home_miniatures_facts" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_texts" CASCADE;
  DROP TABLE "_home_v_version_estate_paragraphs" CASCADE;
  DROP TABLE "_home_v_version_miniatures_facts" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_texts" CASCADE;
  DROP TABLE "shop" CASCADE;
  DROP TABLE "_shop_v" CASCADE;
  DROP TABLE "product_page_details_items" CASCADE;
  DROP TABLE "product_page" CASCADE;
  DROP TABLE "_product_page_v_version_details_items" CASCADE;
  DROP TABLE "_product_page_v" CASCADE;
  DROP TABLE "estate_family_paragraphs" CASCADE;
  DROP TABLE "estate_made_here_workshops" CASCADE;
  DROP TABLE "estate_activities_items" CASCADE;
  DROP TABLE "estate" CASCADE;
  DROP TABLE "_estate_v_version_family_paragraphs" CASCADE;
  DROP TABLE "_estate_v_version_made_here_workshops" CASCADE;
  DROP TABLE "_estate_v_version_activities_items" CASCADE;
  DROP TABLE "_estate_v" CASCADE;
  DROP TABLE "orchard_apples_varieties" CASCADE;
  DROP TABLE "orchard_pears_paragraphs" CASCADE;
  DROP TABLE "orchard_harvest_steps" CASCADE;
  DROP TABLE "orchard_animals_paragraphs" CASCADE;
  DROP TABLE "orchard" CASCADE;
  DROP TABLE "_orchard_v_version_apples_varieties" CASCADE;
  DROP TABLE "_orchard_v_version_pears_paragraphs" CASCADE;
  DROP TABLE "_orchard_v_version_harvest_steps" CASCADE;
  DROP TABLE "_orchard_v_version_animals_paragraphs" CASCADE;
  DROP TABLE "_orchard_v" CASCADE;
  DROP TABLE "weddings" CASCADE;
  DROP TABLE "_weddings_v" CASCADE;
  DROP TABLE "help_questions" CASCADE;
  DROP TABLE "help" CASCADE;
  DROP TABLE "_help_v_version_questions" CASCADE;
  DROP TABLE "_help_v" CASCADE;
  DROP TABLE "search_suggestions" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "_search_v_version_suggestions" CASCADE;
  DROP TABLE "_search_v" CASCADE;
  DROP TABLE "order_confirmation" CASCADE;
  DROP TABLE "_order_confirmation_v" CASCADE;
  DROP TABLE "header_main" CASCADE;
  DROP TABLE "header_menu" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "_header_v_version_main" CASCADE;
  DROP TABLE "_header_v_version_menu" CASCADE;
  DROP TABLE "_header_v" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "common" CASCADE;
  DROP TABLE "_common_v" CASCADE;
  DROP TABLE "settings_hours_monday" CASCADE;
  DROP TABLE "settings_hours_tuesday" CASCADE;
  DROP TABLE "settings_hours_wednesday" CASCADE;
  DROP TABLE "settings_hours_thursday" CASCADE;
  DROP TABLE "settings_hours_friday" CASCADE;
  DROP TABLE "settings_hours_saturday" CASCADE;
  DROP TABLE "settings_hours_sunday" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "_settings_v_version_hours_monday" CASCADE;
  DROP TABLE "_settings_v_version_hours_tuesday" CASCADE;
  DROP TABLE "_settings_v_version_hours_wednesday" CASCADE;
  DROP TABLE "_settings_v_version_hours_thursday" CASCADE;
  DROP TABLE "_settings_v_version_hours_friday" CASCADE;
  DROP TABLE "_settings_v_version_hours_saturday" CASCADE;
  DROP TABLE "_settings_v_version_hours_sunday" CASCADE;
  DROP TABLE "_settings_v" CASCADE;
  DROP TYPE "public"."enum_legal_documents_document";
  DROP TYPE "public"."enum__legal_documents_v_version_document";`);
}
