"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { CardSkeleton } from "@/components/ui/card-skeleton";
import { fetchTexts } from "@/lib/api";

interface ArticlePreview {
  id: string;
  previewText: string;
  createdAt: string;
}

export default function Home() {
  const pageSize = 20;
  const [items, setItems] = useState<ArticlePreview[]>([]);
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await fetchTexts(pageNum, pageSize);
      const mappedItems: ArticlePreview[] = data.texts.map((text) => ({
        id: String(text.id),
        previewText: text.text,
        createdAt: text.createdAt,
      }));

      setItems((prev) => {
        const newItems = mappedItems.filter(
          (item) => !prev.some((p) => p.id === item.id)
        );
        return [...prev, ...newItems];
      });

      setHasMore(pageNum * data.pagination.limit < data.pagination.total);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingRef.current) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchFeed(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, fetchFeed]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">JM-News</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <ArticleCard key={item.id} article={item} />
          ))}

          {loading && (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}

          {!hasMore && items.length > 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No more texts to load.
            </p>
          )}

          <div ref={loaderRef} className="h-4 w-full" />
        </div>
      </main>
    </div>
  );
}
