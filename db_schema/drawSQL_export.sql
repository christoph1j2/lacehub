-- Exported from drawSQL (https://www.drawsql.app)
----------------------------------------------------------------------------
-- USERS
CREATE TABLE IF NOT EXISTS "users"(
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_id" BIGINT  DEFAULT 2,
    "verified" BOOLEAN DEFAULT FALSE,
    "credibility_score" INT DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "is_banned" BOOLEAN DEFAULT FALSE,
    "ban_expiration" TIMESTAMP WITH TIME ZONE
    "verificationToken" VARCHAR(255)
    "resetToken" VARCHAR(255)
    "resetTokenExpires" TIMESTAMP
);
ALTER TABLE
    "users" ADD PRIMARY KEY("id");
ALTER TABLE
    "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");
ALTER TABLE
    "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
----------------------------------------------------------------------------
-- PRODUCT
CREATE TABLE IF NOT EXISTS "products"(
    "id" BIGSERIAL NOT NULL,
    "sku" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image_link" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "products" ADD PRIMARY KEY("id");
ALTER TABLE
    "products" ADD CONSTRAINT "products_sku_unique" UNIQUE("sku");
----------------------------------------------------------------------------

-- REVIEWS
CREATE TABLE IF NOT EXISTS "reviews"(
    "id" BIGSERIAL NOT NULL,
    "reviewer_id" BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "seller_id" BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "rating" BOOLEAN NOT NULL,
    "review_text" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "reviews" ADD PRIMARY KEY("id");
ALTER TABLE 
    "reviews" ADD CONSTRAINT "reviews_reviewer_seller_unique" UNIQUE("reviewer_id", "seller_id");

----------------------------------------------------------------------------
-- WTB
CREATE TABLE IF NOT EXISTS "wtb"(
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES users(id),
    "product_id" BIGINT NOT NULL REFERENCES products(id),
    "size" VARCHAR(10) NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT 1
);
ALTER TABLE
    "wtb" ADD PRIMARY KEY("id");
----------------------------------------------------------------------------
-- WTS
CREATE TABLE IF NOT EXISTS "wts"(
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES users(id),
    "product_id" BIGINT NOT NULL REFERENCES products(id),
    "size" VARCHAR(10) NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT 1
);
ALTER TABLE
    "wts" ADD PRIMARY KEY("id");
----------------------------------------------------------------------------
-- USER_INVENTORY
CREATE TABLE IF NOT EXISTS "user_inventory"(
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES users(id),
    "product_id" BIGINT NOT NULL REFERENCES products(id),
    "size" VARCHAR(10) NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT 1
);
ALTER TABLE
    "user_inventory" ADD PRIMARY KEY("id");
----------------------------------------------------------------------------
-- MATCHES
CREATE TABLE IF NOT EXISTS "matches"(
    "id" BIGSERIAL NOT NULL,
    "wtb_id" BIGINT NOT NULL REFERENCES wtb(id), --?
    "wts_id" BIGINT NOT NULL REFERENCES wts(id), --?
    "buyer_id" BIGINT NOT NULL REFERENCES users(id),
    "seller_id" BIGINT NOT NULL REFERENCES users(id),
    "match_score" INTEGER NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(255) NOT NULL DEFAULT 'pending'
);
ALTER TABLE
    "matches" ADD PRIMARY KEY("id");

----------------------------------------------------------------------------
-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "notifications"(
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL REFERENCES users(id),
    "match_id" BIGINT NOT NULL REFERENCES matches(id),
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    "type" VARCHAR(255) NOT NULL -- match/warn/...
    "is_read" BOOLEAN DEFAULT FALSE
);
ALTER TABLE
    "notifications" ADD PRIMARY KEY("id");
----------------------------------------------------------------------------
-- ROLES
CREATE TABLE IF NOT EXISTS "user_roles"(
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "user_roles" ADD PRIMARY KEY("id");
ALTER TABLE
    "user_roles" ADD CONSTRAINT "user_roles_role_name_unique" UNIQUE("role_name");

INSERT INTO user_roles (role_name)
VALUES ('admin'), ('user');

----------------------------------------------------------------------------
-- REPORTS
CREATE TABLE IF NOT EXISTS "reports"(
    "id" BIGSERIAL NOT NULL,
    "reported_user_id" BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "reporter_user_id" BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "report_text" TEXT NOT NULL,
    "report_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT FALSE,
    "action_taken" TEXT
);
ALTER TABLE
    "reports" ADD PRIMARY KEY("id");

----------------------------------------------------------------------------

-- FOREIGN KEYS
ALTER TABLE
    "users" ADD CONSTRAINT "users_role_id_foreign" FOREIGN KEY("role_id") REFERENCES "user_roles"("id");
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
    "user_inventory" ADD CONSTRAINT "user_inventory_product_id_foreign" FOREIGN KEY("product_id") REFERENCES "products"("id");
ALTER TABLE
    "user_inventory" ADD CONSTRAINT "user_inventory_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
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
ALTER TABLE
    "reports" ADD CONSTRAINT "reports_reported_user_id_foreign" FOREIGN KEY("reported_user_id") REFERENCES "users"("id");
ALTER TABLE
    "reports" ADD CONSTRAINT "reports_reporter_user_id_foreign" FOREIGN KEY("reporter_user_id") REFERENCES "users"("id");