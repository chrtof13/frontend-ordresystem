import { Suspense } from "react";
import RegisterInviteClient from "./register-invite-client";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <RegisterInviteClient />
    </Suspense>
  );
}
