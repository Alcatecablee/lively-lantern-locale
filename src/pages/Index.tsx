import { NeuroLint } from "@/components/NeuroLint";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <ErrorBoundary>
      <NeuroLint />
    </ErrorBoundary>
  );
};

export default Index;