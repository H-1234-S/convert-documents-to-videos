import { Prisma } from "@/generated/prisma/client";

export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): string {
  switch (error.code) {
    case "P2002":
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0] || "field";
      return `A record with this ${field} already exists`;

    case "P2003":
      return "Related record not found";

    case "P2025":
      return "Record not found";

    case "P2014":
      return "This operation would violate a required relation";

    case "P2000":
      return "Input value is too long for the field";

    case "P2001":
      return "Record does not exist";

    case "P2015":
      return "Related record could not be found";

    case "P2016":
      return "Query interpretation error";

    case "P2021":
      return "Table does not exist in the database";

    case "P2022":
      return "Column does not exist in the database";

    case "P2023":
      return "Inconsistent column data";

    default:
      return "Database operation failed";
  }
}
