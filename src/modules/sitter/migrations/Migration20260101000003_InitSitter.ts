import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000003_InitSitter extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "sitter" (
        "id" text not null,
        "user_id" text null,
        "email" text not null,
        "first_name" text null,
        "last_name" text null,
        "phone" text null,
        "bio" text null,
        "profile_type" text check ("profile_type" in ('student', 'teenager', 'traveler')) not null,
        "service_types" text[] not null default '{}',
        "city" text not null,
        "neighborhood" text null,
        "arrondissement" text null,
        "is_available" boolean not null default true,
        "is_expert" boolean not null default false,
        "rating" real not null default 0,
        "review_count" integer not null default 0,
        "price_per_night" integer not null default 20,
        "response_time" text null,
        "years_experience" integer not null default 0,
        "completed_bookings" integer not null default 0,
        "tags" text[] not null default '{}',
        "color_tint" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "sitter_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "sitter";`)
  }
}
