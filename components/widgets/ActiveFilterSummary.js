/**
 * Spells out how the Browse page's active filters combine, so the result count can't be misread:
 * different filter groups must all match (AND), and several values picked within one group are
 * alternatives (OR). Solver Type and Solver Complexity describe the same solver, so when both are
 * set they form one group that a single solver has to satisfy (see solverFiltersMatch in
 * useProblemFilters.js).
 *
 * `groups` is a list of `{ key, parts }`, where `parts` is a list of `{ label, values }` joined by
 * "and" inside the group (only the combined solver group has more than one part), and `values`
 * are joined by "or".
 */

import { Box, Chip, Typography } from "@mui/material";
import { Fragment } from "react";
import { useThemeMode } from "../ThemeModeContext";
import { surfaceColors, textColors } from "../theme";

function Joiner({ children, color }) {
  return (
    <Typography component="span" sx={{ color, fontSize: "0.78rem", fontStyle: "italic", mx: 0.5 }}>
      {children}
    </Typography>
  );
}

export default function ActiveFilterSummary({ count, groups }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);
  const noun = `problem${count === 1 ? "" : "s"}`;

  if (groups.length === 0) {
    return (
      <Typography sx={{ color: text.caption, fontSize: "0.82rem", mb: 1.5 }}>
        {count} {noun}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 1.5 }} aria-live="polite">
      <Typography sx={{ color: text.caption, fontSize: "0.82rem", mb: 0.75 }}>
        {count} {noun} {groups.length === 1 ? "matching" : "matching all of these"}:
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 0.5 }}>
        {groups.map((group, groupIndex) => (
          <Box component="li" key={group.key}>
            {groupIndex > 0 && (
              <Typography
                component="span"
                sx={{
                  display: "inline-block",
                  color: "#F47C20",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  mr: 1,
                }}
              >
                AND
              </Typography>
            )}
            {group.parts.map((part, partIndex) => (
              <Fragment key={part.label}>
                {partIndex > 0 && <Joiner color={text.caption}>and</Joiner>}
                <Typography
                  component="span"
                  sx={{ color: text.body, fontSize: "0.8rem", fontWeight: 600, mr: 0.75 }}
                >
                  {part.label}
                </Typography>
                {part.values.map((value, valueIndex) => (
                  <Fragment key={value}>
                    {valueIndex > 0 && <Joiner color={text.caption}>or</Joiner>}
                    <Chip
                      label={value}
                      size="small"
                      sx={{
                        fontSize: "0.72rem",
                        height: 22,
                        color: text.body,
                        background: surface.surfaceAlt,
                        border: `1px solid ${surface.border}`,
                      }}
                    />
                  </Fragment>
                ))}
              </Fragment>
            ))}
            {group.note && <Joiner color={text.caption}>{group.note}</Joiner>}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
