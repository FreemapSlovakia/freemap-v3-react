/** The flag emoji of an ISO 3166-1 alpha-2 code, in either case. */
export function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
