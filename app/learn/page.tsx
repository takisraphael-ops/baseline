import LearnBrowser from '@/components/learn-browser';

// Stays a server component so the metadata export survives; the interactive
// half lives in LearnBrowser.
export const metadata = { title: 'Learn · Baseline' };

export default function LearnPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="muted text-sm mt-1">
          Every idea the programme runs on, in plain English, with the reasoning rather than the rule.
        </p>
      </header>

      <LearnBrowser />
    </div>
  );
}
