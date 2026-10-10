create table affiliate_clicks (
  id bigserial primary key,
  partner varchar(80) not null,
  placement varchar(120) not null,
  page_path varchar(300) not null,
  created_at timestamptz not null default now()
);

create index affiliate_clicks_partner_created_idx on affiliate_clicks(partner,created_at desc);
create index affiliate_clicks_placement_created_idx on affiliate_clicks(placement,created_at desc);
