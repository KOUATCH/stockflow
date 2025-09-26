// app/hooks/use-customers.ts
// import { getCustomerById, getCustomers, toggleCustomerStatus } from '@/actions/customers/customerActions';
import { getCustomersAction } from '@/actions/customers/customerActions';
import { getCustomerById, toggleCustomerStatus } from '@/actions/customers/customerActionsFinal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCustomers(organizationId: string, query: string = '', page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['customers', organizationId],
    queryFn: () => getCustomersAction(),
    enabled: !!organizationId,
  });
}

export function useCustomer(organizationId: string, customerId: string) {
  return useQuery({
    queryKey: ['customer', organizationId, customerId],
    queryFn: () => getCustomerById(customerId, organizationId),
    enabled: !!customerId,
  });
}

export function useToggleCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, organizationId, isActive }: { id: string; organizationId: string; isActive: boolean }) =>
      toggleCustomerStatus(id, organizationId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}