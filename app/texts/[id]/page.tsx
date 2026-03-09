import { TokenWord } from "@/components/TokenWord";
import { TokenProvider } from "@/components/TokenContext";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyzeToken, normalizeAnalyzeTokens, fetchTextById } from "@/lib/api";

interface TextDetail {
    id: string;
    content: string;
    language: string;
    tokens: AnalyzeToken[];
    createdAt?: string;
}

function buildFallbackTokens(content: string, language: string): AnalyzeToken[] {
    const localeMap: Record<string, string> = {
        japanese: "ja",
        korean: "ko",
        chinese: "zh",
        english: "en",
    };
    const locale = localeMap[language.toLowerCase()] ?? "en";
    const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    const tokens: AnalyzeToken[] = [];

    for (const part of segmenter.segment(content)) {
        const surface = part.segment;
        tokens.push({
            surface,
            dictForm: null,
            reading: null,
            meanings: surface.trim().length > 0 ? ["No dictionary data returned for this token."] : [],
            pos: [],
            reason: null,
        });
    }

    return tokens;
}

async function getTextDetail(id: string): Promise<TextDetail | null> {
    try {
        const text = await fetchTextById(id);
        if (!text) {
            return null;
        }

        let tokens: AnalyzeToken[] = [];
        if (text.Tokens && text.Tokens.length > 0) {
            tokens = normalizeAnalyzeTokens(text.Tokens);
        }

        if (tokens.length === 0) {
            tokens = buildFallbackTokens(text.Text, text.Language);
        }

        return {
            id: String(text.ID),
            content: text.Text,
            language: text.Language,
            tokens,
            createdAt: text.CreatedAt,
        };
    } catch (error) {
        console.error("Failed to fetch text:", error);
        return null;
    }
}

export default async function TextPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const textDetail = await getTextDetail(id);

    if (!textDetail) {
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
                        ← Back to Texts
                    </Link>
                </div>
            </header>

            <main className="container mx-auto max-w-2xl px-4 py-8">
                <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 md:p-10">
                    <div className="prose prose-lg dark:prose-invert max-w-none leading-loose tracking-wide">
                        <div className="flex flex-wrap items-end content-start gap-y-2">
                            <TokenProvider>
                                {textDetail.tokens.map((token, index) => (
                                    <TokenWord key={`${index}-${token.surface}`} token={token} index={`${index}`} />
                                ))}
                            </TokenProvider>
                        </div>
                    </div>

                    {textDetail.createdAt && (
                        <div className="mt-10 pt-6 border-t text-sm text-muted-foreground">
                            Posted {formatDistanceToNow(new Date(textDetail.createdAt), { addSuffix: true })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
