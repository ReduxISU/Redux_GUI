import React, { useState } from "react";
import { Autocomplete, TextField, Paper, Divider, Button, Chip, createFilterOptions } from "@mui/material";

export default function SearchBarExtensible({
  selected,
  onSelect,
  placeholder,
  options,
  optionsMap,
  optionsHighlight = null,
  optionsDisabled = null,
  disabledOptionHint = "",
  disabled = false,
  disabledMessage = "",
  extenderButtons = [],
  // Optional sort key: (key) => group value, e.g. a problem's complexity class.
  // Options are sorted by this first (falling back to optionsHighlight/alphabetical
  // within a group), but -- unlike MUI Autocomplete's own `groupBy` -- this never
  // renders section headers, just a stable sort order.
  groupBy = null,
  // Optional explicit ordering for groupBy's values (e.g. ["P", "NPComplete", ...]).
  // Falls back to alphabetical when omitted.
  groupOrder = null,
  // Optional per-option tag rendered as a small Chip on the right side of each
  // dropdown row, e.g. a problem's complexity class. (key) => tag text, or null/
  // undefined to omit the chip for that option.
  optionTag = null,
  // Optional extra searchable text per option, appended to the option's label when
  // matching the user's input (e.g. a problem's complexity class/solver types) so
  // search isn't limited to the display name alone. (key) => string.
  optionSearchText = null,
  ...props
}) {
  const [input, setInput] = useState("");

  return (
    <Autocomplete
      {...props}
      slots={{
        paper: ({ children }) => (
          <SearchBarPaper input={input} optionsMap={optionsMap} extenderButtons={extenderButtons}>
            {children}
          </SearchBarPaper>
        ),
      }}
      onInputChange={(event, value) => {
        setInput(value ?? "");
      }}
      value={disabled ? disabledMessage : optionsMap.get(selected) ?? ""}
      onChange={(event, value) => {
        value = getKeyByValue(optionsMap, value) ?? "";
        if (value === "" || options.includes(value)) {
          onSelect(value);
        }
      }}
      options={Array.isArray(options)
        ? [...options]
          .sort((a, b) => sortOptions(a, b, { groupBy, groupOrder, optionsHighlight }))
          .map((x) => optionsMap.get(x) ?? x)
        : []}
      filterOptions={
        optionSearchText
          ? createFilterOptions({
            stringify: (option) => {
              const key = getKeyByValue(optionsMap, option);
              const extra = key != null ? optionSearchText(key) : null;
              return extra ? `${option} ${extra}` : option;
            },
          })
          : undefined
      }
      getOptionDisabled={
        optionsDisabled
          ? (option) => optionsDisabled.includes(getKeyByValue(optionsMap, option))
          : undefined
      }
      disabled={disabled}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      sx={{ width: 300 }}
      style={{ width: "100%" }}
      freeSolo
      renderInput={({ slotProps: acSlots, ...params }) => (
        <TextField
          {...params}
          label={placeholder}
          slotProps={{
            ...acSlots,
            input: {
              ...acSlots?.input,
              ...(disabled ? { style: { fontSize: 12 } } : {}),
            },
          }}
        />
      )}
      // Renders de-emphasized (optionsHighlight, still clickable -- ReduceToRowReact's
      // rank-and-de-emphasize usage), disabled (optionsDisabled, not clickable, e.g.
      // "no renderer available"), and/or tagged (optionTag, e.g. a problem's
      // complexity class shown as a Chip) options.
      renderOption={
        optionsHighlight || optionsDisabled || optionTag
          ? (props, option) => {
            const key = getKeyByValue(optionsMap, option);
            const isDeemphasized = optionsHighlight ? !optionsHighlight.includes(key) : false;
            const isDisabledOption = optionsDisabled ? optionsDisabled.includes(key) : false;
            const tag = optionTag && key != null ? optionTag(key) : null;
            return (
              <li
                {...props}
                style={{
                  ...(isDeemphasized ? { opacity: 0.5 } : null),
                  ...(tag ? { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } : null),
                }}
              >
                <span>
                  {option}
                  {isDisabledOption && disabledOptionHint ? ` (${disabledOptionHint})` : ""}
                </span>
                {tag ? (
                  <Chip
                    label={tag}
                    size="small"
                    sx={{
                      color: "#c2410c",
                      background: "rgba(244,124,32,0.12)",
                      border: "1px solid rgba(244,124,32,0.35)",
                      fontSize: "0.72rem",
                    }}
                  />
                ) : null}
              </li>
            );
          }
          : null
      }
    />
  );
}

/// Gives greater precedence to options contained in the `highlights` arrays.
function sortHighlights(a, b, highlights) {
  return -(highlights.indexOf(a) - highlights.indexOf(b));
}

/// Primary sort by group label (if `groupBy` is given -- required by MUI Autocomplete
/// so same-group options end up contiguous), then falls back to the existing
/// highlight-based sort, then alphabetical on the raw key.
function sortOptions(a, b, { groupBy, groupOrder, optionsHighlight }) {
  if (groupBy) {
    const groupA = groupBy(a) ?? "Unclassified";
    const groupB = groupBy(b) ?? "Unclassified";
    if (groupA !== groupB) {
      return groupOrder
        ? groupOrder.indexOf(groupA) - groupOrder.indexOf(groupB)
        : groupA.localeCompare(groupB);
    }
  }
  if (optionsHighlight) {
    return sortHighlights(a, b, optionsHighlight);
  }
  return String(a).localeCompare(String(b));
}

function SearchBarPaper({ children, input, optionsMap, extenderButtons }) {
  return (
    <Paper
      sx={{
        // A page theme can set background.paper to an intentionally near-transparent
        // "glass" value for its own backdrop-blurred cards (e.g. /browse's
        // rgba(255,255,255,0.04)) -- Paper inherits that token by default, which
        // makes this floating, unblurred dropdown unreadable against whatever
        // scrolls underneath it. Force a solid background here regardless of what
        // the ambient theme set for card surfaces.
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "#15151d" : "#ffffff"),
        backgroundImage: "none",
      }}
    >
      {children}
      {input === "" || insensitiveContains([...optionsMap.values()], input) ? null : (
        <>
          <Divider />
          {extenderButtons(input).map(({ label, href }, idx) => (
            <Button
              key={`ExtenderButton#${idx}`}
              color="primary"
              fullWidth
              sx={{ justifyContent: "flex-start", pl: 2 }}
              onMouseDown={() => {
                const link = document.createElement("a");
                link.href = href;
                link.click();
              }}
            >
              {label}
            </Button>
          ))}
        </>
      )}
    </Paper>
  );
}

function insensitiveContains(array, value) {
  return array.findIndex((element) => element.toLowerCase() === value.toLowerCase()) !== -1;
}

// The following function gets the map key based on a value input
function getKeyByValue(map, searchValue) {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  // Return a default value (e.g., null) if the value is not found
  return null;
}
