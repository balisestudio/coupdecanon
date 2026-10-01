-- Two databases, each named after the tool that owns it: "medusa" for the shop, created by
-- POSTGRES_DB, and "payloadcms" for the site's content. Postgres runs this once, when its
-- volume is first created.
CREATE DATABASE payloadcms;
