export function blurSx(blurred: boolean) {
  return {
    filter: blurred ? "blur(6px)" : "none",
    userSelect: blurred ? ("none" as const) : ("auto" as const),
    transition: "filter 0.2s",
  };
}
