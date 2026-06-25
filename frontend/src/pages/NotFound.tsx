import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-6">
      <div className="w-full max-w-xl rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Đường dẫn bạn vừa mở không tồn tại hoặc đã được thay đổi.
        </p>

        <div className="mt-6 flex items-center justify-center">
          <Link to="/dashboard">
            <Button className="rounded-2xl">
              <Home className="mr-2 h-4 w-4" />
              Về trang chính
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
