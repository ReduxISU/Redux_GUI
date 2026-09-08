import React, { useState } from "react";
import { Autocomplete, TextField, Paper, Divider, Button, ListSubheader } from "@mui/material";

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
  // Optional sectioning: (key) => group label, e.g. a problem's complexity
  // class. Options are sorted by group first (falling back to optionsHighlight/
  // alphabetical within a group) so MUI Autocomplete can render section headers.
  groupBy = null,
  // Optional explicit ordering for group labels (e.g. ["P", "NPComplete", ...]).
  // Falls back to alphabetical when omitted.
  groupOrder = null,
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
      groupBy={groupBy ? (option) => groupBy(getKeyByValue(optionsMap, option)) ?? "Unclassified" : undefined}
      // Bolds the group header so it reads as a section divider, not a selectable option.
      renderGroup={
        groupBy
          ? (params) => (
            <li key={params.key}>
              <ListSubheader sx={{ fontWeight: 700 }}>{params.group}</ListSubheader>
              {params.children}
            </li>
          )
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
      // rank-and-de-emphasize usage) and/or disabled (optionsDisabled, not clickable, e.g.
      // "no renderer available") options.
      renderOption={
        optionsHighlight || optionsDisabled
          ? (props, option) => {
            const key = getKeyByValue(optionsMap, option);
            const isDeemphasized = optionsHighlight ? !optionsHighlight.includes(key) : false;
            const isDisabledOption = optionsDisabled ? optionsDisabled.includes(key) : false;
            return (
              <li {...props} style={isDeemphasized ? { opacity: 0.5 } : null}>
                {option}
                {isDisabledOption && disabledOptionHint ? ` (${disabledOptionHint})` : ""}
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
