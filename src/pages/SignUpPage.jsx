import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
