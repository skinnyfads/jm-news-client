import { TokenWord } from "@/components/TokenWord";
import { TokenProvider } from "@/components/TokenContext";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { analyzeText, fetchTextById } from "@/lib/api";

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
    language: string;
    tokens: Token[];
    createdAt?: string;
}

async function getArticle(id: string): Promise<Article | null> {
    try {
        const text = await fetchTextById(id);
        if (!text) {
            return null;
        }

        let tokens: Token[] = [];
        try {
            tokens = await analyzeText(text.language, text.text);
        } catch (error) {
            console.error("Failed to analyze text:", error);
        }

        return {
            id: String(text.id),
            content: text.text,
            language: text.language,
            tokens,
            createdAt: text.createdAt,
        };
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
                                {article.tokens.length > 0 ? (
                                    article.tokens.map((token, index) => (
                                        <TokenWord key={`${index}-${token.surface}`} token={token} index={`${index}`} />
                                    ))
                                ) : (
                                    <span>{article.content}</span>
                                )}
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
