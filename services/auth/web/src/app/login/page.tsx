import LoginForm from "../../components/login-form";
import { PublicAuthLayout } from "../../components/public-auth-layout";
import { getFoundationBranding } from "../../lib/foundation-settings";

export default async function LoginPage() {
  const branding = await getFoundationBranding();

  return (
    <PublicAuthLayout branding={branding}>
      <LoginForm />
    </PublicAuthLayout>
  );
}
