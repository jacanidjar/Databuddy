"use client";

import type { Funnel } from "@/hooks/use-funnels";
import { EmptyState } from "./empty-state";
import { GoalCard } from "./goal-card";

interface GoalAnalytics {
  goalId: string;
  conversionRate: number;
  totalUsers: number;
  completions: number;
}

interface GoalsListProps {
  goals: Funnel[];
  isLoading: boolean;
  onEditGoal: (goal: Funnel) => void;
  onDeleteGoal: (goalId: string) => void;
  onCreateGoal: () => void;
  goalAnalytics?: GoalAnalytics[];
  analyticsLoading?: boolean;
}

export function GoalsList({
  goals,
  isLoading,
  onEditGoal,
  onDeleteGoal,
  onCreateGoal,
  goalAnalytics = [],
  analyticsLoading = false,
}: GoalsListProps) {
  if (isLoading) {
    return null; // Skeleton is handled by parent
  }

  if (goals.length === 0) {
    return <EmptyState onCreateGoal={onCreateGoal} />;
  }

  const getAnalyticsForGoal = (goalId: string) => {
    return goalAnalytics.find((analytics) => analytics.goalId === goalId);
  };

  return (
    <div className="space-y-3">
      {goals.map((goal) => {
        const analytics = getAnalyticsForGoal(goal.id);

        return (
          <GoalCard
            completions={analytics?.completions || 0}
            conversionRate={analytics?.conversionRate || 0}
            goal={goal}
            isLoading={analyticsLoading}
            key={goal.id}
            onDelete={() => onDeleteGoal(goal.id)}
            onEdit={() => onEditGoal(goal)}
            totalUsers={analytics?.totalUsers || 0}
          />
        );
      })}
    </div>
  );
}
