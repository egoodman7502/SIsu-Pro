import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold text-blue-700">Sisu Pro</h1>
          <p className="text-xl text-gray-600">
            AI-Powered Resume Builder. ATS-Optimized. Job-Ready. Built for Your Career Leap.
          </p>
          <Button className="mt-4" size="lg" onClick={() => router.push('/builder')}>
            Start Building Your Resume
          </Button>
        </header>
      </div>
    </div>
  );
}