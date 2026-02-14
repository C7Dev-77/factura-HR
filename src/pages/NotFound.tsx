import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Ruta no encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(35,30%,95%)] p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <FileQuestion className="w-10 h-10 text-primary" />
        </div>
        <h1 className="mb-2 text-5xl font-bold text-foreground" style={{ fontFamily: "'Georgia', serif" }}>
          404
        </h1>
        <p className="mb-6 text-lg text-muted-foreground">
          La página que buscas no existe.
        </p>
        <Link to="/dashboard">
          <Button className="rounded-xl px-6">
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
