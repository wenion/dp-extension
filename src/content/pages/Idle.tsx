import { Button } from '@heroui/button';
import { TriangleRightFill } from '@gravity-ui/icons';

import { startSession } from "../message/backgroundClient";
import { useAppContext } from "../context/context";


export function Idle() {
  const { showNotice } = useAppContext();

  const handleStartSession = async () => {
    try {
      await startSession();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      showNotice(
        `${error.message} Please reload the page.`,
      );
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Button
        className="border-default border-medium"
        color="default"
        variant="bordered"
        startContent={<TriangleRightFill />}
        onPress={handleStartSession}
      >
        Start session
      </Button>
    </div>
  );
}
