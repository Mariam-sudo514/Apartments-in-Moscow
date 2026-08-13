import type {IconType} from 'react-icons';
import {FaEnvelope, FaTelegramPlane, FaWhatsapp} from 'react-icons/fa';

export type SocialLabelKey = 'whatsapp' | 'telegram' | 'email';

type SocialLink = {
  key: SocialLabelKey;
  href: string;
  external: boolean;
  Icon: IconType;
};

export const socialLinks = [
  {
    key: 'whatsapp',
    href: 'https://example.com/whatsapp',
    external: true,
    Icon: FaWhatsapp
  },
  {
    key: 'telegram',
    href: 'https://example.com/telegram',
    external: true,
    Icon: FaTelegramPlane
  },
  {
    key: 'email',
    href: 'mailto:hello@example.com',
    external: false,
    Icon: FaEnvelope
  }
] satisfies readonly SocialLink[];
