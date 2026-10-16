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
  /** Endereço do perfil (opcional), para a vitrine mostrar os salões mais perto. Sem coordenadas no front. */
  postalCode?: string | null;
  street?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  hasLocation?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  hasKidsArea: boolean;
  kidsAreaPricePerHour?: number;
  hasPool: boolean;
  /** Comodidades do espaço (códigos do catálogo). */
  amenities?: string[];
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
  /** Fotos do espaço, capa primeiro. */
  photos?: VenuePhoto[];
}

/** Resumo do dinheiro da reserva: `amount` = total recebido pelo salão; `refundAmount` = devolvido. */
export interface Payment {
  id: string;
  reservationId?: string;
  amount: number | string;
  status: PaymentStatus;
  paidAt?: string | null;
  refundAmount?: number | string | null;
  /** Devolução devida pela política ao cancelar; o salão devolve e registra. */
  refundDueAmount?: number | string | null;
}

export type PaymentMethod = "PIX" | "CASH" | "CARD" | "TRANSFER" | "OTHER";
export type PaymentEntryKind = "PAYMENT" | "REFUND";

/** Lançamento registrado pelo dono do salão: pagamento recebido ou devolução. */
export interface PaymentEntry {
  id: string;
  kind: PaymentEntryKind;
  method: PaymentMethod;
  amountCents: number;
  paidAt: string;
  note: string | null;
  createdAt: string;
  recordedBy: { id: string; name: string } | null;
}

/** GET /payments/reservation/:id — pagamento combinado com o salão. Valores em centavos. */
export interface ReservationPayment {
  reservationId: string;
  reservationStatus: ReservationStatus;
  mode: "MANUAL";
  summary: {
    totalCents: number;
    /** Valor que confirma a reserva: o sinal ou o total. */
    requiredCents: number;
    paidCents: number;
    refundedCents: number;
    netCents: number;
    balanceCents: number;
    missingToConfirmCents: number;
    confirmed: boolean;
  };
  depositCents: number | null;
  balanceDueAt: string | null;
  /** Até quando o salão precisa registrar o pagamento da reserva pendente. */
  confirmBy: string | null;
  refundDueCents: number | null;
  refundPercentage: number | null;
  entries: PaymentEntry[];
  instructions: { text: string | null; whatsapp: string | null; phone: string | null; email: string | null; instagram: string | null } | null;
  venue: { id: string; name: string } | null;
  tenant: { slug: string; name: string } | null;
}

export interface PaymentEntryInput {
  kind: PaymentEntryKind;
  method: PaymentMethod;
  /** Em reais. */
  amount: number;
  paidAt?: string;
  note?: string;
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
  /** Código do pacote (reservas antigas); o nome contratado está em `packageSnapshot`. */
  planCode?: string | null;
  packageId?: string | null;
  /** Cópia do pacote contratado: mudar o pacote depois não altera a reserva. */
  packageSnapshot?: { name?: string; description?: string | null } | null;
  guestCount?: number | null;
  /** Política que vale para esta reserva (a gravada ou o padrão), com as frases. */
  cancellationPolicy?: ReservationPolicy;
  startDate: string;
  endDate: string;
  totalPrice: number;
  notes?: string | null;
  /** Sinal que confirma a reserva; nulo = o total. */
  depositAmount?: number | string | null;
  balanceDueAt?: string | null;
  payment?: Payment | null;
  kidsMonitorExtraHours?: number;
  createdAt?: string;
  updatedAt?: string;
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
  /** Salão onde o cupom vale (o que o concedeu). */
  tenant?: TenantRef | null;
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
  /** national = vale para todos os salões; salon = cadastrado pelo dono. */
  scope?: "national" | "salon";
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
  packageId: string;
  guestCount: number;
  /** Adicionais escolhidos; em item por hora, `quantity` é o total de horas (contando as inclusas). */
  items?: { itemId: string; quantity?: number }[];
  startDate: string;
  endDate: string;
}

export interface CreateReservationPayload extends QuotePayload {
  termsAccepted: true;
  notes?: string;
}

/** Política de cancelamento como a API devolve: faixas da maior antecedência para a menor e as frases. */
export interface ReservationPolicy {
  tiers: RefundTier[];
  notes?: string | null;
  summary: string[];
}

export interface QuoteLine {
  type: "PLAN_BASE" | "INCLUDED_ITEM" | "EXTRA_ITEM" | string;
  description: string;
  quantity: number;
  unitAmountCents: number;
  totalAmountCents: number;
}

export interface QuoteResult {
  currency: string;
  packageId: string | null;
  packageName: string | null;
  guestCount: number | null;
  items: QuoteLine[];
  cancellationPolicy: ReservationPolicy;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  discountApplied: { percentOff: number; campaignName: string } | null;
  /** Como o salão recebe: sinal que confirma a reserva e prazo do restante. */
  paymentTerms?: { depositCents: number | null; depositPercent: number | null; balanceDueDays: number | null };
}

/** Item do pacote como a vitrine recebe (GET /venues/:id/packages). */
export interface VenuePackageItem {
  itemId: string;
  key: string | null;
  name: string;
  description: string | null;
  chargeType: ItemChargeType;
  unitPrice: string;
  minQuantity: number | null;
  maxQuantity: number | null;
  mode: PackageItemMode;
  includedQuantity: number | null;
}

/** Pacote ativo do espaço; `availableOnDate` vem quando a consulta tem data. */
export interface VenuePackage {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  basePriceAmount: string;
  validWeekdays: number[] | null;
  validOnHolidays: boolean;
  earliestStartMinute: number | null;
  latestEndMinute: number | null;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;
  minGuests: number | null;
  maxGuests: number | null;
  items: VenuePackageItem[];
  availableOnDate?: boolean;
}

export interface VenuePackages {
  date: string | null;
  /** O dia é feriado (nacional ou do salão); nulo sem data. */
  holiday: boolean | null;
  packages: VenuePackage[];
}

/** O que o cliente precisa do salão para reservar (GET /tenant). */
export interface PublicTenant {
  slug: string;
  name: string;
  timezone: string;
  minLeadHours: number | null;
  maxAdvanceDays: number | null;
  cancellationPolicy: ReservationPolicy;
  logoUrl?: string | null;
  logoVariants?: ImageVariant[] | null;
  /** Cor da marca do salão (contraste AA com texto branco) e a variante clara para o tema escuro. */
  primaryColor?: string | null;
  primaryColorDark?: string | null;
}

/** Um tamanho de uma imagem guardada pela API (WebP). */
export interface ImageVariant {
  width: number;
  height: number;
  url: string;
}

/** Foto de um espaço: capa primeiro; `variants` da menor para a maior. */
export interface VenuePhoto {
  id: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
  width: number;
  height: number;
  variants: ImageVariant[];
}

/** Marca do salão no painel. */
export interface SalonBranding {
  name: string;
  logoUrl: string | null;
  logoVariants: ImageVariant[] | null;
  primaryColor: string | null;
  primaryColorDark: string | null;
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
  grossRevenue?: number;
  totalRefunded?: number;
  /** Recebido menos devolvido, por forma de pagamento. */
  revenueByMethod?: Partial<Record<PaymentMethod, { amount: number; count: number }>> | null;
}

export interface MonthlyRevenue {
  year: number;
  months: Array<{
    month: number;
    revenue: number;
    count: number;
    refunded?: number;
    byMethod?: Partial<Record<PaymentMethod, number>>;
  }>;
}

export interface RaffleWinnerResult {
  winner: User;
  grant: PromotionGrant;
  totalEntries: number;
  campaignName: string;
}

/**
 * Contrato de locação montado pela API: o mesmo documento que vira PDF e que a reserva guarda
 * quando o cliente aceita.
 */
export interface ContractDocument {
  version: number;
  generatedAt: string;
  title: string;
  landlord: { name: string; tradeName: string; document: string | null; address: string | null; phone: string | null; email: string | null };
  renter: { name: string; email: string; phone: string | null };
  event: { venue: string; address: string | null; date: string; start: string; end: string; guests: number | null; keyDelivery: string | null };
  package: { name: string; description: string | null; included: string[] };
  charges: { lines: { description: string; amount: string }[]; discount: string | null; total: string };
  payment: string;
  clauses: { title: string; text: string }[];
  cancellation: { summary: string[]; notes: string | null };
  place: string | null;
}

/** Contato do salão (GET /contact). Canal não cadastrado = null. */
export interface SalonContact {
  name: string;
  whatsapp: { number: string; display: string } | null;
  phone: string | null;
  email: string | null;
  instagram: { url: string; display: string } | null;
  address: string | null;
}

// ─── Regras do salão ────────────────────────────────────────────────

export type ItemChargeType = "FIXED" | "PER_HOUR" | "PER_GUEST";
export type PackageItemMode = "INCLUDED" | "OPTIONAL";

/** Item do catálogo do salão: pronto (`key`) ou próprio (`key` nulo). */
export interface SalonItem {
  id: string;
  key: string | null;
  name: string;
  description: string | null;
  chargeType: ItemChargeType;
  unitPrice: string;
  minQuantity: number | null;
  maxQuantity: number | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { packages: number };
}

/** Modelo de item pronto da plataforma; `itemId` preenchido quando o salão já o ligou. */
export interface ItemTemplate {
  key: string;
  name: string;
  chargeType: ItemChargeType;
  description: string | null;
  itemId: string | null;
}

/** Pacote do salão como o painel recebe (GET /admin/plans). */
export interface SalonPackage {
  id: string;
  venueId: string | null;
  venue?: { id: string; name: string } | null;
  code: string | null;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  basePriceAmount: string;
  validWeekdays: number[] | null;
  validOnHolidays: boolean;
  earliestStartMinute: number | null;
  latestEndMinute: number | null;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;
  minGuests: number | null;
  maxGuests: number | null;
  keyDeliveryOffsetHours: number;
  activeFrom: string | null;
  activeTo: string | null;
  items: { mode: PackageItemMode; includedQuantity: number | null; item: Pick<SalonItem, "id" | "key" | "name" | "chargeType" | "unitPrice" | "isActive"> }[];
}

export interface PackageItemInput {
  itemId: string;
  mode: PackageItemMode;
  includedQuantity?: number | null;
}

export type SalonPackageInput = Partial<Omit<SalonPackage, "id" | "venue" | "items" | "basePriceAmount">> & {
  basePriceAmount?: number;
  items?: PackageItemInput[];
};

export interface RefundTier {
  minDays: number;
  percentage: number;
}

/** Regras e perfil do salão (GET/PUT /tenant/settings). */
export interface TenantSettings {
  slug: string;
  name: string;
  timezone: string;
  city: string | null;
  state: string | null;
  paymentHoldMinutes: number | null;
  effectivePaymentHoldMinutes: number;
  minLeadHours: number | null;
  maxAdvanceDays: number | null;
  cancellationPolicy: { tiers: RefundTier[]; notes: string | null; isDefault: boolean; summary: string[] };
  address: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  instagram: string | null;
  legalName: string | null;
  documentNumber: string | null;
  chatbotFaq: string | null;
  /** Pagamento combinado com o salão: sinal que confirma (nulo = total), prazo do restante e como pagar. */
  depositPercent: number | null;
  balanceDueDays: number | null;
  paymentInstructions: string | null;
}

export type TenantSettingsInput = Partial<Omit<TenantSettings, "slug" | "name" | "effectivePaymentHoldMinutes" | "cancellationPolicy">> & {
  cancellationPolicy?: { tiers: RefundTier[]; notes?: string | null } | null;
};

export interface ContractClause {
  id: string;
  key: string | null;
  title: string;
  body: string;
  fineAmount: string | null;
  timeLimit: string | null;
  sortOrder: number;
  isActive: boolean;
  rendered: string;
}

export interface ClauseTemplate {
  key: string;
  title: string;
  body: string;
  usesFine: boolean;
  usesTime: boolean;
  clauseId: string | null;
}

// ─── Vitrine de salões ────────────────────────────────────────────────────────

/** De onde a vitrine mediu a distância (`label` é o bairro/cidade quando há). */
export interface SalonOrigin {
  source: "coords" | "cep" | "profile";
  label: string | null;
}

/** Um salão na vitrine: endereço e capa do espaço mais perto (ou do primeiro). */
export interface SalonCard {
  slug: string;
  name: string;
  logoUrl: string | null;
  logoVariants: ImageVariant[] | null;
  primaryColor: string | null;
  primaryColorDark: string | null;
  cover: VenuePhoto | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  capacity: { min: number; max: number };
  startingPrice: number | null;
  amenities: { hasPool: boolean; hasKidsArea: boolean };
  /** Comodidades dos espaços do salão (códigos do catálogo, na ordem dele). */
  amenityList?: string[];
  venueCount: number;
  distanceKm: number | null;
  nearestVenueId: string | null;
}

export interface SalonVenue {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  hasPool: boolean;
  hasKidsArea: boolean;
  /** Comodidades do espaço (códigos do catálogo). */
  amenities?: string[];
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  location: string | null;
  startingPrice: number | null;
  photos: VenuePhoto[];
  mapsUrl: string | null;
  distanceKm: number | null;
}

/** Página pública do salão (`GET /salons/:slug`). */
export interface SalonDetail extends SalonCard {
  priceRange: { min: number; max: number } | null;
  contact: {
    address: string | null;
    contactWhatsapp: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    instagram: string | null;
  } | null;
  venues: SalonVenue[];
  origin: SalonOrigin | null;
}

/** Ponto de partida da distância, como a API recebe: coordenadas, CEP ou o endereço do perfil. */
export interface SalonOriginParams {
  lat?: number;
  lng?: number;
  cep?: string;
  origin?: "profile";
}
