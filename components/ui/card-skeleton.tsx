import { Card, CardContent } from "./card"

export function CardSkeleton() {
    return (
        <Card className="w-full transition-all">
            <CardContent className="pt-6">
                <div className="flex flex-col gap-3">
                    <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
                    <div className="h-4 w-[90%] animate-pulse rounded bg-muted/50" />
                    <div className="h-4 w-[95%] animate-pulse rounded bg-muted/50" />
                    <div className="mt-3 h-3 w-24 animate-pulse rounded bg-muted/50" />
                </div>
            </CardContent>
        </Card>
    )
}
