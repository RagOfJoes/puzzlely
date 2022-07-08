const isUUID = (str: string) => {
  const pattern =
    '^{?[A-Z0-9a-z]{8}-[A-Z0-9a-z]{4}-[A-Z0-9a-z]{4}-[A-Z0-9a-z]{4}-[A-Z0-9a-z]{12}}?$';

  return !!str.match(pattern);
};

export default isUUID;
