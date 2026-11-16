/**
 * Tipos do marketplace da festa: prestadores de serviço (buffet, decoração, maquiagem...), pedidos de
 * orçamento e fornecedores que o salão indica. Espelham as respostas de `/providers`, `/quotes`,
 * `/admin/partners` e `/reservations/:id/party-services`.
 */
import type { VenuePhoto } from "./index";

export type ProviderCategory =
    | "CATERING" | "BARBECUE" | "DECORATION" | "MAKEUP" | "CAKE_SWEETS" | "PHOTOGRAPHY" | "MUSIC" | "KIDS_ENTERTAINMENT" | "DRINKS";

export type ProviderServiceMode = "ON_SITE" | "STUDIO" | "BOTH";
export type ProviderPriceUnit = "FIXED" | "PER_GUEST" | "PER_HOUR";
export type ProviderVisibility = "DRAFT" | "PUBLISHED" | "HIDDEN";
export type PublishRequirement = "NAME" | "CATEGORY" | "CITY" | "WHATSAPP" | "PHOTO";
export type QuoteStatus = "OPEN" | "ANSWERED" | "ACCEPTED" | "DECLINED" | "CANCELED" | "REJECTED" | "HIRED";

/** As fotos do portfólio têm o mesmo formato das fotos de espaço. */
export type ProviderPhoto = VenuePhoto;

export interface ProviderCard {
    id: string;
    slug: string;
    name: string;
    categories: ProviderCategory[];
    city: string | null;
    state: string | null;
    serviceMode: ProviderServiceMode;
    serviceRadiusKm: number;
    cover: ProviderPhoto | null;
    startingPrice: number | null;
    startingPriceUnit: ProviderPriceUnit | null;
    distanceKm: number | null;
}

export interface ProviderPackage {
    id: string;
    name: string;
    description: string | null;
    price: number;
    priceUnit: ProviderPriceUnit;
}

export interface ProviderDetail extends Omit<ProviderCard, "cover" | "distanceKm"> {
    description: string | null;
    instagram: string | null;
    photos: ProviderPhoto[];
    packages: ProviderPackage[];
    busyDates: string[];
    recommendedBy: { slug: string; name: string; logoUrl: string | null }[];
    /** O dono vendo o próprio perfil ainda fora da vitrine. */
    preview: boolean;
    createdAt: string;
}

export interface OwnerPackage extends ProviderPackage {
    sortOrder: number;
    isActive: boolean;
}

export interface MyProvider {
    id: string;
    slug: string;
    name: string;
    categories: ProviderCategory[];
    description: string | null;
    city: string | null;
    state: string | null;
    serviceRadiusKm: number;
    serviceMode: ProviderServiceMode;
    startingPrice: number | null;
    startingPriceUnit: ProviderPriceUnit | null;
    whatsapp: string | null;
    email: string | null;
    instagram: string | null;
    status: "DRAFT" | "PUBLISHED";
    visibility: ProviderVisibility;
    hiddenReason: string | null;
    missingToPublish: PublishRequirement[];
    packages: OwnerPackage[];
    photos: ProviderPhoto[];
    busyDates: { id: string; date: string; note: string | null }[];
}

export type ProviderProfileInput = Partial<Pick<MyProvider,
    "name" | "categories" | "description" | "city" | "state" | "serviceRadiusKm" | "serviceMode" | "startingPrice" | "startingPriceUnit" | "whatsapp" | "email" | "instagram">>;

export interface PackageInput {
    name?: string;
    description?: string | null;
    price?: number;
    priceUnit?: ProviderPriceUnit;
    isActive?: boolean;
}

interface QuoteBase {
    id: string;
    status: QuoteStatus;
    eventDate: string;
    guests: number | null;
    eventType: string;
    city: string | null;
    message: string;
    quotedAmount: number | null;
    responseMessage: string | null;
    rejectionReason: string | null;
    answeredAt: string | null;
    closedAmount: number | null;
    hiredAt: string | null;
    createdAt: string;
    reservationId: string | null;
    package: { id: string; name: string; price: number; priceUnit: ProviderPriceUnit } | null;
    referredBy: { slug: string; name: string } | null;
}

export interface CustomerQuote extends QuoteBase {
    provider: {
        slug: string;
        name: string;
        categories: ProviderCategory[];
        city: string | null;
        state: string | null;
        cover: ProviderPhoto | null;
        instagram: string | null;
        /** Só depois da resposta do prestador. */
        contact: { whatsapp: string | null; email: string | null } | null;
    };
}

export interface ProviderQuote extends QuoteBase {
    customer: { name: string; email: string; phone: string | null };
}

export interface QuoteRequestInput {
    eventDate: string;
    guests?: number | null;
    eventType: string;
    city?: string | null;
    message: string;
    packageId?: string | null;
    reservationId?: string | null;
}

export interface SalonPartner {
    id: string;
    note: string | null;
    sortOrder: number;
    listed: boolean;
    provider: { id: string; slug: string; name: string; categories: ProviderCategory[]; city: string | null; state: string | null; cover: ProviderPhoto | null };
}

export interface PartnerSearchResult {
    id: string;
    slug: string;
    name: string;
    categories: ProviderCategory[];
    city: string | null;
    state: string | null;
    cover: ProviderPhoto | null;
    isPartner: boolean;
}

/** Fornecedor na página pública do salão. */
export interface PublicPartner {
    id: string;
    slug: string;
    name: string;
    categories: ProviderCategory[];
    city: string | null;
    state: string | null;
    cover: ProviderPhoto | null;
    note: string | null;
}

export interface PartyServices {
    reservationId: string;
    date: string;
    guests: number | null;
    city: string | null;
    state: string | null;
    categories: { category: ProviderCategory; providers: (ProviderCard & { recommended: boolean; note: string | null })[] }[];
}
