import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import styles from './Button.module.scss';

export type ButtonVariant = 'dark' | 'gold' | 'light' | 'outline' | 'outline-light';
export type ButtonSize = 'md' | 'sm';

interface SharedProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
    children: ReactNode;
}

function classNames(variant: ButtonVariant, size: ButtonSize, block: boolean, extra?: string): string {
    return [styles.button, styles[`button--${variant}`], styles[`button--${size}`], block && styles['button--block'], extra]
        .filter(Boolean)
        .join(' ');
}

interface ButtonProps extends SharedProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {}

export const Button = ({ variant = 'dark', size = 'md', block = false, className, children, ...rest }: ButtonProps) => (
    <button type="button" className={classNames(variant, size, block, className)} {...rest}>
        {children}
    </button>
);

interface ButtonLinkProps extends SharedProps {
    to: string;
    className?: string;
    onClick?: () => void;
}

export const ButtonLink = ({
    to,
    variant = 'dark',
    size = 'md',
    block = false,
    className,
    children,
    onClick,
}: ButtonLinkProps) => (
    <Link href={to} className={classNames(variant, size, block, className)} onClick={onClick}>
        {children}
    </Link>
);

interface ButtonAnchorProps extends SharedProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
    href: string;
}

export const ButtonAnchor = ({
    href,
    variant = 'outline',
    size = 'md',
    block = false,
    className,
    children,
    ...rest
}: ButtonAnchorProps) => (
    <a href={href} className={classNames(variant, size, block, className)} {...rest}>
        {children}
    </a>
);
