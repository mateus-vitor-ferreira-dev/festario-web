import type { ProviderCategory, ProviderPriceUnit, ProviderServiceMode, PublishRequirement, QuoteStatus } from "../types";

/** Ordem do catálogo da API, com as parecidas lado a lado: é a ordem das bandeirinhas na vitrine. */
export const PROVIDER_CATEGORIES: readonly ProviderCategory[] = [
    "CATERING", "BARBECUE", "CAKE_SWEETS", "DRINKS", "WAITSTAFF", "CEREMONIAL", "DECORATION", "RENTALS",
    "MUSIC", "KIDS_ENTERTAINMENT", "PHOTOGRAPHY", "MAKEUP", "SECURITY", "CLEANING",
];

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
    CATERING: "Buffet",
    BARBECUE: "Churrasco",
    DECORATION: "Decoração",
    MAKEUP: "Maquiagem",
    CAKE_SWEETS: "Bolo e doces",
    PHOTOGRAPHY: "Foto e vídeo",
    MUSIC: "Música e DJ",
    KIDS_ENTERTAINMENT: "Recreação infantil",
    DRINKS: "Bebidas e bar",
    RENTALS: "Mesas e louças",
    WAITSTAFF: "Garçons e copa",
    CEREMONIAL: "Cerimonial",
    SECURITY: "Segurança",
    CLEANING: "Limpeza",
};

export const SERVICE_MODE_LABELS: Record<ProviderServiceMode, string> = {
    ON_SITE: "Atende no local da festa",
    STUDIO: "Atende no estúdio",
    BOTH: "No local da festa ou no estúdio",
};

export const PRICE_UNIT_LABELS: Record<ProviderPriceUnit, string> = {
    FIXED: "pelo serviço",
    PER_GUEST: "por convidado",
    PER_HOUR: "por hora",
};

/** O que fica depois do preço: "R$ 45 por convidado". O preço fixo não leva nada. */
export const PRICE_UNIT_SUFFIX: Record<ProviderPriceUnit, string> = {
    FIXED: "",
    PER_GUEST: " por convidado",
    PER_HOUR: " por hora",
};

export const REQUIREMENT_LABELS: Record<PublishRequirement, string> = {
    NAME: "o nome do negócio",
    CATEGORY: "ao menos uma categoria",
    CITY: "a cidade e o estado",
    WHATSAPP: "o WhatsApp",
    PHOTO: "ao menos uma foto do trabalho",
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
    OPEN: "Aguardando resposta",
    ANSWERED: "Respondido",
    ACCEPTED: "Aceito",
    DECLINED: "Recusado por você",
    CANCELED: "Cancelado",
    REJECTED: "Não pode atender",
    HIRED: "Contratado",
};

/** O mesmo pedido, visto pelo prestador. */
export const PROVIDER_QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
    OPEN: "Novo",
    ANSWERED: "Respondido",
    ACCEPTED: "Aceito pelo cliente",
    DECLINED: "Recusado pelo cliente",
    CANCELED: "Cancelado pelo cliente",
    REJECTED: "Você não atende",
    HIRED: "Contratado",
};

export const EVENT_TYPES = ["Aniversário", "Casamento", "Festa infantil", "Debutante", "Formatura", "Confraternização", "Chá de bebê", "Outro"];
