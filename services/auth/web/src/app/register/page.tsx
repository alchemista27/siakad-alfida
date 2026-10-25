import { PublicAuthLayout } from "../../components/public-auth-layout";
import { RegisterParentForm } from "../../components/register-parent-form";
import { getFoundationBranding } from "../../lib/foundation-settings";

export default async function RegisterParentPage() {
  const branding = await getFoundationBranding();

  return (
    <PublicAuthLayout
      branding={branding}
      fallbackIcon="family_restroom"
      subtitle="Pendaftaran Akun Terpadu Orang Tua & Wali Santri Yayasan Alfida"
    >
      <RegisterParentForm />
    </PublicAuthLayout>
  );
}
