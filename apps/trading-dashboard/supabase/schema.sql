-- =====================================================
-- CDI Trading Dashboard — Schema de portafolios
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- =====================================================

-- 1. PORTAFOLIOS
create table if not exists portafolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  nombre      text not null,
  descripcion text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. POSICIONES ACTIVAS (compras abiertas)
create table if not exists posiciones (
  id              uuid primary key default gen_random_uuid(),
  portafolio_id   uuid not null references portafolios(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  ticker          text not null,
  cantidad        numeric not null check (cantidad > 0),
  precio_compra   numeric not null check (precio_compra >= 0),
  fecha_compra    date not null default current_date,
  nota            text,
  created_at      timestamptz default now()
);

-- 3. HISTORIAL DE VENTAS (P&L realizado)
create table if not exists ventas (
  id              uuid primary key default gen_random_uuid(),
  portafolio_id   uuid not null references portafolios(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  ticker          text not null,
  cantidad        numeric not null check (cantidad > 0),
  precio_compra   numeric not null,
  precio_venta    numeric not null,
  fecha_compra    date not null,
  fecha_venta     date not null default current_date,
  pnl             numeric generated always as ((precio_venta - precio_compra) * cantidad) stored,
  pnl_pct         numeric generated always as (
    case when precio_compra > 0
      then ((precio_venta - precio_compra) / precio_compra) * 100
      else 0 end
  ) stored,
  nota            text,
  created_at      timestamptz default now()
);

-- Índices para queries rápidas
create index if not exists portafolios_user_idx  on portafolios(user_id);
create index if not exists posiciones_port_idx   on posiciones(portafolio_id);
create index if not exists posiciones_user_idx   on posiciones(user_id);
create index if not exists ventas_port_idx       on ventas(portafolio_id);
create index if not exists ventas_user_idx       on ventas(user_id);

-- =====================================================
-- RLS — Row Level Security
-- Cada usuario solo ve / modifica lo suyo
-- =====================================================

alter table portafolios enable row level security;
alter table posiciones  enable row level security;
alter table ventas      enable row level security;

-- PORTAFOLIOS
drop policy if exists portafolios_select on portafolios;
create policy portafolios_select on portafolios
  for select using (auth.uid() = user_id);

drop policy if exists portafolios_insert on portafolios;
create policy portafolios_insert on portafolios
  for insert with check (auth.uid() = user_id);

drop policy if exists portafolios_update on portafolios;
create policy portafolios_update on portafolios
  for update using (auth.uid() = user_id);

drop policy if exists portafolios_delete on portafolios;
create policy portafolios_delete on portafolios
  for delete using (auth.uid() = user_id);

-- POSICIONES
drop policy if exists posiciones_select on posiciones;
create policy posiciones_select on posiciones
  for select using (auth.uid() = user_id);

drop policy if exists posiciones_insert on posiciones;
create policy posiciones_insert on posiciones
  for insert with check (auth.uid() = user_id);

drop policy if exists posiciones_update on posiciones;
create policy posiciones_update on posiciones
  for update using (auth.uid() = user_id);

drop policy if exists posiciones_delete on posiciones;
create policy posiciones_delete on posiciones
  for delete using (auth.uid() = user_id);

-- VENTAS
drop policy if exists ventas_select on ventas;
create policy ventas_select on ventas
  for select using (auth.uid() = user_id);

drop policy if exists ventas_insert on ventas;
create policy ventas_insert on ventas
  for insert with check (auth.uid() = user_id);

drop policy if exists ventas_delete on ventas;
create policy ventas_delete on ventas
  for delete using (auth.uid() = user_id);
