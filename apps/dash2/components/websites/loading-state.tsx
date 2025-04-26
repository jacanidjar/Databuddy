import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  // Create a fixed array of unique IDs for the loading cards
  const loadingCardIds = ['loading-card-1', 'loading-card-2', 'loading-card-3'];
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {loadingCardIds.map((id) => (
        <Card key={id} className="relative overflow-hidden border-border/60 shadow-sm card-hover-effect">
          <CardHeader className="gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 