// tslint:disable-next-line:variable-name
export const JSONcamelCaseReviver = (key: any, value: any) => {
  if (value && typeof value === "object") {
    for (const k in value) {
      if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
        value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
        delete value[k];
      }
    }
  }
  return value;
};
