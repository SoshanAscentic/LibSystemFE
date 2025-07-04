import { Demo } from "@/components/Demo"
import { Toaster } from "@/components/ui/sonner"
import { AuthDemo } from "./components/AuthDemo"

function App() {
  return (
    <>
      <AuthDemo />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App