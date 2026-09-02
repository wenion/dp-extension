import { useAppContext } from "../context/context";

import { Idle } from "../pages/Idle";
import { Notice } from "../pages/Notice";
import { Collapsed } from "../pages/Collapsed";
import { Expanded } from "../pages/Expanded";
import { EndConfirmation } from "../pages/EndConfirmation";
import { ExitConfirmation } from "../pages/ExitConfirmation";
import { Uploading } from "../pages/Uploading";
import { UploadCompleted } from "../pages/UploadCompleted";
import { UploadFailed } from "../pages/UploadFailed";

import { Dialog } from "./Dialog";
import { Draggable } from "./Draggable";

export default function App() {
  const {
    notice,
    page,
    dialog,
  } = useAppContext();

  const renderPage = () => {
    switch (page) {
      case "idle":
        return <Idle />;

      case "notice":
        return <Notice message={notice} />;

      case "collapsed":
        return <Collapsed />;

      case "expanded":
        return <Expanded />;

      case "end":
        return <EndConfirmation />;

      case "exit":
        return <ExitConfirmation />;

      case "uploading":
        return <Uploading />;

      case "uploaded":
        return <UploadCompleted />;

      case "failed":
        return <UploadFailed />;
    }
  };

  return (
    <>
      <Draggable>
        {renderPage()}
      </Draggable>

      {dialog && (
        <Dialog {...dialog} />
      )}
    </>
  );
}