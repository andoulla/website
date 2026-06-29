import contactData from './contact.json';

export interface Contact {
  email: string;
  linkedIn: string;
  github: string;
}

export const contact: Contact = contactData;
