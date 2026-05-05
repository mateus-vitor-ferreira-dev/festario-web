import Button from "./index";

/** @type {import('@storybook/react-vite').Meta<typeof Button>} */
const meta = {
    title: "Components/Button",
    component: Button,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Botão primário do design system. Largura total, altura fixa de 48px. " +
                    "Aplica o token `--brand` como cor de fundo e suporta todos os atributos HTML nativos de `<button>`.",
            },
        },
    },
    argTypes: {
        children: {
            control: "text",
            description: "Texto ou conteúdo exibido no botão",
        },
        disabled: {
            control: "boolean",
            description: "Desabilita o botão e aplica opacidade reduzida",
        },
        onClick: { action: "clicked" },
    },
};

export default meta;

export const Default = {
    args: { children: "Confirmar reserva" },
};

export const Disabled = {
    args: { children: "Indisponível", disabled: true },
};

export const Loading = {
    args: { children: "Processando...", disabled: true },
};

export const LongLabel = {
    args: { children: "Confirmar e prosseguir para o pagamento" },
};
