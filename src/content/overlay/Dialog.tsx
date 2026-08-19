import type { DialogState } from "../types";

export function Dialog({
  message,
  confirmText = "OK",
  cancelText = "Not now",
  onConfirm,
  onCancel,
}: DialogState) {
  return (
    <div
      className="
        fixed left-6 bottom-6
        z-[2147483647]
        w-80
        rounded-[10px]
        border border-gray-300
        bg-white
        p-4
        text-gray-900
        shadow-xl
        pointer-events-auto
      "
    >
      <div className="mb-4 text-base leading-relaxed">
        {message}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
              rounded-md
              cursor-pointer
              px-[18px] py-1.5
              text-sm text-gray-700
              hover:bg-gray-100
            "
          >
            {cancelText}
          </button>
        )}

        <button
          type="button"
          onClick={onConfirm}
          className="
            rounded-md
            bg-blue-600
            cursor-pointer
            px-[18px] py-1.5
            text-sm text-white
            hover:bg-blue-700
          "
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
