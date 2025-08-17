import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <SignIn  path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
