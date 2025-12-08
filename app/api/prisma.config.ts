
export default {

  schema: "./prisma/schema.prisma",
  datasource: {
    db: {
      url: { fromEnvVar: "DATABASE_URL" },
    },
  },
}
