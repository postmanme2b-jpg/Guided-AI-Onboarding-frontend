import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface AiRecommendationParams {
  endpoint: string;
  payload: Record<string, any>;
  enabled: boolean;
}

export function useAiRecommendations<T>({ endpoint, payload, enabled }: AiRecommendationParams) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only run if the hook is enabled and hasn't fetched yet.
      if (!enabled || hasFetched.current) return;

      hasFetched.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch AI recommendations from ${endpoint}.`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
        toast.error("AI Assistant Error", {
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [enabled, endpoint, payload]);

  // Function to allow parent component to reset the fetch status
  const reset = () => {
    hasFetched.current = false;
    setData(null);
  };

  return { data, isLoading, error, reset };
}
