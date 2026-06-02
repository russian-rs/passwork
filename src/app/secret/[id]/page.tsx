import { SecretViewer } from "./SecretViewer";
import { Footer } from "@/components/Footer";
import { Globe, Send } from "lucide-react";

export default async function SecretPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-x-hidden bg-background p-4 md:p-8">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="flex-1 flex items-center justify-center w-full my-8">
        <SecretViewer id={resolvedParams.id} />
      </div>

      {/* Footer */}
      <Footer className="py-6 w-full mt-auto" />
    </div>
  );
}
