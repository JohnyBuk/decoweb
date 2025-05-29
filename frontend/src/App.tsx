import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ApiTest from "./ApiTest";
import { DivePlanContextProvider } from "./context";
import Decoweb from "./Decoweb";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Decoweb />
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}
