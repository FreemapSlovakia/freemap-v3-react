type EmojiProps = {
  children: string;
  className?: string;
};

export function Emoji({ children, className }: EmojiProps) {
  const codepoints = [...children]
    .map((char) => char.codePointAt(0)?.toString(16).toUpperCase())
    .join('-');

  return (
    <img
      className={`w-4 ${className}`}
      // src={`https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/${codepoints}.svg`}
      src={`https://cdn.jsdelivr.net/npm/@svgmoji/twemoji@2.0.0/svg/${codepoints}.svg`}
      // src={`https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/${codepoints}.svg`}
    />
  );
}

export function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
