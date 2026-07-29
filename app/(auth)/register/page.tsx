import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Creează-ți contul EduLink"
      subtitle="Alătură-te comunității educaționale din Moldova"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
