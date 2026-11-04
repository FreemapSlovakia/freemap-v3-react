import { lexer, type MarkedToken, type Token } from 'marked';
import { Fragment, type ReactElement, type ReactNode } from 'react';

type LinkRenderer = (props: { href: string; children: ReactNode }) => ReactNode;

type Props = {
  /** Markdown as a user typed it; plain text reads as itself. */
  text: string;
  /** Renders a link, e.g. as an `AlertLink` inside an alert. */
  link?: LinkRenderer;
};

const defaultLink: LinkRenderer = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

// Contacts too: an email address becomes a `mailto:` link of itself.
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:)/i;

/**
 * User-written Markdown as React elements — never as HTML, so it can't carry
 * markup or scripts: raw HTML shows as text, images as links, and only http(s),
 * mailto and tel links are links. A single line break stays a line break.
 */
export function Markdown({ text, link = defaultLink }: Props): ReactElement {
  const tokens = lexer(text, { gfm: true, breaks: true });

  // A gap between blocks, not margins, so nothing trails the last one.
  return <div className="d-flex flex-column gap-1">{blocks(tokens, link)}</div>;
}

function blocks(tokens: Token[], link: LinkRenderer): ReactNode[] {
  return tokens.map((token, i) => (
    <Fragment key={i}>{block(token as MarkedToken, link)}</Fragment>
  ));
}

function block(token: MarkedToken, link: LinkRenderer): ReactNode {
  switch (token.type) {
    case 'paragraph':
      return <p className="mb-0">{inline(token.tokens, link)}</p>;

    case 'heading':
      // Small: it heads a part of a description, not the page.
      return <div className="fw-bold">{inline(token.tokens, link)}</div>;

    case 'list': {
      const List = token.ordered ? 'ol' : 'ul';

      return (
        <List
          className="mb-0 ps-4"
          start={token.ordered && token.start !== '' ? token.start : undefined}
        >
          {token.items.map((item, i) => (
            <li key={i}>{blocks(item.tokens, link)}</li>
          ))}
        </List>
      );
    }

    case 'blockquote':
      return (
        <blockquote className="border-start border-3 ps-2 mb-0">
          {blocks(token.tokens, link)}
        </blockquote>
      );

    case 'code':
      return (
        <pre className="mb-0">
          <code>{token.text}</code>
        </pre>
      );

    case 'hr':
      return <hr className="my-2" />;

    case 'space':
    case 'def':
      return null;

    case 'text':
      // A list item's text, which may hold inline tokens of its own.
      return token.tokens ? inline(token.tokens, link) : token.text;

    default:
      return token.raw;
  }
}

function inline(tokens: Token[] | undefined, link: LinkRenderer): ReactNode {
  return tokens?.map((t, i) => {
    const token = t as MarkedToken;

    switch (token.type) {
      case 'text':
        return (
          <Fragment key={i}>
            {token.tokens ? inline(token.tokens, link) : token.text}
          </Fragment>
        );

      case 'escape':
        return token.text;

      case 'strong':
        return <strong key={i}>{inline(token.tokens, link)}</strong>;

      case 'em':
        return <em key={i}>{inline(token.tokens, link)}</em>;

      case 'del':
        return <del key={i}>{inline(token.tokens, link)}</del>;

      case 'codespan':
        return <code key={i}>{token.text}</code>;

      case 'br':
        return <br key={i} />;

      case 'link':
      case 'image':
        return SAFE_HREF.test(token.href) ? (
          <Fragment key={i}>
            {link({
              href: token.href,
              children:
                token.type === 'image'
                  ? token.text || token.href
                  : inline(token.tokens, link),
            })}
          </Fragment>
        ) : (
          token.raw
        );

      default:
        return token.raw;
    }
  });
}
