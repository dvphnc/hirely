
import { APP_VERSION } from "@/lib/version";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Hirely</h1>
        <p className="text-xl text-gray-600 mb-6">HR Management System</p>
        <p className="text-sm text-gray-500">Version {APP_VERSION}</p>
      </div>
    </div>
  );
};

export default Index;
