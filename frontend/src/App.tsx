import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Decoweb from "./Decoweb";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Decoweb />
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}
