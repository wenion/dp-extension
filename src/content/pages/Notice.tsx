import { Card, CardHeader, CardBody } from "@heroui/card";
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
    <div className="flex gap-4 items-center">
      <Card className='p-2 border-default border-medium'>
        {loading && (
          <CardHeader className="flex gap-x-4 justify-center">
            <Spinner />
          </CardHeader>
        )}

        <CardBody className="items-center">
          <p className="text-center font-medium">
            {message}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
