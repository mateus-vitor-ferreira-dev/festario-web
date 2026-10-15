// ─── Primitivos / Enums ───────────────────────────────────────────────────────

/**
 * Papéis: `USER` (cliente), `OWNER` (dono do espaço — painel do próprio tenant) e
 * `ADMIN` (equipe da plataforma — área da plataforma e painel de qualquer espaço).
 */
export type UserRole = "USER" | "OWNER" | "ADMIN";
export type Role = UserRole;
export type ReservationStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type NegotiationStatus = "OPEN" | "ACCEPTED" | "REJECTED" | "CLOSED" | "PENDING_APPROVAL";
export type ReferralStatus = "PENDING" | "CONVERTED" | "REWARDED";
export type CampaignType = "REFERRAL_NEXT_BOOKING" | "LOYALTY_ALWAYS_HERE" | "RAFFLE_VIP";
export type PromotionStatusValue = "active" | "scheduled" | "ended" | "disabled" | "not_configured";
export type Theme = "light" | "dark";
export type PlanCode = "PROMOCIONAL" | "ESSENCIAL" | "COMPLETA";

// ─── Domínio ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  phone?: string | null;
  birthDate?: string | null;
  theme?: "LIGHT" | "DARK" | "SYSTEM";
}

export interface Venue {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  hasKidsArea: boolean;
  kidsAreaPricePerHour?: number;
  hasPool: boolean;
  poolPricePerDay?: number;
  basePricePerHour?: number;
  /** Alias retornado pela API em alguns endpoints */
  basePrice?: number | null;
  /** Menor preço de plano ativo, em reais — é o "a partir de" do card e a base do filtro `maxPrice`. */
  startingPrice?: number | string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapsUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string | null;
  qrCode?: string;
  copyPaste?: string;
  expiresAt?: string;
  pixTxId?: string | null;
  pixQrCode?: string | null;
  pixCopyPaste?: string | null;
  pixExpiresAt?: string | null;
}

export interface Reservation {
  id: string;
  userId?: string;
  venueId?: string;
  venue?: Pick<Venue, "id" | "name" | "location">;
  /** Presente em respostas do admin */
  user?: Pick<User, "id" | "name" | "email">;
  /** Salão da reserva: o cliente tem uma conta só e reserva em vários salões. */
  tenant?: TenantRef | null;
  status: ReservationStatus;
  planCode?: PlanCode;
  startDate: string;
  endDate: string;
  totalPrice: number;
  notes?: string | null;
  checkoutUrl?: string | null;
  payment?: Payment | null;
  kidsMonitorExtraHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationPlan {
  id: string;
  venueId: string;
  /** Presente em respostas expandidas do admin */
  venue?: Pick<Venue, "id" | "name"> | null;
  code: PlanCode;
  name: string;
  currency: string;
  basePriceAmount: string;
  validWeekdays: number[];
  validOnHolidays: boolean;
  partyDurationHours: number;
  endsAtHour: number;
  keyDeliveryOffsetHours: number;
  includedKidsMonitorHours: number;
  includesPool: boolean;
  includesCleaning: boolean;
}

export interface Campaign {
  id: string;
  code: string;
  type: CampaignType;
  name: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  config?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionGrant {
  id: string;
  percentOff: number;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt?: string;
  campaign: Pick<Campaign, "id" | "code" | "type" | "name" | "endsAt">;
}

export interface PromotionStatusItem {
  type: CampaignType;
  status: PromotionStatusValue;
  campaign: Campaign | null;
}

export interface Referral {
  id: string;
  referredEmail: string;
  referredUserId?: string | null;
  status: ReferralStatus;
  createdAt: string;
  campaign: Pick<Campaign, "id" | "name" | "endsAt">;
}

export interface NegotiationMessageAuthor {
  id: string;
  name: string;
  role: UserRole;
}

export interface ProposalMetadata {
  type: "PROPOSAL";
  venueName?: string;
  startDate: string;
  endDate: string;
  customPriceCents: number;
  notes?: string;
}

export type NegotiationMessageMetadata = ProposalMetadata | null;

export interface NegotiationMessage {
  id: string;
  content: string;
  isSystem: boolean;
  author: NegotiationMessageAuthor;
  metadata?: NegotiationMessageMetadata;
  createdAt: string;
}

export interface Negotiation {
  id: string;
  status: NegotiationStatus;
  subject?: string;
  user: Pick<User, "id" | "name" | "email" | "role">;
  reservation?: Pick<Reservation, "id" | "status" | "totalPrice" | "startDate" | "endDate"> | null;
  messages: NegotiationMessage[];
  reservationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedDate {
  id: string;
  venueId: string;
  /** Presente em respostas expandidas do admin */
  venue?: Pick<Venue, "id" | "name"> | null;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

export interface OccupiedDate {
  startDate: string;
  endDate: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: "national" | "state" | "municipal";
  syncedAt?: string | null;
}

export interface ContactInfo {
  whatsapp: { number: string; display: string };
  email: string;
  instagram: { url: string; display: string };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string | null;
}

/** Espaço (tenant) em que a sessão opera; enviado em `X-Tenant-Slug`. */
export interface TenantRef {
  slug: string;
  name?: string | null;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Espaço guardado (vindo do convite, de `/login?espaco=` ou escolhido pelo ADMIN); `null` = espaço padrão. */
  tenant: TenantRef | null;
  /** Guarda a sessão; com `tenant`, passa a enviar `X-Tenant-Slug` nas próximas requisições. */
  login: (data: unknown, tenant?: TenantRef | null) => void;
  /** Troca o espaço da sessão (`null` volta ao padrão). */
  setTenant: (tenant: TenantRef | null) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

// ─── Plataforma (estabelecimentos e convites) ─────────────────────────────────

export type TenantPlan = "FREE" | "STARTER" | "PRO";
export type InviteStatus = "valid" | "expired" | "accepted" | "revoked";

export interface TenantStats {
  venues: number;
  owners: number;
  reservations: number;
  pendingInvites: number;
  /** Soma das reservas pagas, em reais. */
  paidRevenue: number;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: TenantPlan;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  stats?: TenantStats;
}

export interface OwnerInvite {
  id: string;
  tenantId: string;
  email: string;
  status: InviteStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string;
  invitedBy?: { id: string; name: string } | null;
}

export interface CreateInviteResult {
  invite: OwnerInvite;
  emailSent: boolean;
  /** Só fora de produção (o e-mail pode não estar configurado). */
  inviteUrl?: string;
}

/** Dados públicos do convite (`GET /owner-invites/:token`). */
export interface InviteInfo {
  tenantName: string;
  email: string;
  status: InviteStatus;
  expiresAt: string;
}

export interface AcceptInviteResult {
  user: User;
  token: string;
  refreshToken?: string | null;
  tenant: { id: string; slug: string; name: string };
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Metadados de paginação no formato do contrato da API
 * (`{ data, pagination: { page, limit, total, totalPages } }`).
 * `total`/`totalPages` ficam opcionais para tolerar respostas antigas sem total;
 * nesse caso `hasNext` indica se há uma próxima página.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Parâmetros de consulta comuns a toda listagem paginada. */
export interface ListParams {
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

// ─── Payloads de request ──────────────────────────────────────────────────────

export interface QuotePayload {
  venueId: string;
  planCode: PlanCode;
  startDate: string;
  endDate: string;
  kidsMonitorExtraHours?: number;
}

export interface CreateReservationPayload extends QuotePayload {
  termsAccepted: true;
  notes?: string;
}

export interface QuoteResult {
  totalCents: number;
  subtotalCents: number;
  discountCents: number;
  discountApplied: boolean;
  items: Array<{ description: string; amountCents: number }>;
  planCode: PlanCode;
  currency: string;
}

export interface PixChargeResult {
  txid: string;
  qrCode: string;
  copyPaste: string;
  expiresAt: string;
}

export interface PaymentStatusResult {
  payment: { status: PaymentStatus };
  reservationStatus: ReservationStatus;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ReservationSummary {
  totalReservations: number;
  totalRevenue: number;
  pendingReservations: number;
  paidReservations: number;
  cancelledReservations: number;
  expiredReservations: number;
  revenueByMethod?: {
    stripe?: { amount: number; count: number } | null;
    pix?: { amount: number; count: number } | null;
  } | null;
}

export interface MonthlyRevenue {
  year: number;
  months: Array<{
    month: number;
    revenue: number;
    count: number;
    stripe: number;
    pix: number;
  }>;
}

export interface RaffleWinnerResult {
  winner: User;
  grant: PromotionGrant;
  totalEntries: number;
  campaignName: string;
}
