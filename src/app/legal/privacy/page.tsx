export default function PrivacidadInternaPage() {
  return (
    <main className="bg-neutral-50 min-h-screen">
      <article className="max-w-3xl mx-auto px-6 sm:px-10 py-24">

        {/* Header */}
        <header className="text-center space-y-6 mb-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
            Política de Privacidad Interna
          </h1>

          <p className="text-sm text-neutral-500">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-MX')}
          </p>

          <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Esta Política regula el tratamiento de los datos personales
            gestionados dentro de la plataforma <strong>Workly</strong> por los
            negocios que contratan el servicio.
          </p>
        </header>

        {/* Content */}
        <section className="space-y-16 text-neutral-800 leading-relaxed">

          <LegalSection title="1. Marco legal">
            <p>
              El tratamiento de los datos personales se realiza conforme a la Ley
              Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP), su Reglamento y los lineamientos del
              Instituto Nacional de Transparencia, Acceso a la Información y
              Protección de Datos Personales (INAI).
            </p>
          </LegalSection>

          <LegalSection title="2. Responsable y encargado">
            <p>
              El negocio es el{' '}
              <strong>responsable del tratamiento</strong> de los datos
              personales de sus clientes, empleados y usuarios internos.
            </p>
            <p>
              <strong>Workly</strong> actúa exclusivamente como{' '}
              <strong>encargado del tratamiento</strong>, proporcionando
              infraestructura tecnológica sin decidir finalidades ni medios del
              tratamiento.
            </p>
          </LegalSection>

          <LegalSection title="3. Datos tratados">
            <p>
              El negocio puede registrar datos personales de clientes, empleados
              y personal interno conforme a sus propias finalidades,
              procedimientos y responsabilidades legales.
            </p>
          </LegalSection>

          <LegalSection title="4. Finalidades">
            <p>
              Los datos se utilizan para la operación interna del negocio,
              administración de citas, gestión de personal, servicios,
              métricas internas y generación de reportes.
            </p>
          </LegalSection>

          <LegalSection title="5. Derechos ARCO">
            <p>
              El ejercicio de los derechos de Acceso, Rectificación,
              Cancelación y Oposición corresponde exclusivamente al negocio
              responsable del tratamiento.
            </p>
            <p>
              Workly colaborará conforme a la legislación aplicable, sin asumir
              responsabilidad directa frente a los titulares de los datos.
            </p>
          </LegalSection>

          <LegalSection title="6. Seguridad">
            <p>
              Workly implementa medidas técnicas, administrativas y
              organizativas razonables para proteger la información contra
              accesos no autorizados, pérdida o uso indebido, sin garantizar
              seguridad absoluta.
            </p>
          </LegalSection>

          <LegalSection title="7. Cambios">
            <p>
              Esta Política podrá modificarse en cualquier momento. Las
              versiones vigentes estarán disponibles dentro de la plataforma
              y entrarán en vigor a partir de su publicación.
            </p>
          </LegalSection>

        </section>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Workly. Todos los derechos reservados.
          </p>
        </footer>

      </article>
    </main>
  );
}

/* Helper */
function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-900">
        {title}
      </h2>
      <div className="space-y-3 text-neutral-700">
        {children}
      </div>
    </section>
  );
}
