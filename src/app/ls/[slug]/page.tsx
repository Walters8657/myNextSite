export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>The short link mwdev.work/li/{slug} is not a valid short link.</div>
}