import { DivePlanContextProvider } from "./context";
import Decoweb from "./Decoweb";

export default function App() {
  return <DivePlanContextProvider child={<Decoweb />} />;
}
