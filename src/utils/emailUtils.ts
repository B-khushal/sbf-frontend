/**
 * Utility to fix common email domain and TLD typos automatically in frontend inputs.
 * Examples:
 * - gmail.con -> gmail.com
 * - gmai.com / gamil.com / gmial.com -> gmail.com
 * - any domain ending in .con -> .com
 * - yahoo.con -> yahoo.com, outlook.con -> outlook.com, hotmail.con -> hotmail.com
 */

export function fixEmailTypo(input: string): string {
  if (!input || typeof input !== 'string') return input;

  // Handle comma-separated list of emails
  if (input.includes(',')) {
    return input
      .split(',')
      .map(part => fixEmailTypo(part.trim()))
      .join(', ');
  }

  // Handle angle bracket format: "Full Name <user@gmail.con>"
  const angleMatch = input.match(/^(.*)<([^>]+)>(.*)$/);
  if (angleMatch) {
    const prefix = angleMatch[1];
    const emailInside = fixEmailTypo(angleMatch[2].trim());
    const suffix = angleMatch[3];
    return `${prefix}<${emailInside}>${suffix}`.trim();
  }

  let cleaned = input.trim();
  if (!cleaned) return cleaned;

  // Split on the last '@'
  const atIndex = cleaned.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === cleaned.length - 1) {
    return cleaned;
  }

  let local = cleaned.substring(0, atIndex).trim().replace(/@+$/, '');
  let domain = cleaned.substring(atIndex + 1).trim().toLowerCase();

  // Normalize consecutive dots and trailing dots in domain
  domain = domain.replace(/\.{2,}/g, '.').replace(/\.+$/, '');

  // 1. Generic .con (and common .com typos) at the end of domain
  // Since .con is never a valid ICANN TLD, any domain ending in .con is safely fixed to .com
  domain = domain
    .replace(/\.con$/i, '.com')
    .replace(/\.cmo$/i, '.com')
    .replace(/\.comm$/i, '.com')
    .replace(/\.coom$/i, '.com')
    .replace(/\.cpm$/i, '.com')
    .replace(/\.ocm$/i, '.com')
    .replace(/\.xom$/i, '.com')
    .replace(/\.vom$/i, '.com');

  // 2. Specific major provider domain and TLD misspellings
  // Gmail typos
  const gmailTypoRegex = /^(gmail|gmai|gamil|gmial|gmaill|gmal|gmaiil|gmaul|gnail)(\.com|\.con|\.co|\.cmo|\.comm|\.coom|com)$/i;
  if (gmailTypoRegex.test(domain)) {
    domain = 'gmail.com';
  }

  // Googlemail typos
  if (/^googlemail\.(con|cmo|comm|coom)$/i.test(domain)) {
    domain = 'googlemail.com';
  }

  // Yahoo typos
  if (/^(yahoo|yaho|yahooo|ymai|ymail)(\.com|\.con|\.cmo|\.comm|\.coom|com)$/i.test(domain)) {
    domain = 'yahoo.com';
  }

  // Hotmail typos
  if (/^(hotmail|hotmial|hotmaill|hotmaildot)(\.com|\.con|\.cmo|\.comm|\.coom|com)$/i.test(domain)) {
    domain = 'hotmail.com';
  }

  // Outlook typos
  if (/^(outlook|outlok|outloo)(\.com|\.con|\.cmo|\.comm|\.coom|com)$/i.test(domain)) {
    domain = 'outlook.com';
  }

  // iCloud typos
  if (/^(icloud|icoud)(\.com|\.con|\.cmo|\.comm|\.coom|com)$/i.test(domain)) {
    domain = 'icloud.com';
  }

  return `${local}@${domain}`;
}

export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return email;
  return fixEmailTypo(email).toLowerCase();
}
