function parseCookie<T extends string>(
  cookie: string,
  key: string
): T | undefined {
  const find = cookie.split(";").find((str) => str.startsWith(`${key}=`));

  return find?.split("=")[1] as T | undefined;
}

export default parseCookie;
