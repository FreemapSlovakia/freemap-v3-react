import { useEffect, useState } from 'react';
import z from 'zod';

const WinbackOfferSchema = z.object({
  eligible: z.boolean(),
  // Set only when eligible: when the user's premium access ran out.
  expiredAt: z.iso.datetime().nullable(),
});

type WinbackOffer = { expiredAt: string };

/**
 * Personal offer for a lapsed one-time buyer to return at the original yearly
 * price. Eligibility is decided by the backend (which also re-checks it when
 * the checkout is created); `undefined` means unknown or not eligible.
 */
export function useWinbackOffer(
  authToken: string | undefined,
): WinbackOffer | undefined {
  const [offer, setOffer] = useState<WinbackOffer>();

  useEffect(() => {
    setOffer(undefined);

    if (!authToken) {
      return;
    }

    const ac = new AbortController();

    (async () => {
      const res = await fetch(
        `${process.env['API_URL']}/auth/premium/winback`,
        {
          signal: ac.signal,
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`winback offer lookup failed: ${res.status}`);
      }

      const { eligible, expiredAt } = WinbackOfferSchema.parse(
        await res.json(),
      );

      if (eligible && expiredAt) {
        setOffer({ expiredAt });
      }
    })().catch((err) => {
      if (!ac.signal.aborted) {
        console.error(err);
      }
    });

    return () => {
      ac.abort();
    };
  }, [authToken]);

  return offer;
}
