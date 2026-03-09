import { redirect } from "next/navigation";

export default async function LegacyArticlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    redirect(`/texts/${id}`);
}
