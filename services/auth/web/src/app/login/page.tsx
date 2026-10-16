import { FoundationBrand } from "../../components/foundation-brand";
import LoginForm from "../../components/login-form";
import { getFoundationBranding } from "../../lib/foundation-settings";

export default async function LoginPage() {
  const branding = await getFoundationBranding();

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full font-body">
      <div className="w-full md:w-[40%] bg-gradient-to-br from-[#0f7f6d] to-[#06bfa2] text-white flex flex-col justify-center items-center p-8 md:p-14 text-center shadow-inner">
        <FoundationBrand branding={branding} />
      </div>
      <div className="w-full md:w-[60%] bg-white flex items-center justify-center p-6 md:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
