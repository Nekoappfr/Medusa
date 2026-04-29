import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000002_InitAd extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "ad" (
        "id" text not null,
        "owner_id" text not null,
        "cat_id" text not null,
        "service_type" text check ("service_type" in ('boarding', 'visit', 'housesitting')) not null,
        "start_date" timestamptz not null,
        "end_date" timestamptz not null,
        "price_per_night" integer not null,
        "status" text check ("status" in ('open', 'matched', 'confirmed', 'completed', 'cancelled')) not null default 'open',
        "neighborhood" text null,
        "notes" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "ad_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "ad";`)
  }
}
