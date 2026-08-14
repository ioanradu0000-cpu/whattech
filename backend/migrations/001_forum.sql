create extension if not exists pgcrypto;

create table forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_name varchar(50) not null check (char_length(trim(author_name)) between 2 and 50),
  title varchar(140) not null check (char_length(trim(title)) between 10 and 140),
  body text not null check (char_length(trim(body)) between 30 and 5000),
  device_id varchar(160) not null,
  device_brand varchar(80) not null,
  device_model varchar(140) not null,
  device_category varchar(40) not null check (device_category in ('phone','laptop','desktop','component','tablet','monitor','tv','console','handheld','audio','camera','charger','cable','adapter','dock','storage','networking','smart-home','wearable','peripheral','other')),
  topic varchar(40) not null check (topic in ('charging-power','display','performance','software','connectivity','audio','accessories','other')),
  status varchar(16) not null default 'open' check (status in ('open','solved')),
  reply_count integer not null default 0 check (reply_count >= 0),
  view_count integer not null default 0 check (view_count >= 0),
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  author_name varchar(50) not null check (char_length(trim(author_name)) between 2 and 50),
  body text not null check (char_length(trim(body)) between 15 and 4000),
  is_accepted boolean not null default false,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now()
);

create index forum_posts_updated_idx on forum_posts(updated_at desc,id desc);
create index forum_posts_device_updated_idx on forum_posts(device_id,updated_at desc);
create index forum_posts_topic_updated_idx on forum_posts(topic,updated_at desc);
create index forum_replies_post_created_idx on forum_replies(post_id,created_at,id);
create unique index forum_replies_one_accepted_idx on forum_replies(post_id) where is_accepted;

create or replace function refresh_forum_reply_count() returns trigger language plpgsql as $$
begin
  if tg_op='INSERT' then
    update forum_posts set reply_count=reply_count+1,updated_at=now() where id=new.post_id;
    return new;
  end if;
  update forum_posts set reply_count=greatest(0,reply_count-1),updated_at=now() where id=old.post_id;
  return old;
end $$;

create trigger forum_reply_count after insert or delete on forum_replies for each row execute function refresh_forum_reply_count();

