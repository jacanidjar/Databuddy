// "use client"

// import type { TRPCClientErrorBase } from '@trpc/react-query';
// import { createTRPCReact } from '@trpc/react-query';
// import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
// import type { ExternalToast } from 'sonner';
// import { toast } from 'sonner';

// // Only import the router type
// import type { AppRouter } from '@databuddy/trpc';

// export const api = createTRPCReact<AppRouter>();

// export function handleError(error: TRPCClientErrorBase<any>) {
//   toast('Error', {
//     description: error.message,
//   });
// }

// export function handleErrorToastOptions(options: ExternalToast) {
//   return (error: TRPCClientErrorBase<any>) => {
//     toast('Error', {
//       description: error.message,
//       ...options,
//     });
//   };
// }