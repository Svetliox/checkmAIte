import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

const features = [
  {
    title: 'Real-time Analysis',
    description:
      'Get instant feedback on every move with Stockfish-powered analysis. See the best moves and understand why they matter.',
    icon: AnalysisIcon,
    gradient: 'from-accent-primary to-purple-400',
  },
  {
    title: 'Dynamic Statistics',
    description:
      'Track your accuracy, identify patterns, and monitor your improvement over time with comprehensive game statistics.',
    icon: StatsIcon,
    gradient: 'from-accent-secondary to-blue-400',
  },
  {
    title: 'Play Both Sides',
    description:
      'Explore variations by playing as white or black. Test different strategies and see how the evaluation changes.',
    icon: SwitchIcon,
    gradient: 'from-accent-success to-emerald-400',
  },
  {
    title: 'Learn & Improve',
    description:
      'Understand your mistakes with detailed explanations. Learn opening theory, tactics, and endgame techniques.',
    icon: LearnIcon,
    gradient: 'from-accent-warning to-yellow-400',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-surface-1">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
              {' '}
              Master Chess
            </span>
          </h2>
          <p className="mt-4 text-lg text-foreground/70">
            Powerful tools designed to help you analyze, learn, and improve your
            chess game at any level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              variant="bordered"
              className="group hover:border-accent-primary/50 transition-colors"
            >
              <CardHeader>
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded transition-all duration-500" />
              </CardContent>
            </Card>
          ))}
        </div>

      </Container>
    </section>
  );
}

// Icon components
function AnalysisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function StatsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function SwitchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function LearnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}
