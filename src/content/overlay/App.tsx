import { useAppContext } from "../context/context";
import { Alert } from "../pages/Alert";
import { Collapsed } from "../pages/Collapsed";
import { Confirm } from "../pages/Confirm";
import { Expanded } from "../pages/Expanded";
import { Idle } from "../pages/Idle";
import { Uploaded } from "../pages/Uploaded";
import { UploadFailed } from "../pages/UploadFailed";
import { Uploading } from "../pages/Uploading";


export default function App() {
  const { page } = useAppContext();

  switch (page) {
    case "expanded":
      return <Expanded/>
    case "collapsed":
      return <Collapsed/>
    case "confirm":
      return <Confirm/>
    case "uploading":
      return <Uploading/>
    case "uploaded":
      return <Uploaded/>
    case "uploadFailed":
      return <UploadFailed/>
    case "alert":
      return <Alert/>
    default:
      return <Idle/>
  }
}