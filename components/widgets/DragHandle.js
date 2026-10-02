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
      sx={{ cursor: "grab" }}
    >
      <DragIndicatorIcon />
    </HeaderIconButton>
  );
}
