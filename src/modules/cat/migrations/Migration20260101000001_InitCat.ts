import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000001_InitCat extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "cat" (
        "id" text not null,
        "name" text not null,
        "breed" text not null,
        "age" integer not null,
        "is_medicated" boolean not null default false,
        "is_anxious" boolean not null default false,
        "is_kitten" boolean not null default false,
        "notes" text null,
        "owner_id" text not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "cat_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "cat";`)
  }
}
