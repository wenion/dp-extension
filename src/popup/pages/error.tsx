import { useNavigate } from "react-router-dom";

import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";

import { useAppContext } from "../components/context";

export default function ErrorPage() {
  const { error } = useAppContext();
  const navigate = useNavigate();

  const onExit = () => {
    // backwards history
    navigate(-1);
  };

  const onResetClick = async () => {
    await chrome.storage.local.clear();
    navigate(-1);
  };

  return (
    <main className="w-80 bg-white shadow-sm ring-1 ring-black/5">
      {error && (
        <Card>
          <CardHeader className="text-lg">Error</CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600">{error}</p>
          </CardBody>
          <CardFooter className="flex px-12 py-4 justify-between">
            <Button color="danger" size="sm" onPress={onResetClick}>
              Reset
            </Button>
            <Button color="primary" size="sm" onPress={onExit}>
              Close
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}
