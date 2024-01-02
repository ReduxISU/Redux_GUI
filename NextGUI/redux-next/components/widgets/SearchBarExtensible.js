import React, { useState } from "react";
import { Autocomplete, TextField, Paper, Divider, Button } from "@mui/material";

export default function SearchBarExtensible({
  selected,
  onSelect,
  placeholder,
  options,
  optionsMap,
  disabled = false,
  disabledMessage = "",
  extenderButtons = [],
  ...props
}) {
  const [input, setInput] = useState("");

  return (
    <Autocomplete
      {...props}
      PaperComponent={({ children }) => (
        <SearchBarPaper input={input} optionsMap={optionsMap} extenderButtons={extenderButtons}>
          {children}
        </SearchBarPaper>
      )}
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
      options={options.map((x) => optionsMap.get(x) ?? x)}
      disabled={disabled}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      sx={{ width: 300 }}
      style={{ width: "100%" }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={placeholder}
          InputProps={disabled ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );
}

function SearchBarPaper({ children, input, optionsMap, extenderButtons }) {
  return (
    <Paper>
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
