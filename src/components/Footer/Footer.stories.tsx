import Footer from "./index";

/** @type {import('@storybook/react-vite').Meta<typeof Footer>} */
const meta = {
    title: "Components/Footer",
    component: Footer,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: "Rodapé global da aplicação. Exibe copyright e tagline. Sem props — conteúdo fixo.",
            },
        },
    },
};

export default meta;

export const Default = {};
