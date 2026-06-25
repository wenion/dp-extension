import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";

import { useAppContext } from "../components/context";
import MainLayout from "../components/layout/MainLayout";


export default function IndexPage() {
  const { profile, permissionGranted, captureOn, setCaptureOn } =
    useAppContext();
  const navigate = useNavigate();

  const notice = "Welcome";
  const title = "Site access required";
  const description = "Writing tracking is currently disabled.";

  useEffect(() => {
    if (!profile) {
      navigate("/sign-in");
    }
  }, [profile]);

  const userName = useMemo(() => {
    return profile?.full_name || null;
  }, [profile]);

  const avatarUrl = useMemo(() => {
    return profile?.avatar_url || null;
  }, [profile]);

  const onGrant = () => {
    navigate("/site-access-prompt");
  };

  return (
    <MainLayout>
      {permissionGranted ? (
        <>
          <div className="flex gap-4 px-8 py-4 items-center">
            <div className="h-8 w-8">
              {avatarUrl && (
                <img
                  alt={userName || "User"}
                  className="object-cover rounded-full"
                  src={avatarUrl}
                />
              )}
            </div>
            <p className="text-lg font-medium text-slate-600 text-center">
              {notice}, {userName}!
            </p>
          </div>
          <div className="flex px-8 pt-2 pb-6">
            <Switch
              color="success"
              isSelected={!!captureOn}
              size="sm"
              onValueChange={setCaptureOn}
            >
              {captureOn
                ? "Interaction tracking active"
                : "Interaction tracking paused"}
            </Switch>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2 px-8 py-4 items-center border border-slate-200 rounded-md">
          <Alert description={description} title={title} />
          <div className="flex justify-center">
            <Button
              className="text-sm text-amber-700 underline underline-offset-2 hover:text-amber-900 bg-transparent cursor-pointer"
              onPress={onGrant}
            >
              Grant site access to start tracking
            </Button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
