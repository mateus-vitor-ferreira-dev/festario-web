import { forwardRef } from "react";

export const PDFDownloadLink = forwardRef(function PDFDownloadLink(
    { fileName, children, ...props },
    ref
) {
    const content =
        typeof children === "function" ? children({ loading: false }) : children;
    return (
        <a href="#" download={fileName} ref={ref} {...props}>
            {content}
        </a>
    );
});

export const Document = ({ children }) => children;
export const Page = ({ children }) => <div>{children}</div>;
export const Text = ({ children, style: _style, ...rest }) => (
    <span {...rest}>{children}</span>
);
export const View = ({ children, style: _style, ...rest }) => (
    <div {...rest}>{children}</div>
);
export const StyleSheet = { create: (styles) => styles };
export const Font = { register: () => {} };
export const Image = () => null;
