import {
  Card,
  CardHeader,
  CardBody
} from "@/components/Card";
import { Spinner } from "@/components/Spinner";


export function Uploading() {
  return (
    <div className="flex gap-4 items-center">
      <Card className="p-2 border-2 border-gray-300">
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