import { ImageResponse } from 'next/og';

// No edge runtime: OpenNext/Cloudflare requires edge routes in a separate bundle
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          borderRadius: 6,
          fontSize: 18,
        }}
      >
        ⚔️
      </div>
    ),
    { ...size }
  );
}
