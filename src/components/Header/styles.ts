import { Link } from "react-router-dom";
import styled from "styled-components";

export const Container = styled.header`
  width: 100%;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-surface);
  position: sticky;
  top: 0;
  z-index: 10;
  transition: background 0.2s ease, border-color 0.2s ease;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

export const BrandWrapper = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
`;

export const Logo = styled.img`
  width: 52px;
  height: 52px;
  object-fit: contain;
`;

export const BrandText = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: var(--brand);

  @media (max-width: 600px) {
    display: none;
  }
`;

export const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? "var(--brand)" : "var(--text-muted)")};
  background: ${({ $active }) => ($active ? "var(--status-paid-bg)" : "transparent")};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--bg-muted);
    color: var(--text-primary);
  }
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ProfileLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  border-radius: 10px;
  padding: 4px 8px 4px 4px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--bg-muted);
  }

  @media (max-width: 480px) {
    padding: 4px;
  }
`;

export const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--brand);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.03em;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  span {
    font-size: 11px;
    color: var(--text-faint);
  }

  strong {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const LogoutButton = styled.button`
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: var(--bg-muted);
  }
`;

export const VerificationBanner = styled.div`
  width: 100%;
  background: #fef9c3;
  border-bottom: 1px solid #fde047;
  color: #713f12;
  font-size: 13px;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
`;

export const ResendButton = styled.button`
  background: none;
  border: none;
  color: #713f12;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ThemeToggle = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--bg-muted);
    color: var(--text-primary);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
