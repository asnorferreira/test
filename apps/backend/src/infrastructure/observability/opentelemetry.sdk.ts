import { Logger } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-metrics-prometheus';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

export class OpenTelemetrySdk {
  private static readonly logger = new Logger(OpenTelemetrySdk.name);
  private static sdk: NodeSDK;

  static start() {
    if (this.sdk) {
      this.logger.warn('OpenTelemetry SDK já iniciado.');
      return;
    }

    const serviceName =
      process.env.OTEL_SERVICE_NAME || 'condominio-backend';
    const traceExporterUrl =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      'http://localhost:4318/v1/traces';

    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    });

    const traceExporter = new OTLPTraceExporter({
      url: traceExporterUrl,
    });

    const metricReader = new PrometheusExporter({
      port: 9464,
    });

    this.sdk = new NodeSDK({
      resource: resource,
      traceExporter: traceExporter,
      metricReader: metricReader,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          '@prisma/instrumentation': {
          },
        }),
      ],
    });

    try {
      this.sdk.start();
      this.logger.log(
        `OpenTelemetry SDK iniciado. Exportando traces para [${traceExporterUrl}]`,
      );
      this.logger.log(
        `Métricas Prometheus disponíveis em http://localhost:9464/metrics`,
      );
    } catch (error) {
      this.logger.error('Falha ao iniciar OpenTelemetry SDK', error);
      process.exit(1);
    }

    process.on('SIGTERM', () => {
      this.sdk
        .shutdown()
        .then(() => this.logger.log('Tracing finalizado.'))
        .catch((error) =>
          this.logger.error('Erro ao finalizar tracing', error),
        )
        .finally(() => process.exit(0));
    });
  }
}