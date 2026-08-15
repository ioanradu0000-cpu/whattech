alter table forum_posts add column owner_token_hash char(64);
alter table forum_replies add column owner_token_hash char(64);

