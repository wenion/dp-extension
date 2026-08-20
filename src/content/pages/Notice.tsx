import {
  Card,
  CardBody,
  CardHeader,
} from "@heroui/card";
import { Spinner } from "@heroui/spinner";

type Props = {
  message?: string;
  loading?: boolean;
};

export function Notice({
  message,
  loading = false,
}: Props) {
  return (
    <Card
      className="w-80 min-h-[169px] border-default border-medium"
      shadow="none"
    >
      {loading && (
        <CardHeader className="flex justify-center py-2">
          <Spinner />
        </CardHeader>
      )}

      <CardBody className="flex items-center justify-center px-4 py-4">
        <p className="text-center text-lg font-medium">
          {message}
        </p>
      </CardBody>
    </Card>
  );
}
