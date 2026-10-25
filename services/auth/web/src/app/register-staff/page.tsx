import { PublicAuthLayout } from "../../components/public-auth-layout";
import { RegisterStaffForm } from "../../components/register-staff-form";
import { getFoundationBranding } from "../../lib/foundation-settings";

export default async function RegisterStaffPage() {
  const branding = await getFoundationBranding();

  return (
    <PublicAuthLayout
      branding={branding}
      fallbackIcon="badge"
      subtitle="Pendaftaran Tenaga Pendidik & Tenaga Kependidikan Yayasan Alfida"
    >
      <RegisterStaffForm />
    </PublicAuthLayout>
  );
}
