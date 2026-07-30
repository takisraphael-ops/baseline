export const dynamic = 'force-static';

export function GET() {
  return new Response(
    JSON.stringify({
      name: 'Baseline',
      short_name: 'Baseline',
      description: 'A twelve-week strength and cardio plan that runs itself.',
      start_url: '/',
      display: 'standalone',
      background_color: '#FAFAF9',
      theme_color: '#4F46E5',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json' } },
  );
}
