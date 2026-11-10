// A nonempty query can offer an extender unless it already names an option.
export function shouldOfferExtenders(input, optionLabels) {
  return input !== "" && !optionLabels.some((label) => label.toLowerCase() === input.toLowerCase());
}
