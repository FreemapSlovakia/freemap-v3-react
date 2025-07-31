import { ReactNode, useEffect, useState } from 'react';

const LANGUAGES = ['Language', 'Lingua', 'Jazyk', 'Język', 'Sprache', 'Nyelv'];

type Props = { children: (text: string) => ReactNode };

export function LanguageLabel({ children }: Props) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.floor(Math.random() * LANGUAGES.length),
  );

  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);

      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % LANGUAGES.length);
        setFading(false);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const prevIndex = (currentIndex + LANGUAGES.length - 1) % LANGUAGES.length;

  return (
    <span className="position-relative">
      <span
        key={prevIndex}
        className={`position-absolute top-0 start-0 transition-opacity ${fading ? 'opacity-0' : 'opacity-100'} text-nowrap fm-transition`}
      >
        {children(LANGUAGES[prevIndex])}
      </span>
      <span
        key={currentIndex}
        className={`position-absolute top-0 start-0 transition-opacity ${fading ? 'opacity-100' : 'opacity-0'} text-nowrap fm-transition`}
      >
        {children(LANGUAGES[currentIndex])}
      </span>
      &nbsp;
    </span>
  );
}
