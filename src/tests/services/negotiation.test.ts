import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
    createNegotiation,
    createCustomReservation,
    getNegotiation,
    getContactInfo,
    listNegotiations,
    respondToProposal,
    sendMessage,
    sendProposal,
    updateNegotiationStatus,
} from "../../services/negotiation";
import { server } from "../mocks/server";

const BASE = "http://localhost:3000";

describe("negotiationService", () => {
    it("listNegotiations returns array", async () => {
        server.use(
            http.get(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: true, data: [{ id: "neg-1" }] })
            )
        );
        const result = await listNegotiations();
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("neg-1");
    });

    it("createNegotiation returns new negotiation", async () => {
        server.use(
            http.post(`${BASE}/negotiations`, () =>
                HttpResponse.json({ success: true, data: { id: "neg-1", status: "OPEN" } }, { status: 201 })
            )
        );
        const result = await createNegotiation();
        expect(result.id).toBe("neg-1");
        expect(result.status).toBe("OPEN");
    });

    it("getNegotiation returns single negotiation", async () => {
        server.use(
            http.get(`${BASE}/negotiations/neg-1`, () =>
                HttpResponse.json({ success: true, data: { id: "neg-1", status: "OPEN", messages: [] } })
            )
        );
        const result = await getNegotiation("neg-1");
        expect(result.id).toBe("neg-1");
        expect(result.messages).toEqual([]);
    });

    it("sendMessage returns new message", async () => {
        server.use(
            http.post(`${BASE}/negotiations/neg-1/messages`, () =>
                HttpResponse.json({ success: true, data: { id: "msg-1", content: "Olá" } }, { status: 201 })
            )
        );
        const result = await sendMessage("neg-1", "Olá");
        expect(result.id).toBe("msg-1");
        expect(result.content).toBe("Olá");
    });

    it("updateNegotiationStatus returns updated negotiation", async () => {
        server.use(
            http.patch(`${BASE}/negotiations/neg-1/status`, () =>
                HttpResponse.json({ success: true, data: { id: "neg-1", status: "CLOSED" } })
            )
        );
        const result = await updateNegotiationStatus("neg-1", "CLOSED");
        expect(result.status).toBe("CLOSED");
    });

    it("createCustomReservation returns reservation", async () => {
        server.use(
            http.post(`${BASE}/negotiations/neg-1/reservation`, () =>
                HttpResponse.json({ success: true, data: { id: "res-1" } }, { status: 201 })
            )
        );
        const result = await createCustomReservation("neg-1", { venueId: "v-1" });
        expect(result.id).toBe("res-1");
    });

    it("sendProposal returns updated negotiation", async () => {
        server.use(
            http.post(`${BASE}/negotiations/neg-1/proposal`, () =>
                HttpResponse.json({ success: true, data: { id: "neg-1", status: "PENDING_APPROVAL" } })
            )
        );
        const result = await sendProposal("neg-1", { customPriceCents: 70000 });
        expect(result.status).toBe("PENDING_APPROVAL");
    });

    it("respondToProposal returns result", async () => {
        server.use(
            http.post(`${BASE}/negotiations/neg-1/proposal/respond`, () =>
                HttpResponse.json({ success: true, data: { id: "neg-1", status: "ACCEPTED", reservation: { id: "res-1" } } })
            )
        );
        const result = await respondToProposal("neg-1", "ACCEPT");
        expect(result.status).toBe("ACCEPTED");
        expect(result.reservation.id).toBe("res-1");
    });

    it("getContactInfo returns contact data", async () => {
        server.use(
            http.get(`${BASE}/contact`, () =>
                HttpResponse.json({
                    success: true,
                    data: { whatsapp: { number: "5535999718824" }, email: "test@email.com" },
                })
            )
        );
        const result = await getContactInfo();
        expect(result.whatsapp.number).toBe("5535999718824");
        expect(result.email).toBe("test@email.com");
    });
});
