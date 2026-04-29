import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000000_InitOwner extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "owner" (
        "id" text not null,
        "user_id" text null,
        "email" text not null,
        "first_name" text null,
        "last_name" text null,
        "phone" text null,
        "arrondissement" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "owner_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "owner";`)
  }
}
