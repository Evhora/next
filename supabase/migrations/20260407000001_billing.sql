-- Billing module. Entity rows store the full proto-JSON message in `data`;
-- promoted columns exist only for RLS / indexes / ordering / foreign keys.
-- Decode via `fromProtoJson(<Schema>, row.data)` at the repository layer.
--
-- Enum columns are stored twice: `<name>` holds the short Stripe-style label
-- ("stripe", "trialing", "paid") — stable and queryable — and `<name>_name`
-- holds the fully-qualified proto enum name ("PROVIDER_STRIPE",
-- "SUBSCRIPTION_STATUS_TRIALING", "INVOICE_STATUS_PAID") — human-readable at
-- a glance during DB inspection.

CREATE TABLE IF NOT EXISTS billing_customers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider             TEXT NOT NULL,
  provider_name        TEXT NOT NULL,
  provider_customer_id TEXT NOT NULL,
  data                 JSONB NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider),
  UNIQUE (provider, provider_customer_id)
);

CREATE TABLE IF NOT EXISTS billing_products (
  id            TEXT PRIMARY KEY,
  provider      TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  data          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_prices (
  id            TEXT PRIMARY KEY,
  provider      TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  product_id    TEXT NOT NULL REFERENCES billing_products(id) ON DELETE CASCADE,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  currency      TEXT NOT NULL,
  unit_amount   INTEGER,
  interval      TEXT,
  data          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS billing_prices_product_id_idx ON billing_prices(product_id);

CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id                 TEXT PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider           TEXT NOT NULL,
  provider_name      TEXT NOT NULL,
  price_id           TEXT REFERENCES billing_prices(id),
  status             TEXT NOT NULL,
  status_name        TEXT NOT NULL,
  trial_end          TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  data               JSONB NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS billing_subscriptions_user_id_idx
  ON billing_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS billing_invoices (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,
  provider_name   TEXT NOT NULL,
  subscription_id TEXT REFERENCES billing_subscriptions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL,
  status_name     TEXT NOT NULL,
  amount_due      BIGINT NOT NULL DEFAULT 0,
  amount_paid     BIGINT NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL,
  number          TEXT NOT NULL DEFAULT '',
  data            JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS billing_invoices_user_id_idx
  ON billing_invoices(user_id);

CREATE INDEX IF NOT EXISTS billing_invoices_subscription_id_idx
  ON billing_invoices(subscription_id)
  WHERE subscription_id IS NOT NULL;

-- Row Level Security. Webhook uses the service-role key and bypasses RLS.
-- For everyone else, only SELECT is allowed; INSERT/UPDATE/DELETE are denied
-- by the absence of policies.

ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_customers_select_own"
  ON billing_customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "billing_products_select_authenticated"
  ON billing_products FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "billing_prices_select_authenticated"
  ON billing_prices FOR SELECT
  TO authenticated
  USING (TRUE);

-- Expose active products/prices to anonymous visitors so the marketing
-- /pricing page works without a session.
CREATE POLICY "billing_products_select_anon_active"
  ON billing_products FOR SELECT
  TO anon
  USING (active = TRUE);

CREATE POLICY "billing_prices_select_anon_active"
  ON billing_prices FOR SELECT
  TO anon
  USING (active = TRUE);

CREATE POLICY "billing_subscriptions_select_own"
  ON billing_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "billing_invoices_select_own"
  ON billing_invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
