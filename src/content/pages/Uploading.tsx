import { Spinner } from "@heroui/spinner";
import { Card, CardHeader, CardBody } from "@heroui/card";


export function Uploading() {
  return (
    <div className="flex gap-4 items-center">
      <Card className='p-2 border-default border-medium'>
        <CardHeader className="flex gap-x-4 justify-center">
          <Spinner />
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-center justify-center">
            <p className="font-bold">Uploading session...</p>
            <span className="text-sm">Pushing events to the database.</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}