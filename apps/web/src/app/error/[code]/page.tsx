import { notFound } from 'next/navigation';
import ErrorPage, { ERROR_CONFIGS } from '@/components/errors/ErrorPage';

export function generateStaticParams() {
  return Object.keys(ERROR_CONFIGS).map((code) => ({
    code: code,
  }));
}

export function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return params.then(({ code }) => {
    const errorCode = parseInt(code, 10);
    const config = ERROR_CONFIGS[errorCode];

    if (!config) {
      return { title: 'Error | Gemsutopia' };
    }

    return {
      title: `${config.code} - ${config.title} | Gemsutopia`,
      description: config.description,
    };
  });
}

export default async function ErrorCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const errorCode = parseInt(code, 10);

  if (!ERROR_CONFIGS[errorCode]) {
    notFound();
  }

  return <ErrorPage code={errorCode} />;
}
