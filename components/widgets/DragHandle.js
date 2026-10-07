/**
 * The grip a section header offers for reordering its row (see SortableRow in pages/index.js).
 */

import { DragIndicator as DragIndicatorIcon } from "@mui/icons-material";
import HeaderIconButton from "./HeaderIconButton";

export default function DragHandle({ dragHandleProps }) {
  if (!dragHandleProps) return null;
  return (
    <HeaderIconButton
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
      aria-label="Drag to reorder"
      title="Drag to reorder"
      // touch-action: none, or the browser starts scrolling partway through a touch drag, which
      // cancels the pointer and snaps the section back (dnd-kit requires it on the drag handle).
      sx={{ cursor: "grab", touchAction: "none" }}
    >
      <DragIndicatorIcon />
    </HeaderIconButton>
  );
}
