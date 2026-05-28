export function computedClassNames(classesObj: { [key: string]: unknown }): string {
  let classes = "";

  for (const key in classesObj) {
    if (classesObj[key] && key) {
      const trimmed = key.trim();

      if (trimmed) {
        classes += (classes ? " " : "") + trimmed;
      }
    }
  }

  return classes;
}
