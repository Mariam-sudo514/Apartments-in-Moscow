import type {IconType} from 'react-icons';
import {FaEnvelope} from 'react-icons/fa';
import {PiTelegramLogo, PiWhatsappLogo} from 'react-icons/pi';

export type SocialLabelKey = 'whatsapp' | 'telegram' | 'email';

export type SocialLink = {
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
    Icon: PiWhatsappLogo
  },
  {
    key: 'telegram',
    href: 'https://example.com/telegram',
    external: true,
    Icon: PiTelegramLogo
  },
  {
    key: 'email',
    href: 'mailto:mail@gmail.com',
    external: false,
    Icon: FaEnvelope
  }
] satisfies readonly SocialLink[];

export const contactDisplay = {
  email: 'mail@gmail.com',
  phone: '+7 900 000 00 00',
  telegramHandle: '@TELEGRAM'
} as const;

export function getSocialLink(key: SocialLabelKey): SocialLink {
  const link = socialLinks.find((item) => item.key === key);

  if (link === undefined) {
    throw new Error(`Missing social link: ${key}`);
  }

  return link;
}
