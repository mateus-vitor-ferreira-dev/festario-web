/**
 * @module config/refreshMode
 * @description Como o refresh token viaja entre o navegador e a API.
 *
 * Em produção (app.festario.com.br → api.festario.com.br) e no dev local (localhost:5173 →
 * localhost:3000) o front e a API são o mesmo site: o refresh token fica num cookie HttpOnly que
 * nenhum script lê. As prévias em `*.workers.dev` são outro site em relação à API, e o navegador
 * não manda para lá um cookie SameSite=Lax. Só nelas o token volta no corpo (`X-Refresh-Mode: body`)
 * e fica no sessionStorage da aba.
 */
export function isBodyRefreshMode(): boolean {
    return window.location.hostname.endsWith(".workers.dev");
}
