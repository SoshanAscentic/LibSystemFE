import { DashboardDemo } from "@/components/DashboardDemo"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <>
      <DashboardDemo />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App