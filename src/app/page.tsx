import { Suspense } from "react";
import { HomeScreen } from "@/components/home/HomeScreen";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
