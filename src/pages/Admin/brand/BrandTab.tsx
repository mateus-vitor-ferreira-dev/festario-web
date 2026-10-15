import { LogoAndColor } from "./LogoAndColor";
import { VenuePhotos } from "./VenuePhotos";

/** Aba "Marca e fotos": como o salão aparece para os clientes. */
export function BrandTab() {
    return (
        <div style={{ display: "grid", gap: 20 }}>
            <LogoAndColor />
            <VenuePhotos />
        </div>
    );
}
