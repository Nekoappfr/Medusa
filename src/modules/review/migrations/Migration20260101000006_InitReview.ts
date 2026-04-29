import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260101000006_InitReview extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "review" (
        "id" text not null,
        "booking_id" text not null,
        "reviewer_id" text not null,
        "reviewed_id" text not null,
        "rating" integer not null,
        "comment" text null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "review_pkey" primary key ("id")
      );`
    )
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "review";`)
  }
}
