import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000004_InitApplication extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "application" (
        "id" text not null,
        "ad_id" text not null,
        "sitter_id" text not null,
        "message" text null,
        "status" text check ("status" in ('pending', 'accepted', 'rejected')) not null default 'pending',
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "application_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "application";`)
  }
}
