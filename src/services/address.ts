/**
 * @module services/address
 * @description Endereço do cliente pelo CEP. A API completa rua, bairro e cidade e calcula a posição
 * para a vitrine medir a distância; a posição nunca volta para o app.
 */
import api from "./api";
import type { User } from "../types";

/** @see PUT /users/me/address */
export async function saveAddress(postalCode: string): Promise<User> {
    const { data } = await api.put("/users/me/address", { postalCode });
    return data.data;
}

/** Apaga o endereço e a posição juntos. @see DELETE /users/me/address */
export async function removeAddress(): Promise<User> {
    const { data } = await api.delete("/users/me/address");
    return data.data;
}
