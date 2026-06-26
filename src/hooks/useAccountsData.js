import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import * as AccountService from '../services/accountService';

export const useGetAccounts = () =>
  useQuery({ queryKey: ['accounts'], queryFn: AccountService.getAllAccounts });

export const useManageAccounts = () => {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ['accounts'] });

  const addMutation = useMutation({ mutationFn: (data) => AccountService.addAccount(data), onSuccess });
  const deleteMutation = useMutation({ mutationFn: (id) => AccountService.deleteAccountById(id), onSuccess });
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => AccountService.updateAccountById(id, updates),
    onSuccess,
  });

  return {
    addAccount: addMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    isAdding: addMutation.isPending,
  };
};
