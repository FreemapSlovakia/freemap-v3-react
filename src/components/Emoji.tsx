type EmojiProps = {
  children: string;
};

export function Emoji({ children }: EmojiProps) {
  const codepoints = [...children]
    .map((char) => char.codePointAt(0)?.toString(16).toUpperCase())
    .join('-');

  return (
    <img
      className="fm-emoji"
      // src={`https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/${codepoints}.svg`}
      src={`https://cdn.jsdelivr.net/npm/@svgmoji/twemoji@2.0.0/svg/${codepoints}.svg`}
      // src={`https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/${codepoints}.svg`}
    />
  );
}
