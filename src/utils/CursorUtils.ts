export class CursorUtils {
  /**
   * Genera un cursor basado en timestamp + ID
   * @param timestamp - Date object o string ISO con timezone
   * @param id - UUID del registro
   */
  static generateCursor(timestamp: Date | string, id: string): string {
    // Convertir a ISO string si es Date, mantener si ya es string
    const timestampStr =
      timestamp instanceof Date ? timestamp.toISOString() : timestamp;

    const cursorData = `${timestampStr}|${id}`;
    return Buffer.from(cursorData).toString('base64');
  }

  /**
   * Decodifica un cursor para obtener timestamp e ID
   * @param cursor - Cursor en formato base64
   * @returns Objeto con timestamp e ID
   * @throws Error si el formato del cursor es inválido
   */
  static parseCursor(cursor: string): { timestamp: Date; id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString();
      const [timestampStr, id] = decoded.split('|');

      return {
        timestamp: new Date(timestampStr),
        id,
      };
    } catch (error) {
      console.error('Error parsing cursor:', error);
      throw new Error('Invalid cursor format');
    }
  }

  /**
   * Genera PageInfo para respuestas paginadas
   * @param items - Array de items obtenidos
   * @param limit - Límite de items por página
   * @param cursor - Cursor para la paginación
   * @returns Objeto con los items y la información de la página
   * @throws Error si el formato del cursor es inválido
   */
  static generatePageInfo<T extends Record<string, any>>(
    items: T[],
    limit: number,
    cursor?: string,
    timestampField = 'createdAt',
    idField = 'courseId',
  ) {
    const hasNextPage = items.length > limit;
    if (hasNextPage) {
      items.pop();
    }

    const pageInfo = {
      hasNextPage: hasNextPage,
      hasPreviousPage: !!cursor,
      nextCursor:
        hasNextPage && items.length > 0
          ? this.generateCursor(
              items[items.length - 1][timestampField] as Date | string,
              items[items.length - 1][idField] as string,
            )
          : null,
      previousCursor:
        items.length > 0
          ? this.generateCursor(
              items[0][timestampField] as Date | string,
              items[0][idField] as string,
            )
          : null,
    };

    return { items, pageInfo };
  }
}
