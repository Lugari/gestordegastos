import { useQuery } from "@tanstack/react-query";
import { fetchUserData, fetchTransactionSummary, fetchBudgets, fetchSavings } from "../api/api";

export const useHomeData = (userId) => {
  const { data: users, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUserData(userId),
  });

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ["transactionSummary", userId],
    queryFn: () => fetchTransactionSummary(userId),
  });

  const { data: budgets, isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ["budgets", userId],
    queryFn: () => fetchBudgets(userId),
  });

  const { data: savings, isLoading: savingsLoading, error: savingsError } = useQuery({
    queryKey: ["savings", userId],
    queryFn: () => fetchSavings(userId),
  });

  return {
    users,
    summary,
    budgets,
    savings,
    loading: userLoading || summaryLoading || budgetsLoading || savingsLoading,
    error: userError || summaryError || budgetsError || savingsError,
  };
};
