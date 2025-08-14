export const toPgTuple = (arr: any[]) =>
  `(${arr
    .map((val) =>
      val === null || val === undefined
        ? 'NULL'
        : `'${String(val).replace(/'/g, "''")}'`,
    )
    .join(',')})`;
