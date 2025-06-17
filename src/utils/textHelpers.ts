// File: src/utils/textHelpers.ts
export function adjustTextToFitWidth(
  element: HTMLElement,
  referenceWidth: number,
  maxLines = 1,
  minFontSize = 10,
  maxIterations = 50
): void {
  if (
    !element ||
    typeof window.getComputedStyle !== "function" ||
    referenceWidth <= 0
  )
    return;
  element.style.whiteSpace = "normal";
  let iterations = 0;
  let currentFontSize = parseFloat(window.getComputedStyle(element).fontSize);
  let currentLineHeight = parseFloat(
    window.getComputedStyle(element).lineHeight
  );
  if (isNaN(currentLineHeight) || currentLineHeight === 0)
    currentLineHeight = currentFontSize * 1.2;
  let maxAllowedHeight = currentLineHeight * maxLines;
  while (
    (element.scrollHeight > maxAllowedHeight ||
      element.scrollWidth > referenceWidth) &&
    currentFontSize > minFontSize &&
    iterations < maxIterations
  ) {
    currentFontSize -= 1;
    if (currentFontSize < minFontSize) currentFontSize = minFontSize;
    element.style.fontSize = `${currentFontSize}px`;
    currentLineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
    if (isNaN(currentLineHeight) || currentLineHeight === 0)
      currentLineHeight = currentFontSize * 1.2;
    maxAllowedHeight = currentLineHeight * maxLines;
    element.offsetHeight;
    if (
      (element.scrollHeight <= maxAllowedHeight &&
        element.scrollWidth <= referenceWidth) ||
      currentFontSize === minFontSize
    )
      break;
    iterations++;
  }
}

export function ensureAddressSmallerThanSubheader(
  addressElement: HTMLElement,
  subheaderElement: HTMLElement,
  minFontSize = 8,
  pixelDifference = 2
): void {
  if (!addressElement || !subheaderElement) return;
  let addressFontSize = parseFloat(
    window.getComputedStyle(addressElement).fontSize
  );
  const subheaderFontSize = parseFloat(
    window.getComputedStyle(subheaderElement).fontSize
  );
  while (
    addressFontSize > subheaderFontSize - pixelDifference &&
    addressFontSize > minFontSize
  ) {
    addressFontSize -= 1;
    if (addressFontSize < minFontSize) addressFontSize = minFontSize;
    addressElement.style.fontSize = `${addressFontSize}px`;
    if (
      addressFontSize <= subheaderFontSize - pixelDifference ||
      addressFontSize === minFontSize
    )
      break;
  }
  if (
    addressFontSize >= subheaderFontSize &&
    addressFontSize > minFontSize &&
    pixelDifference > 0
  ) {
    addressFontSize -= 1;
    if (addressFontSize < minFontSize) addressFontSize = minFontSize;
    addressElement.style.fontSize = `${addressFontSize}px`;
  }
}
