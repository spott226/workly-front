export default function TerminosPage() {
  return (
    <main className="bg-neutral-50 min-h-screen">
      <article className="max-w-3xl mx-auto px-6 sm:px-10 py-24">

        {/* Header */}
        <header className="text-center space-y-6 mb-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
            Términos y Condiciones
          </h1>

          <p className="text-sm text-neutral-500">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-MX')}
          </p>

          <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Al utilizar el sistema de agendamiento operado mediante{' '}
            <strong>Workly</strong>, el usuario acepta los presentes Términos
            y Condiciones.
          </p>
        </header>

        {/* Content */}
        <section className="space-y-16 text-neutral-800 leading-relaxed">

          <LegalSection title="1. Naturaleza del servicio">
            <p>
              Workly es una plataforma tecnológica que proporciona infraestructura
              digital para facilitar la gestión de citas entre negocios y sus
              clientes.
            </p>
            <p>
              Workly no presta, supervisa ni garantiza los servicios ofrecidos por
              los negocios y no interviene en la relación contractual entre el
              usuario y el negocio.
            </p>
          </LegalSection>

          <LegalSection title="2. Relación con el negocio">
            <p>
              Al agendar una cita, el usuario establece una relación directa y
              exclusiva con el negocio seleccionado.
            </p>
            <p>
              Cualquier reclamación relacionada con el servicio, horarios,
              cancelaciones, precios, calidad, resultados o trato deberá
              realizarse directamente con el negocio.
            </p>
          </LegalSection>

          <LegalSection title="3. Obligaciones del usuario">
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar información veraz y actualizada</li>
              <li>Respetar los horarios y condiciones del negocio</li>
              <li>Mantener una conducta respetuosa</li>
              <li>Cumplir con las políticas establecidas por el negocio</li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Cancelaciones y cambios">
            <p>
              Las políticas de cancelación, reprogramación, penalizaciones o
              reembolsos son determinadas exclusivamente por el negocio.
            </p>
            <p>
              Workly no es responsable por disputas derivadas de dichas políticas.
            </p>
          </LegalSection>

          <LegalSection title="5. Limitación de responsabilidad">
            <p>
              Workly no será responsable por daños directos o indirectos,
              pérdidas económicas, lesiones, conflictos o reclamaciones
              derivadas del servicio prestado por el negocio.
            </p>
          </LegalSection>

          <LegalSection title="6. Modificaciones">
            <p>
              Estos Términos podrán modificarse en cualquier momento.
              Las versiones vigentes estarán disponibles en esta sección.
            </p>
          </LegalSection>

          <LegalSection title="7. Ley aplicable">
            <p>
              Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos.
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

/* Componente helper */
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
