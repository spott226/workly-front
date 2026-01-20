export default function TerminosInternosPage() {
  return (
    <main className="bg-neutral-50 min-h-screen">
      <article className="max-w-3xl mx-auto px-6 sm:px-10 py-24">

        {/* Header */}
        <header className="text-center space-y-6 mb-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">
            Términos y Condiciones Internos
          </h1>

          <p className="text-sm text-neutral-500">
            Última actualización:{' '}
            {new Date().toLocaleDateString('es-MX')}
          </p>

          <p className="text-lg text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Los presentes Términos regulan el acceso y uso de la plataforma{' '}
            <strong>Workly</strong> por parte de negocios, empresas o personas
            físicas que contratan el servicio.
          </p>
        </header>

        {/* Content */}
        <section className="space-y-16 text-neutral-800 leading-relaxed">

          <LegalSection title="1. Naturaleza del servicio">
            <p>
              Workly es una plataforma tecnológica tipo SaaS que proporciona
              infraestructura digital para la gestión de citas, personal,
              servicios y procesos operativos del negocio.
            </p>
            <p>
              Workly no presta servicios profesionales, no administra negocios,
              no gestiona personal ni interviene en la relación entre el negocio
              y sus clientes finales.
            </p>
          </LegalSection>

          <LegalSection title="2. Relación contractual">
            <p>
              La relación entre Workly y el negocio es exclusivamente de carácter
              tecnológico y contractual por el uso del software.
            </p>
            <p>
              Ninguna disposición de estos Términos crea relación laboral,
              societaria, de representación, agencia o asociación entre las
              partes.
            </p>
          </LegalSection>

          <LegalSection title="3. Responsabilidades del negocio">
            <p>El negocio es el único y exclusivo responsable de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La prestación de servicios a sus clientes</li>
              <li>La gestión y supervisión de su personal</li>
              <li>El cumplimiento de obligaciones legales, fiscales y laborales</li>
              <li>La veracidad de la información registrada en la plataforma</li>
              <li>Las políticas de precios, cancelaciones y reembolsos</li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Uso del sistema">
            <p>
              El negocio es responsable del uso que realicen sus usuarios,
              empleados o terceros autorizados dentro de la plataforma.
            </p>
            <p>
              Workly no será responsable por errores de configuración,
              omisiones, malas prácticas operativas o decisiones tomadas por
              el negocio.
            </p>
          </LegalSection>

          <LegalSection title="5. Disponibilidad y soporte">
            <p>
              Workly no garantiza disponibilidad continua o ininterrumpida del
              servicio. Podrán presentarse interrupciones por mantenimiento,
              actualizaciones, infraestructura de terceros o causas ajenas.
            </p>
            <p>
              Workly brindará soporte técnico y realizará esfuerzos razonables
              para atender incidencias conforme a la naturaleza del problema.
            </p>
          </LegalSection>

          <LegalSection title="6. Limitación de responsabilidad">
            <p>
              Workly no será responsable por daños directos o indirectos,
              pérdidas económicas, pérdida de información, conflictos
              laborales, sanciones legales o reclamaciones de terceros
              derivadas del uso de la plataforma.
            </p>
          </LegalSection>

          <LegalSection title="7. Suspensión o terminación">
            <p>
              Workly podrá suspender o cancelar el acceso al sistema en caso de
              uso indebido, incumplimiento de estos Términos o por razones de
              seguridad, sin que ello genere derecho a reembolso alguno.
            </p>
          </LegalSection>

          <LegalSection title="8. Pagos, facturación y política de no devoluciones">
            <p>
              El acceso a Workly está sujeto al pago de las tarifas vigentes
              acordadas entre las partes bajo esquemas de pago mensual,
              recurrente u otros modelos definidos.
            </p>

            <p>
              El negocio reconoce que los pagos corresponden al acceso y
              disponibilidad del software, independientemente del uso efectivo.
            </p>

            <p className="font-medium">
              Todos los pagos realizados a Workly son definitivos y no
              reembolsables, incluyendo:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Falta de uso de la plataforma</li>
              <li>Desconocimiento del funcionamiento del sistema</li>
              <li>Errores de configuración del negocio</li>
              <li>Resultados comerciales no esperados</li>
              <li>Cancelación anticipada</li>
              <li>Suspensión por incumplimiento</li>
            </ul>
          </LegalSection>

          <LegalSection title="9. Fallas del servicio, soporte y no cancelación">
            <p>
              El negocio reconoce que, como cualquier plataforma tecnológica,
              Workly puede presentar fallas técnicas, errores o interrupciones
              temporales.
            </p>

            <p>
              Dichas fallas no constituyen incumplimiento contractual ni serán
              causa de cancelación, rescisión o reembolso.
            </p>

            <p className="font-medium">
              Bajo ninguna circunstancia las fallas darán lugar a devoluciones,
              descuentos, compensaciones o penalizaciones.
            </p>
          </LegalSection>

          <LegalSection title="10. Cancelación del servicio por parte del negocio">
            <p>
              El negocio podrá solicitar la cancelación del servicio en
              cualquier momento, notificando con al menos{' '}
              <strong>cinco (5) días naturales de anticipación</strong> al cierre
              de su periodo de facturación vigente.
            </p>

            <p>
              Las solicitudes fuera de dicho plazo no impedirán el cobro del
              siguiente periodo.
            </p>

            <p>
              La cancelación no genera derecho a reembolso total o parcial y el
              servicio permanecerá activo hasta el término del periodo pagado.
            </p>
          </LegalSection>

          <LegalSection title="11. Ley aplicable">
            <p>
              Estos Términos se rigen por las leyes de los Estados Unidos
              Mexicanos.
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
