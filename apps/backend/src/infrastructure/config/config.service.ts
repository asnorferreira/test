import { appConfig, dbConfig, oidcConfig, servicesConfig } from './configs';

export type AppConfig = ReturnType<typeof appConfig>;
export type DbConfig = ReturnType<typeof dbConfig>;
export type OidcConfig = ReturnType<typeof oidcConfig>;
export type ServicesConfig = ReturnType<typeof servicesConfig>;

export type RootConfig = {
  app: AppConfig;
  database: DbConfig;
  oidc: OidcConfig;
  services: ServicesConfig;
};