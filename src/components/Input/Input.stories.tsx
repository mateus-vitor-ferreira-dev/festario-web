import Input from "./index";

/** @type {import('@storybook/react-vite').Meta<typeof Input>} */
const meta = {
    title: "Components/Input",
    component: Input,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Campo de formulário com suporte a label, erro, prefixo e toggle de senha. " +
                    "Ao usar `showPasswordToggle`, o input alterna entre `type=password` e `type=text` automaticamente.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Rótulo exibido acima do campo" },
        placeholder: { control: "text" },
        error: { control: "text", description: "Mensagem de erro exibida abaixo do campo (borda vermelha)" },
        prefix: { control: "text", description: "Ícone ou texto exibido antes do input (ex.: 🇧🇷)" },
        disabled: { control: "boolean" },
        showPasswordToggle: { control: "boolean", description: "Exibe botão para mostrar/ocultar senha" },
        type: {
            control: "select",
            options: ["text", "email", "password", "tel", "date"],
        },
    },
};

export default meta;

export const Default = {
    args: {
        label: "E-mail",
        type: "email",
        placeholder: "seu@email.com",
    },
};

export const WithError = {
    args: {
        label: "E-mail",
        type: "email",
        placeholder: "seu@email.com",
        error: "E-mail inválido ou já cadastrado.",
    },
};

export const WithPrefix = {
    args: {
        label: "Telefone",
        type: "tel",
        placeholder: "(35) 9 9999-9999",
        prefix: "🇧🇷",
    },
};

export const PasswordToggle = {
    args: {
        label: "Senha",
        placeholder: "Digite sua senha",
        showPasswordToggle: true,
    },
};

export const Disabled = {
    args: {
        label: "Campo desabilitado",
        placeholder: "Não editável",
        disabled: true,
    },
};

export const NoLabel = {
    args: {
        placeholder: "Pesquisar...",
        type: "text",
    },
};
