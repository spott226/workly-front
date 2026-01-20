import BusinessPublicClient from './BusinessPublicClient';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BusinessPublicPage({ params }: PageProps) {
  const { slug } = await params;

  return <BusinessPublicClient slug={slug} />;
}
