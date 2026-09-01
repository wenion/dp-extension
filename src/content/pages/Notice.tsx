import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/Card";
import { Spinner } from "@/components/Spinner";

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
      className="w-80 min-h-[169px] border-2 border-gray-300"
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
