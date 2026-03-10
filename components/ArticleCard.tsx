import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import MarkdownIt from "markdown-it";
import { Card, CardContent } from "@/components/ui/card";

const md = new MarkdownIt({
    breaks: true,
    linkify: true,
});

interface ArticlePreview {
    id: string;
    previewText: string;
    createdAt: string;
}

interface ArticleCardProps {
    article: ArticlePreview;
}

export function ArticleCard({ article }: ArticleCardProps) {
    const renderedContent = md.render(article.previewText);

    return (
        <Link href={`/articles/${article.id}`} className="block group">
            <Card className="transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="pt-6">
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none break-words line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                    <p className="mt-3 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
