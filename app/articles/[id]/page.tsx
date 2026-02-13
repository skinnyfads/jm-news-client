import { TokenWord } from "@/components/TokenWord";
import { TokenProvider } from "@/components/TokenContext";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Token {
    surface: string;
    dictForm: string | null;
    reading: string | null;
    meanings: string[];
    pos: string[];
    reason: string | null;
}

interface Article {
    id: string;
    content: string;
    tokens: Token[];
    createdAt?: string;
}

async function getArticle(id: string): Promise<Article | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}`, {
            cache: "no-store",
        });

        if (!res.ok) {
            return null;
        }

        return res.json();
    } catch (error) {
        console.error("Failed to fetch article:", error);
        return null;
    }
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 flex items-center gap-4">
                    <Link
                        href="/"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to Feed
                    </Link>
                </div>
            </header>

            <main className="container mx-auto max-w-2xl px-4 py-8">
                <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 md:p-10">
                    <div className="prose prose-lg dark:prose-invert max-w-none leading-loose tracking-wide">
                        <div className="flex flex-wrap items-end content-start gap-y-2">
                            <TokenProvider>
                                {article.tokens.map((token, index) => (
                                    <TokenWord key={`${index}-${token.surface}`} token={token} index={`${index}`} />
                                ))}
                            </TokenProvider>
                        </div>
                    </div>

                    {article.createdAt && (
                        <div className="mt-10 pt-6 border-t text-sm text-muted-foreground">
                            Posted {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
