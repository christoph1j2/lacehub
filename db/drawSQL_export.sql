CREATE TABLE "wtb"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "size" VARCHAR(255) NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT '1'
);
ALTER TABLE
    "wtb" ADD PRIMARY KEY("id");
CREATE TABLE "notifications"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "match_id" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "notifications" ADD PRIMARY KEY("id");
CREATE TABLE "reviews"(
    "id" BIGINT NOT NULL,
    "reviewer_id" BIGINT NOT NULL,
    "seller_id" BIGINT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "review_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "reviews" ADD PRIMARY KEY("id");
CREATE TABLE "wts"(
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "size" VARCHAR(255) NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT '1'
);
ALTER TABLE
    "wts" ADD PRIMARY KEY("id");
CREATE TABLE "matches"(
    "id" BIGINT NOT NULL,
    "wtb_id" BIGINT NOT NULL,
    "wts_id" BIGINT NOT NULL,
    "buyer_id" BIGINT NOT NULL,
    "seller_id" BIGINT NOT NULL,
    "match_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255) NOT NULL DEFAULT '' pending ''
);
ALTER TABLE
    "matches" ADD PRIMARY KEY("id");
CREATE TABLE "users"(
    "id" BIGINT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "users" ADD PRIMARY KEY("id");
ALTER TABLE
    "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
ALTER TABLE
    "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
CREATE TABLE "products"(
    "id" BIGINT NOT NULL,
    "sku" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "products" ADD PRIMARY KEY("id");
ALTER TABLE
    "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");
ALTER TABLE
    "matches" ADD CONSTRAINT "matches_wtb_id_foreign" FOREIGN KEY("wtb_id") REFERENCES "wtb"("id");
ALTER TABLE
    "wtb" ADD CONSTRAINT "wtb_product_id_foreign" FOREIGN KEY("product_id") REFERENCES "products"("id");
ALTER TABLE
    "notifications" ADD CONSTRAINT "notifications_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "matches" ADD CONSTRAINT "matches_wts_id_foreign" FOREIGN KEY("wts_id") REFERENCES "wts"("id");
ALTER TABLE
    "wts" ADD CONSTRAINT "wts_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "matches" ADD CONSTRAINT "matches_seller_id_foreign" FOREIGN KEY("seller_id") REFERENCES "users"("id");
ALTER TABLE
    "wtb" ADD CONSTRAINT "wtb_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "reviews" ADD CONSTRAINT "reviews_reviewer_id_foreign" FOREIGN KEY("reviewer_id") REFERENCES "users"("id");
ALTER TABLE
    "matches" ADD CONSTRAINT "matches_buyer_id_foreign" FOREIGN KEY("buyer_id") REFERENCES "users"("id");
ALTER TABLE
    "notifications" ADD CONSTRAINT "notifications_match_id_foreign" FOREIGN KEY("match_id") REFERENCES "matches"("id");
ALTER TABLE
    "wts" ADD CONSTRAINT "wts_product_id_foreign" FOREIGN KEY("product_id") REFERENCES "products"("id");
ALTER TABLE
    "reviews" ADD CONSTRAINT "reviews_seller_id_foreign" FOREIGN KEY("seller_id") REFERENCES "users"("id");