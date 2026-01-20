export default function PrivacidadPage() {
  return (
    <main className="bg-neutral-50 min-h-screen">
      <article className="max-w-3xl mx-auto px-6 sm:px-10 py-24">

        {/* Header */}
        <header className="text-center space-y-6 mb-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
            Política de Privacidad
          </h1>

          <p className="text-sm text-neutral-500">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-MX')}
          </p>

          <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            La presente Política describe el tratamiento de los datos personales
            de las personas que utilizan el sistema de agendamiento operado
            mediante <strong>Workly</strong>.
          </p>
        </header>

        {/* Content */}
        <section className="space-y-16 text-neutral-800 leading-relaxed">

          <LegalSection title="1. Marco legal aplicable">
            <p>
              El tratamiento de los datos personales se realiza conforme a la Ley
              Federal de Protección de Datos Personales en Posesión de los
              Particulares (LFPDPPP), su Reglamento, los lineamientos del Instituto
              Nacional de Transparencia, Acceso a la Información y Protección de
              Datos Personales (INAI) y demás disposiciones aplicables en los
              Estados Unidos Mexicanos.
            </p>
          </LegalSection>

          <LegalSection title="2. Roles y responsabilidades">
            <p>
              El negocio con el que se agenda la cita es el{' '}
              <strong>responsable del tratamiento</strong> de los datos personales
              proporcionados por el usuario.
            </p>
            <p>
              <strong>Workly</strong> actúa exclusivamente como{' '}
              <strong>encargado del tratamiento</strong>, limitándose a
              proporcionar infraestructura tecnológica para la gestión de citas,
              sin control sobre las decisiones comerciales, operativas o
              administrativas del negocio.
            </p>
          </LegalSection>

          <LegalSection title="3. Datos personales recabados">
            <ul className="list-disc pl-6 space-y-2">
              <li>Nombre y apellidos</li>
              <li>Número telefónico</li>
              <li>Correo electrónico</li>
              <li>Información relacionada con la cita</li>
              <li>Datos técnicos y de uso del sistema</li>
            </ul>
            <p className="text-sm text-neutral-600">
              Workly no solicita ni trata datos personales sensibles.
            </p>
          </LegalSection>

          <LegalSection title="4. Finalidades del tratamiento">
            <p>
              Los datos personales se utilizan exclusivamente para gestionar la
              cita, facilitar la comunicación entre el usuario y el negocio,
              brindar soporte técnico, mantener la operación del sistema y
              mejorar la experiencia del servicio.
            </p>
          </LegalSection>

          <LegalSection title="5. Derechos ARCO">
            <p>
              El titular de los datos puede ejercer sus derechos de Acceso,
              Rectificación, Cancelación y Oposición directamente ante el negocio
              responsable del tratamiento.
            </p>
            <p>
              Workly colaborará, en su carácter de encargado del tratamiento,
              conforme a la legislación aplicable.
            </p>
          </LegalSection>

          <LegalSection title="6. Medidas de seguridad">
            <p>
              Workly implementa medidas técnicas, administrativas y organizativas
              razonables para proteger los datos personales contra accesos no
              autorizados, pérdida, alteración o uso indebido.
            </p>
          </LegalSection>

          <LegalSection title="7. Cambios a esta Política">
            <p>
              Esta Política podrá modificarse en cualquier momento. Las versiones
              vigentes estarán disponibles en esta sección y entrarán en vigor a
              partir de su publicación.
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
