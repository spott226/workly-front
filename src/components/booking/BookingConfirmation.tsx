'use client';

type Props = {
  onClose?: () => void;
};

export function BookingConfirmation({ onClose }: Props) {
  return (
    <div className="w-full max-w-md mx-auto border rounded-lg bg-white p-6 sm:p-8 text-center space-y-4">
      <h2 className="text-lg sm:text-xl font-bold">
        ¡Cita confirmada!
      </h2>

      <p className="text-sm sm:text-base text-gray-500">
        Tu cita fue registrada correctamente.
      </p>

      <p className="text-sm">
        Te esperamos. 🙌
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto mt-4 px-6 py-2 text-sm bg-black text-white rounded-md"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
