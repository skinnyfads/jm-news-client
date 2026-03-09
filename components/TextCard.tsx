import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import MarkdownIt from "markdown-it";
import { Card, CardContent } from "@/components/ui/card";

const md = new MarkdownIt({
    breaks: true,
    linkify: true,
});

interface TextPreview {
    id: string;
    previewText: string;
    createdAt: string;
    language: string;
}

interface TextCardProps {
    textItem: TextPreview;
}

export function TextCard({ textItem }: TextCardProps) {
    const renderedContent = md.render(textItem.previewText);

    return (
        <Link href={`/texts/${textItem.id}`} className="block group">
            <Card className="transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                            {textItem.language}
                        </span>
                    </div>
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none break-words line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                    <p className="mt-3 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
                        {formatDistanceToNow(new Date(textItem.createdAt), { addSuffix: true })}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
