import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCreditCardConfig, setCreditCardConfig } from '@/services/creditCardConfig';
import type { CreditCardConfig } from '@/types/finance';

export const CREDIT_CARD_CONFIG_QUERY_KEY = ['creditCardConfig'] as const;

export function useCreditCardConfig() {
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: CREDIT_CARD_CONFIG_QUERY_KEY,
    queryFn: getCreditCardConfig,
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreditCardConfig) => setCreditCardConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDIT_CARD_CONFIG_QUERY_KEY });
    },
  });

  return {
    config: config ?? null,
    isLoading,
    error,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
