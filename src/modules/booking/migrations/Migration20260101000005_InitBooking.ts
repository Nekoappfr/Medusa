import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000005_InitBooking extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "booking" (
        "id" text not null,
        "ad_id" text not null,
        "sitter_id" text not null,
        "owner_id" text not null,
        "status" text check ("status" in ('confirmed', 'in_progress', 'completed', 'cancelled')) not null default 'confirmed',
        "total_price" integer not null,
        "platform_fee" integer not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "booking_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "booking";`)
  }
}
