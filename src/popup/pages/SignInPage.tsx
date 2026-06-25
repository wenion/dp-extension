import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

import { env } from "@/config/env";

import MainLayout from "../components/layout/MainLayout";
import { useAppContext } from "../components/context";

export default function SignInPage() {
  const { profile } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      profile &&
      typeof profile.email === "string" &&
      typeof profile.full_name === "string" &&
      typeof profile.avatar_url === "string" &&
      typeof profile.updated_at === "string"
    ) {
      navigate("/");
    }
  }, [profile]);

  const onSignInClick = async () => {
    const base = env.apiUrl;

    const url = new URL("/login", base);

    url.searchParams.set("from", "extension");
    url.searchParams.set("ext", chrome.runtime.id);

    chrome.tabs.create({ url: url.href });
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 px-8 py-4">
        <p className="text-sm text-gray-600">
          Your session has expired. Please sign in again to continue.
        </p>
        <Button color="primary" size="sm" onPress={onSignInClick}>
          Sign in
        </Button>
      </div>
    </MainLayout>
  );
}
