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
      // The app's accent. This was the indigo the project template shipped
      // with, which is not a colour that appears anywhere in the app.
      theme_color: '#0a7683',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json' } },
  );
}
